'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

const GestureEffects = ({ gesture, onRender }) => {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particleSystemRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    const initWebGL = () => {
      if (!mountRef.current || rendererRef.current) return;

      const renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      });

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      camera.position.z = 5;

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;
    };

    initWebGL();

    return () => {
      isAnimatingRef.current = false;

      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      if (particleSystemRef.current) {
        sceneRef.current.remove(particleSystemRef.current);
        particleSystemRef.current.geometry.dispose();
        particleSystemRef.current.material.dispose();
        particleSystemRef.current = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.forceContextLoss();
        rendererRef.current = null;
      }

      if (mountRef.current?.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);
    };
  }, []);

  const startAnimation = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current || isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const animate = () => {
      if (!isAnimatingRef.current) return;

      if (particleSystemRef.current?.tick) particleSystemRef.current.tick();

      rendererRef.current.render(sceneRef.current, cameraRef.current);
      // 렌더링 후 콜백 호출
      if (onRender) {
        onRender(rendererRef.current.domElement);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [onRender]);

  useEffect(() => {
    if (!sceneRef.current || !rendererRef.current) return;

    if (particleSystemRef.current) {
      sceneRef.current.remove(particleSystemRef.current);
      particleSystemRef.current.geometry.dispose();
      particleSystemRef.current.material.dispose();
      particleSystemRef.current = null;
    }

    isAnimatingRef.current = false;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    if (gesture === 'Victory') {
      createSnowEffect(sceneRef.current, particleSystemRef);
    } else if (gesture === 'Fist') {
      createFireEffect(sceneRef.current, particleSystemRef);
    }

    startAnimation();
  }, [gesture, startAnimation]);

  return <div ref={mountRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
};

const createSnowEffect = (scene, particleSystemRef) => {
  const snowGeometry = new THREE.BufferGeometry();
  const snowCount = 1000;
  const positions = new Float32Array(snowCount * 3);
  const velocities = new Float32Array(snowCount);

  for (let i = 0; i < snowCount; i++) {
    positions[i * 3] = Math.random() * 10 - 5;
    positions[i * 3 + 1] = Math.random() * 10 - 5;
    positions[i * 3 + 2] = Math.random() * 10 - 5;
    velocities[i] = Math.random() * 0.02 + 0.01;
  }

  snowGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const snowMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.8 });

  const snow = new THREE.Points(snowGeometry, snowMaterial);
  scene.add(snow);
  particleSystemRef.current = snow;

  snow.tick = () => {
    const positions = snow.geometry.attributes.position.array;
    for (let i = 0; i < snowCount; i++) {
      positions[i * 3 + 1] -= velocities[i];
      if (positions[i * 3 + 1] < -5) positions[i * 3 + 1] = 5;
    }
    snow.geometry.attributes.position.needsUpdate = true;
  };
};

const createFireEffect = (scene, particleSystemRef) => {
  const fireGeometry = new THREE.BufferGeometry();
  const fireCount = 500;
  const positions = new Float32Array(fireCount * 3);
  const velocities = new Float32Array(fireCount);

  for (let i = 0; i < fireCount; i++) {
    positions[i * 3] = Math.random() * 2 - 1;
    positions[i * 3 + 1] = Math.random() * 2;
    positions[i * 3 + 2] = Math.random() * 2 - 1;
    velocities[i] = Math.random() * 0.05 + 0.02;
  }

  fireGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const fireMaterial = new THREE.PointsMaterial({ color: 0xff4500, size: 0.2, transparent: true, opacity: 0.8 });

  const fire = new THREE.Points(fireGeometry, fireMaterial);
  scene.add(fire);
  particleSystemRef.current = fire;

  fire.tick = () => {
    const positions = fire.geometry.attributes.position.array;
    for (let i = 0; i < fireCount; i++) {
      positions[i * 3 + 1] += velocities[i];
      if (positions[i * 3 + 1] > 2) positions[i * 3 + 1] = 0;
    }
    fire.geometry.attributes.position.needsUpdate = true;
  };
};

export default GestureEffects;
