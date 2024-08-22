import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { Composition, Layer, Mask } from '../store/slices/timelineSlice';
import { initThreeJS, resizeThreeJS, createCustomShaderPass } from './threeUtils';
import { interpolateKeyframes } from './animationUtils';
import { evaluateExpression } from './expressionEvaluator';
import { frameCache } from './frameCache';
import vertexShader from '../shaders/vertexShader.glsl';
import fragmentShader from '../shaders/fragmentShader.glsl';

export const renderComposition = async (
    composition: Composition,
    progressCallback: (progress: number) => void
): Promise<Blob> => {
    const { width, height, duration, frameRate } = composition;
    const totalFrames = Math.ceil(duration * frameRate);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const { renderer, scene, camera, composer } = initThreeJS(canvas, width, height);

    const customShaderPass = createCustomShaderPass(vertexShader, fragmentShader);
    composer.addPass(customShaderPass);

    const frames: Blob[] = [];

    for (let frame = 0; frame < totalFrames; frame++) {
        const time = frame / frameRate;
        const cacheKey = `${composition.id}-${frame}`;
        let texture = frameCache.getFrame(cacheKey);

        if (!texture) {
            renderFrame(composition, scene, time);
            composer.render();
            texture = new THREE.CanvasTexture(renderer.domElement);
            frameCache.setFrame(cacheKey, texture);
        }

        const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        frames.push(blob);

        progressCallback((frame + 1) / totalFrames * 100);
    }

    // Clean up
    renderer.dispose();
    composer.dispose();

    // Combine frames into a video (you might want to use a library like ffmpeg.js for this)
    // For this example, we'll just return the first frame as a placeholder
    return frames[0];
};

const renderFrame = (composition: Composition, scene: THREE.Scene, time: number) => {
    // Clear existing objects
    scene.children = scene.children.filter(child => child.type === 'AmbientLight' || child.type === 'DirectionalLight');

    // Render layers
    const layerObjects = createLayerObjects(composition, time);
    applyParenting(layerObjects, composition);
    applyMotionBlur(layerObjects, composition, scene, time);

    // Add objects to the scene
    Object.values(layerObjects).forEach(object => {
        if (object.parent === null) {
            scene.add(object);
        }
    });
};

const createLayerObjects = (composition: Composition, time: number): { [key: string]: THREE.Object3D } => {
    const layerObjects: { [key: string]: THREE.Object3D } = {};

    composition.layers.forEach((layer) => {
        if (time >= layer.startTime && time < layer.startTime + layer.duration) {
            const object = createLayerObject(layer, composition, time);
            if (object) {
                layerObjects[layer.id] = object;
            }
        }
    });

    return layerObjects;
};

const createLayerObject = (layer: Layer, composition: Composition, time: number): THREE.Object3D | null => {
    switch (layer.type) {
        case 'solid':
            return createSolidLayer(layer, time);
        case 'image':
            return createImageLayer(layer, time);
        case 'video':
            return createVideoLayer(layer, time);
        case 'precomposition':
            return createPrecompositionLayer(layer, composition, time);
        default:
            return null;
    }
};

const applyParenting = (layerObjects: { [key: string]: THREE.Object3D }, composition: Composition) => {
    composition.layers.forEach((layer) => {
        const object = layerObjects[layer.id];
        if (object && layer.parentId && layerObjects[layer.parentId]) {
            layerObjects[layer.parentId].add(object);
        }
    });
};

const applyMotionBlur = (layerObjects: { [key: string]: THREE.Object3D }, composition: Composition, scene: THREE.Scene, time: number) => {
    composition.layers.forEach((layer) => {
        if (layer.motionBlur && layerObjects[layer.id]) {
            const object = layerObjects[layer.id];
            const blurredObject = new THREE.Group();

            for (let i = 0; i < layer.motionBlurSamples; i++) {
                const t = time - (i / layer.motionBlurSamples) * (1 / composition.frameRate);
                const sampleObject = object.clone();
                applyLayerTransform(sampleObject, layer, t);
                blurredObject.add(sampleObject);
            }

            blurredObject.children.forEach((child) => {
                if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
                    child.material.opacity = 1 / layer.motionBlurSamples;
                    child.material.transparent = true;
                }
            });

            scene.add(blurredObject);
        }
    });
};

const createSolidLayer = (layer: Layer, time: number): THREE.Mesh => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: layer.backgroundColor || 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
};

const createImageLayer = (layer: Layer, time: number): THREE.Mesh => {
    const texture = new THREE.TextureLoader().load(layer.source);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
};

const createVideoLayer = (layer: Layer, time: number): THREE.Mesh => {
    // For rendering, we'll use a static frame of the video
    const video = document.createElement('video');
    video.src = layer.source!;
    video.currentTime = time - layer.startTime;
    const texture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
};

const createPrecompositionLayer = (layer: Layer, parentComposition: Composition, time: number): THREE.Group => {
    const precomp = parentComposition.layers.find(l => l.id === layer.precompId);
    if (!precomp) return new THREE.Group();

    const group = new THREE.Group();
    renderFrame({ ...parentComposition, layers: [precomp] }, group, time - layer.startTime);
    applyLayerTransform(group, layer, time);
    return group;
};

