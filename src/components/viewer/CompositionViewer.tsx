import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { useAppSelector } from '../../hooks/useAppSelector';
import { Layer, Composition, Mask } from '../../store/slices/timelineSlice';
import { initThreeJS, resizeThreeJS, createCustomShaderPass } from '../../utils/threeUtils';
import { evaluateExpression } from '../../utils/expressionEvaluator';
import { interpolateKeyframes } from '../../utils/animationUtils';
import vertexShader from '../../shaders/vertexShader.glsl';
import fragmentShader from '../../shaders/fragmentShader.glsl';
import '../../styles/components/viewer/CompositionViewer.scss';

const CompositionViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.OrthographicCamera | null>(null);
  const [composer, setComposer] = useState<EffectComposer | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);

  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const compositions = useAppSelector(state => state.timeline.compositions);
  const currentTime = useAppSelector(state => state.timeline.currentTime);

  const activeComposition = useMemo(() => compositions.find(c => c.id === activeCompositionId), [compositions, activeCompositionId]);

  const initScene = useCallback(() => {
    if (containerRef.current && activeComposition) {
      const { renderer, scene, camera, composer } = initThreeJS(containerRef.current, activeComposition.width, activeComposition.height);
      setRenderer(renderer);
      setScene(scene);
      setCamera(camera);
      setComposer(composer);

      const newControls = new OrbitControls(camera, renderer.domElement);
      setControls(newControls);

      const customShaderPass = createCustomShaderPass(vertexShader, fragmentShader);
      composer.addPass(customShaderPass);

      return () => {
        renderer.dispose();
        composer.dispose();
        newControls.dispose();
      };
    }
  }, [activeComposition]);

  useEffect(() => {
    const cleanup = initScene();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initScene]);

  useEffect(() => {
    if (renderer && scene && camera && composer && activeComposition) {
      resizeThreeJS({ renderer, scene, camera, composer }, activeComposition.width, activeComposition.height);
    }
  }, [renderer, scene, camera, composer, activeComposition]);

  const renderLayers = useCallback((composition: Composition, scene: THREE.Scene, time: number) => {
    const layerObjects: { [key: string]: THREE.Object3D } = {};

    composition.layers.forEach((layer) => {
      if (time >= layer.startTime && time < layer.startTime + layer.duration) {
        const object = createLayerObject(layer, composition, time);
        if (object) {
          layerObjects[layer.id] = object;
        }
      }
    });

    // Apply parenting and add objects to the scene
    composition.layers.forEach((layer) => {
      const object = layerObjects[layer.id];
      if (object) {
        if (layer.parentId && layerObjects[layer.parentId]) {
          layerObjects[layer.parentId].add(object);
        } else {
          scene.add(object);
        }
      }
    });

    // Apply motion blur
    applyMotionBlur(layerObjects, composition, scene, time);
  }, []);

  const createLayerObject = useCallback((layer: Layer, composition: Composition, time: number): THREE.Object3D | null => {
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
  }, []);

  const applyMasks = useCallback((object: THREE.Object3D, layer: Layer, time: number) => {
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
  }, []);

  const createMaskShape = useCallback((mask: Mask, time: number): THREE.Shape => {
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
  }, []);

  const applyTrackMatte = useCallback((object: THREE.Object3D, layer: Layer, layers: Layer[], time: number) => {
    if (layer.trackMatteType && layer.trackMatteLayer) {
      const trackMatteLayer = layers.find(l => l.id === layer.trackMatteLayer);
      if (trackMatteLayer) {
        const trackMatteObject = createLayerObject(trackMatteLayer, { ...activeComposition!, layers }, time);
        if (trackMatteObject) {
          const material = (object as THREE.Mesh).material as THREE.ShaderMaterial;
          material.uniforms.trackMatteTexture = { value: new THREE.Texture(trackMatteObject) };
          material.uniforms.trackMatteTexture.value.needsUpdate = true;
          material.uniforms.trackMatteType = { value: layer.trackMatteType };
        }
      }
    }
  }, [activeComposition, createLayerObject]);

  const createSolidLayer = useCallback((layer: Layer, time: number): THREE.Mesh => {
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: layer.backgroundColor || 0xffffff });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
  }, []);

  const createImageLayer = useCallback((layer: Layer, time: number): THREE.Mesh => {
    const texture = new THREE.TextureLoader().load(layer.source);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
  }, []);

  const createVideoLayer = useCallback((layer: Layer, time: number): THREE.Mesh => {
    const video = document.createElement('video');
    video.src = layer.source;
    video.loop = true;
    video.muted = true;
    video.currentTime = time - layer.startTime;
    video.play();
    const texture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    applyLayerTransform(mesh, layer, time);
    return mesh;
  }, []);

  const createPrecompositionLayer = useCallback((layer: Layer, parentComposition: Composition, time: number): THREE.Group => {
    const precomp = compositions.find(c => c.id === layer.precompId);
    if (!precomp) return new THREE.Group();

    const group = new THREE.Group();
    renderLayers(precomp, group, time - layer.startTime);
    applyLayerTransform(group, layer, time);
    return group;
  }, [compositions, renderLayers]);

  const applyLayerTransform = useCallback((object: THREE.Object3D, layer: Layer, time: number) => {
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
  }, []);

  const applyMotionBlur = useCallback((layerObjects: { [key: string]: THREE.Object3D }, composition: Composition, scene: THREE.Scene, time: number) => {
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

        blurredObject.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = 1 / layer.motionBlurSamples;
            child.material.transparent = true;
          }
        });

        scene.add(blurredObject);
      }
    });
  }, [applyLayerTransform]);

  const applyBlendingMode = useCallback((object: THREE.Object3D, layer: Layer) => {
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
  }, []);

  const getPropertyValue = useCallback((layer: Layer, property: keyof Layer['transform'], time: number): number[] => {
    const transform = layer.transform[property];
    const expression = layer.transform.expressions[property];

    if (expression && expression.enabled) {
      return evaluateExpression(expression.code, { time, layer });
    }

    if (Array.isArray(transform)) {
      return interpolateKeyframes(transform, time);
    }

    return transform as number[];
  }, []);

  useEffect(() => {
    if (scene && camera && composer && activeComposition) {
      scene.children = scene.children.filter(child => child.type === 'AmbientLight' || child.type === 'DirectionalLight');

      renderLayers(activeComposition, scene, currentTime);

      if (controls) {
        controls.update();
      }

      composer.render();
    }
  }, [scene, camera, composer, controls, activeComposition, currentTime, renderLayers]);

  return <div ref={containerRef} className="composition-viewer" />;
};

export default CompositionViewer;
