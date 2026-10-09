'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ParticleBackground({ accentColor = '#818cf8' }: { accentColor?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const colorRef = useRef(new THREE.Color(accentColor));

  useEffect(() => {
    colorRef.current.set(accentColor);
  }, [accentColor]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 6, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // Particle Matrix
    const numX = 70;
    const numZ = 70;
    const count = numX * numZ;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const initialPos = new Float32Array(count * 3);

    let idx = 0;
    for (let x = 0; x < numX; x++) {
      for (let z = 0; z < numZ; z++) {
        const px = (x - numX / 2) * 0.55;
        const py = 0;
        const pz = (z - numZ / 2) * 0.55;
        positions[idx] = px;
        positions[idx + 1] = py;
        positions[idx + 2] = pz;

        initialPos[idx] = px;
        initialPos[idx + 1] = py;
        initialPos[idx + 2] = pz;
        idx += 3;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.11,
      color: colorRef.current,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Perspective Grid Floor
    const gridHelper = new THREE.GridHelper(40, 40, 0x818cf8, 0x1e293b);
    gridHelper.position.y = -2;
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.25;
    scene.add(gridHelper);

    // Cursor Tracking
    const mouse = new THREE.Vector2(-999, -999);
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const time = clock.getElapsedTime();

      // Color tween
      material.color.lerp(colorRef.current, 0.05);

      const posArr = geometry.attributes.position.array as Float32Array;
      let ptr = 0;

      for (let x = 0; x < numX; x++) {
        for (let z = 0; z < numZ; z++) {
          const initX = initialPos[ptr];
          const initZ = initialPos[ptr + 2];

          // Wave equation
          let waveY = Math.sin(x * 0.2 + time * 1.5) * 0.8 + Math.cos(z * 0.2 + time * 1.2) * 0.8;

          // Mouse push-away physics
          const dx = initX - mouse.x * 12;
          const dz = initZ - (-mouse.y * 12);
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 3.5) {
            const force = (1 - dist / 3.5) * 1.5;
            waveY += force;
          }

          posArr[ptr + 1] = waveY;
          ptr += 3;
        }
      }

      geometry.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <div ref={mountRef} className="w-full h-full" />
      {/* Radial Mask: Dims particles behind left column to ~20% */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 25% 50%, rgba(9, 13, 22, 0.85) 0%, rgba(9, 13, 22, 0.2) 60%, transparent 100%)',
        }}
      />
    </div>
  );
}