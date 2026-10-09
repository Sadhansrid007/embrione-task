'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 3.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(140, 140);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Glowing Hologram Group
    const group = new THREE.Group();
    scene.add(group);

    // Dual-layer Glass Crystal Geometry
    const innerGeo = new THREE.OctahedronGeometry(0.8, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    group.add(innerMesh);

    // Outer Orbiting Rings
    const ringGeo = new THREE.TorusGeometry(1.2, 0.015, 16, 60);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ringGeo, ringMat);
    const ring2 = new THREE.Mesh(ringGeo, ringMat);
    ring2.rotation.x = Math.PI / 2.5;
    group.add(ring1);
    group.add(ring2);

    // Hover / Pointer Physics
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = currentMount.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Smooth mouse spring tracking
      group.rotation.x += (mouseY * 1.2 - group.rotation.x) * 0.1;
      group.rotation.y += (mouseX * 1.2 - group.rotation.y) * 0.1;

      // Idle continuous pulse
      innerMesh.rotation.y = time * 0.6;
      ring1.rotation.z = time * 0.4;
      ring2.rotation.z = -time * 0.5;

      const scale = 1 + Math.sin(time * 3) * 0.08;
      group.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[140px] h-[140px] mx-auto flex items-center justify-center cursor-pointer filter drop-shadow-[0_0_20px_rgba(192,132,252,0.7)] transition-transform duration-300 hover:scale-110"
    />
  );
}