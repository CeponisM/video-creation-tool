import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useAppSelector } from '../../hooks/useAppSelector';
import { createLayerObject, applyLayerTransform } from '../../utils/layerUtils';
import '../../styles/components/viewer/_CompositionViewer.scss';

const CompositionViewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.OrthographicCamera | null>(null);
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const [zoom, setZoom] = useState(1);

  const activeCompositionId = useAppSelector(state => state.timeline.activeCompositionId);
  const compositions = useAppSelector(state => state.timeline.compositions);
  const currentTime = useAppSelector(state => state.timeline.currentTime);
  const layers = useAppSelector(state => state.timeline.layers);

  const activeComposition = compositions.find(c => c.id === activeCompositionId);

  const initThreeJS = useCallback(() => {
    if (containerRef.current && activeComposition) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const newScene = new THREE.Scene();
      const aspectRatio = width / height;
      const newCamera = new THREE.OrthographicCamera(
        -aspectRatio, aspectRatio, 1, -1, 0.1, 1000
      );
      newCamera.position.z = 10;

      const newRenderer = new THREE.WebGLRenderer({ 
        canvas: canvasRef.current as HTMLCanvasElement, 
        antialias: true,
        alpha: true 
      });
      newRenderer.setSize(width, height);
      newRenderer.setPixelRatio(window.devicePixelRatio);

      const newControls = new OrbitControls(newCamera, canvasRef.current as HTMLCanvasElement);
      newControls.enableRotate = false;
      newControls.enablePan = true;
      newControls.enableZoom = true;
      newControls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
      };

      setScene(newScene);
      setCamera(newCamera);
      setRenderer(newRenderer);
      setControls(newControls);

      const handleResize = () => {
        if (containerRef.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          const aspectRatio = width / height;
          newCamera.left = -aspectRatio;
          newCamera.right = aspectRatio;
          newCamera.top = 1;
          newCamera.bottom = -1;
          newCamera.updateProjectionMatrix();
          newRenderer.setSize(width, height);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        newRenderer.dispose();
        newControls.dispose();
      };
    }
  }, [activeComposition]);

  useEffect(() => {
    const cleanup = initThreeJS();
    return () => {
      if (cleanup) cleanup();
    };
  }, [initThreeJS]);

  useEffect(() => {
    if (scene && camera && renderer && activeComposition) {
      scene.clear();

      // Add a grid helper
      const gridHelper = new THREE.GridHelper(20, 20);
      gridHelper.rotation.x = Math.PI / 2;
      scene.add(gridHelper);

      layers.forEach(layer => {
        if (currentTime >= layer.startTime && currentTime < layer.startTime + layer.duration) {
          const object = createLayerObject(layer, currentTime);
          if (object) {
            applyLayerTransform(object, layer, currentTime);
            scene.add(object);
          }
        }
      });

      renderer.render(scene, camera);
    }
  }, [scene, camera, renderer, activeComposition, layers, currentTime]);

  const handleZoom = (factor: number) => {
    if (camera) {
      const newZoom = zoom * factor;
      setZoom(newZoom);
      camera.zoom = newZoom;
      camera.updateProjectionMatrix();
      if (renderer && scene) {
        renderer.render(scene, camera);
      }
    }
  };

  const handleZoomIn = () => handleZoom(1.1);
  const handleZoomOut = () => handleZoom(0.9);

  const handleResetView = () => {
    if (camera && controls) {
      camera.position.set(0, 0, 10);
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      controls.reset();
      setZoom(1);
      if (renderer && scene) {
        renderer.render(scene, camera);
      }
    }
  };

  return (
    <div className="ae-composition-viewer" ref={containerRef}>
      <div className="ae-composition-viewer__canvas-container">
        <canvas ref={canvasRef} className="ae-composition-viewer__canvas" />
      </div>
      <div className="ae-composition-viewer__controls">
        <button onClick={handleZoomIn} className="ae-composition-viewer__control-btn">+</button>
        <button onClick={handleZoomOut} className="ae-composition-viewer__control-btn">-</button>
        <button onClick={handleResetView} className="ae-composition-viewer__control-btn">Reset</button>
        <span className="ae-composition-viewer__zoom-level">{(zoom * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default CompositionViewer;