const applyLayerTransform = (object: THREE.Object3D, layer: Layer, time: number) => {
    const position = getPropertyValue(layer, 'position', time);
    const scale = getPropertyValue(layer, 'scale', time);
    const rotation = getPropertyValue(layer, 'rotation', time);
    const opacity = getPropertyValue(layer, 'opacity', time)[0];
    const anchorPoint = getPropertyValue(layer, 'anchorPoint', time);

    object.position.set(position[0], position[1], layer.is3D ? position[2] : 0);
    object.scale.set(scale[0], scale[1], layer.is3D ? scale[2] : 1);

    if (layer.is3D) {
        object.rotation.set(rotation[0], rotation[1], rotation[2]);
    } else {
        object.rotation.z = rotation[0];
    }

    object.position.sub(new THREE.Vector3(anchorPoint[0], anchorPoint[1], layer.is3D ? anchorPoint[2] : 0));

    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
        object.material.opacity = opacity;
        object.material.transparent = opacity < 1;
    }

    applyBlendingMode(object, layer);
};

const getPropertyValue = (layer: Layer, property: keyof Layer['transform'], time: number): number[] => {
    const transform = layer.transform[property];
    const expression = layer.transform.expressions[property];

    if (expression && expression.enabled) {
        return evaluateExpression(expression.code, { time, layer });
    }

    if (Array.isArray(transform)) {
        return interpolateKeyframes(transform, time);
    }

    return transform as number[];
};

const applyBlendingMode = (object: THREE.Object3D, layer: Layer) => {
    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshBasicMaterial) {
        switch (layer.blendingMode) {
            case 'add':
                object.material.blending = THREE.AdditiveBlending;
                break;
            case 'multiply':
                object.material.blending = THREE.MultiplyBlending;
                break;
            case 'screen':
                object.material.blending = THREE.CustomBlending;
                object.material.blendSrc = THREE.OneFactor;
                object.material.blendDst = THREE.OneMinusSrcColorFactor;
                break;
            case 'overlay':
                // Overlay is not directly supported in Three.js, so we'll use a custom shader
                object.material.onBeforeCompile = (shader) => {
                    shader.fragmentShader = shader.fragmentShader.replace(
                        'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                        `
                if (gl_FragColor.r < 0.5) {
                  gl_FragColor.rgb *= 2.0 * gl_FragColor.rgb;
                } else {
                  gl_FragColor.rgb = 1.0 - 2.0 * (1.0 - gl_FragColor.rgb) * (1.0 - gl_FragColor.rgb);
                }
                gl_FragColor = vec4(outgoingLight, diffuseColor.a);
              `
                    );
                };
                break;
            default:
                object.material.blending = THREE.NormalBlending;
        }
    }
};

const applyMasks = (object: THREE.Object3D, layer: Layer, time: number) => {
    if (layer.masks && layer.masks.length > 0) {
        const geometry = (object as THREE.Mesh).geometry;
        const material = (object as THREE.Mesh).material as THREE.ShaderMaterial;

        const maskShapes = layer.masks.map(mask => createMaskShape(mask, time));
        const combinedShape = new THREE.Shape();

        maskShapes.forEach((shape, index) => {
            if (index === 0) {
                combinedShape.add(shape);
            } else {
                if (layer.masks[index].inverted) {
                    combinedShape.holes.push(shape);
                } else {
                    combinedShape.add(shape);
                }
            }
        });

        const maskGeometry = new THREE.ShapeGeometry(combinedShape);
        const maskMesh = new THREE.Mesh(maskGeometry, new THREE.MeshBasicMaterial({ color: 0xffffff }));

        material.uniforms.maskTexture = { value: new THREE.Texture(maskMesh) };
        material.uniforms.maskTexture.value.needsUpdate = true;
    }
};

const createMaskShape = (mask: Mask, time: number): THREE.Shape => {
    const shape = new THREE.Shape();
    const vertices = mask.path.vertices.map(v => new THREE.Vector2(v.x, v.y));

    if (vertices.length > 0) {
        shape.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            shape.lineTo(vertices[i].x, vertices[i].y);
        }
        if (mask.path.closed) {
            shape.closePath();
        }
    }

    return shape;
};

export const applyTrackMatte = (object: THREE.Object3D, layer: Layer, layers: Layer[], time: number) => {
    if (layer.trackMatteType && layer.trackMatteLayer) {
        const trackMatteLayer = layers.find(l => l.id === layer.trackMatteLayer);
        if (trackMatteLayer) {
            const trackMatteObject = createLayerObject(trackMatteLayer, { layers } as Composition, time);
            if (trackMatteObject) {
                const material = (object as THREE.Mesh).material as THREE.ShaderMaterial;
                material.uniforms.trackMatteTexture = { value: new THREE.Texture(trackMatteObject) };
                material.uniforms.trackMatteTexture.value.needsUpdate = true;
                material.uniforms.trackMatteType = { value: layer.trackMatteType };
            }
        }
    }
};