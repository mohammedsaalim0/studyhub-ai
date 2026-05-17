import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SpaceBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE.JS SETUP ---
    const scene = new THREE.Scene();
    
    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 1;

    // WebGL Renderer with Alpha support for CSS gradient background bleed-through
    const renderer = new THREE.WebGLRenderer({ 
      canvas: containerRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- STARS GEOMETRY (PARTICLES) ---
    const starsCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starsCount * 3);
    const colors = new Float32Array(starsCount * 3);

    const colorPalette = [
      new THREE.Color('#00f2fe'), // Cyan
      new THREE.Color('#9b51e0'), // Violet
      new THREE.Color('#ff007f'), // Pink
      new THREE.Color('#ffffff')  // Pure White
    ];

    for (let i = 0; i < starsCount * 3; i += 3) {
      // Spread particles in a wide 3D sphere/box
      positions[i] = (Math.random() - 0.5) * 800;     // X
      positions[i + 1] = (Math.random() - 0.5) * 800; // Y
      positions[i + 2] = (Math.random() - 0.5) * 800; // Z

      // Select random glowing color from HSL color palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material using native glowing points
    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const starField = new THREE.Points(geometry, material);
    scene.add(starField);

    // --- ANIMATION LOOP ---
    let animationFrameId;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e) => {
      // Near-static mouse tracking (multiplier reduced to 0.0015) for a very subtle, high-class depth shift
      mouseX = (e.clientX - window.innerWidth / 2) * 0.0015;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.0015;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Ultra-slow, breathing galactic rotation (nearly static but alive!)
      starField.rotation.y = time * 0.000004;
      starField.rotation.x = time * 0.0000015;

      // Ultra-high-dampening interpolation (step reduced to 0.006) for a slow breathing transition
      camera.position.x += (mouseX - camera.position.x) * 0.006;
      camera.position.y += (-mouseY - camera.position.y) * 0.006;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate(0);

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return (
    <canvas 
      ref={containerRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
}
