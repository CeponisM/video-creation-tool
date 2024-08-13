import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { updateEvent, TimelineEvent } from '../store/slices/timelineSlice';
import { debounce } from 'lodash';
import '../styles/CompositionViewer.scss';

const CompositionViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { width, height, backgroundColor } = useAppSelector(state => state.composition);
  const currentTime = useAppSelector(state => state.audio.currentTime);
  const events = useAppSelector(state => state.timeline.events);
  const zoom = useAppSelector(state => state.timeline.zoom);
  const dispatch = useAppDispatch();

  const [scene, setScene] = useState<THREE.Scene | null>(null);
  const [camera, setCamera] = useState<THREE.OrthographicCamera | null>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [raycaster] = useState(new THREE.Raycaster());
  const [mouse] = useState(new THREE.Vector2());
  const [draggedMesh, setDraggedMesh] = useState<THREE.Mesh | null>(null);

  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  const videoElements = useMemo(() => ({} as {[key: string]: HTMLVideoElement}), []);

  const initScene = useCallback(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const aspect = width / height;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2, frustumSize * aspect / 2,
      frustumSize / 2, frustumSize / -2,
      0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(backgroundColor);
    camera.position.z = 5;

    setScene(scene);
    setCamera(camera);
    setRenderer(renderer);

    return () => {
      mountRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [width, height, backgroundColor]);

  useEffect(initScene, [initScene]);

  const createMesh = useCallback((event: TimelineEvent) => {
    let mesh: THREE.Mesh | null = null;
    if (event.type === 'image') {
      const texture = textureLoader.load(event.mediaUrl);
      texture.minFilter = THREE.LinearFilter;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      mesh = new THREE.Mesh(geometry, material);
    } else if (event.type === 'video') {
      if (!videoElements[event.id]) {
        const video = document.createElement('video');
        video.src = event.mediaUrl;
        video.loop = true;
        video.muted = true;
        video.play();
        videoElements[event.id] = video;
      }
      const texture = new THREE.VideoTexture(videoElements[event.id]);
      texture.minFilter = THREE.LinearFilter;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      mesh = new THREE.Mesh(geometry, material);
    }

    if (mesh) {
      mesh.position.set(event.position.x, event.position.y, 0);
      mesh.scale.set(event.scale.x, event.scale.y, 1);
      mesh.rotation.z = event.rotation;
      mesh.userData = { eventId: event.id };
    }

    return mesh;
  }, [textureLoader, videoElements]);

  const animate = useCallback(() => {
    if (!scene || !camera || !renderer) return;

    requestAnimationFrame(animate);

    // Clear existing objects
    scene.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        scene.remove(child);
      }
    });

    // Add objects based on current events
    events.forEach((event) => {
      if (currentTime >= event.startTime && currentTime < event.endTime) {
        const mesh = createMesh(event);
        if (mesh) {
          scene.add(mesh);
        }
      }
    });

    renderer.render(scene, camera);
  }, [scene, camera, renderer, events, currentTime, createMesh]);

  useEffect(() => {
    if (camera) {
      camera.zoom = zoom / 100;
      camera.updateProjectionMatrix();
    }
  }, [zoom, camera]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (!camera || !scene) return;

    const rect = mountRef.current!.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      setDraggedMesh(intersects[0].object as THREE.Mesh);
    }
  }, [camera, scene, mouse, raycaster, width, height]);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!draggedMesh || !camera) return;

    const rect = mountRef.current!.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(draggedMesh);
    if (intersects.length > 0) {
      draggedMesh.position.copy(intersects[0].point);
      const eventId = draggedMesh.userData.eventId;
      const updatedEvent = events.find(e => e.id === eventId);
      if (updatedEvent) {
        dispatch(updateEvent({
          ...updatedEvent,
          position: { x: draggedMesh.position.x, y: draggedMesh.position.y }
        }));
      }
    }
  }, [draggedMesh, camera, mouse, raycaster, width, height, events, dispatch]);

  const handleMouseUp = useCallback(() => {
    setDraggedMesh(null);
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    if (scene) {
      scene.background = new THREE.Color(backgroundColor);
    }
  }, [backgroundColor, scene]);

  const updateCameraAspect = useCallback(() => {
    if (camera && renderer) {
      const aspect = width / height;
      const frustumSize = 10;
      camera.left = frustumSize * aspect / -2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = frustumSize / -2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }, [camera, renderer, width, height]);

  useEffect(() => {
    updateCameraAspect();
  }, [width, height, updateCameraAspect]);

  const debouncedResize = useMemo(
    () => debounce(updateCameraAspect, 200),
    [updateCameraAspect]
  );

  useEffect(() => {
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  useEffect(() => {
    const animationId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animationId);
      Object.values(videoElements).forEach(video => video.pause());
    };
  }, [animate, videoElements]);

  return <div ref={mountRef} className="composition-viewer"></div>;
};

export default React.memo(CompositionViewer);