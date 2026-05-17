import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function SpaceBackground() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE.JS SCENE SETUP ---
    const scene = new THREE.Scene();
    
    // Perspective Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.z = 2.5;

    // WebGL Renderer with Alpha support and high-performance settings
    const renderer = new THREE.WebGLRenderer({ 
      canvas: containerRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- LIGHTS (Critical for metallic realism!) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f2fe, 1.2);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x9b51e0, 1.5, 10);
    pointLight.position.set(-2, -1, 2);
    scene.add(pointLight);

    // --- STARS GEOMETRY (PARTICLES BACKGROUND) ---
    const starsCount = 1500;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    const colorPalette = [
      new THREE.Color('#00f2fe'), // Cyan
      new THREE.Color('#9b51e0'), // Violet
      new THREE.Color('#ff007f'), // Pink
      new THREE.Color('#ffffff')  // Pure White
    ];

    for (let i = 0; i < starsCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 800;

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i] = color.r;
      starColors[i + 1] = color.g;
      starColors[i + 2] = color.b;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // --- PROGRAMMATIC 3D CYBER-RABBIT CREATION ---
    const rabbitGroup = new THREE.Group();

    // Premium Cyberpunk metallic material
    const cyberMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.15,
      bumpScale: 0.05
    });

    // A. Main Body
    const bodyGeo = new THREE.CapsuleGeometry(0.2, 0.4, 8, 16);
    const body = new THREE.Mesh(bodyGeo, cyberMat);
    body.position.y = -0.3;
    rabbitGroup.add(body);

    // B. Neck Collar (Glowing Neon Ring)
    const collarGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 24);
    const collarMat = new THREE.MeshBasicMaterial({ color: 0x9b51e0 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.y = -0.08;
    collar.rotation.x = Math.PI / 2;
    rabbitGroup.add(collar);

    // C. Head (Rotates to track the mouse!)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.1, 0);

    const headGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const head = new THREE.Mesh(headGeo, cyberMat);
    headGroup.add(head);

    // D. Left & Right Ears
    const earGeo = new THREE.CapsuleGeometry(0.04, 0.28, 8, 16);
    
    // Left Ear
    const leftEar = new THREE.Mesh(earGeo, cyberMat);
    leftEar.position.set(-0.09, 0.3, 0);
    leftEar.rotation.z = 0.12;
    headGroup.add(leftEar);

    // Left Inner Glow (Neon Pink)
    const innerEarGeo = new THREE.CapsuleGeometry(0.02, 0.22, 8, 16);
    const innerEarMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const leftInner = new THREE.Mesh(innerEarGeo, innerEarMat);
    leftInner.position.set(0, 0.02, 0.025);
    leftEar.add(leftInner);

    // Right Ear
    const rightEar = new THREE.Mesh(earGeo, cyberMat);
    rightEar.position.set(0.09, 0.3, 0);
    rightEar.rotation.z = -0.12;
    headGroup.add(rightEar);

    // Right Inner Glow
    const rightInner = new THREE.Mesh(innerEarGeo, innerEarMat);
    rightInner.position.set(0, 0.02, 0.025);
    rightEar.add(rightInner);

    // E. Left & Right Glowing Eyes (Neon Cyan)
    const eyeGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const leftEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const leftEye = new THREE.Mesh(eyeGeo, leftEyeMat);
    leftEye.position.set(-0.08, 0.04, 0.18);
    headGroup.add(leftEye);

    const rightEyeMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
    const rightEye = new THREE.Mesh(eyeGeo, rightEyeMat);
    rightEye.position.set(0.08, 0.04, 0.18);
    headGroup.add(rightEye);

    // F. Little Glowing Nose (Neon Cyan)
    const noseGeo = new THREE.SphereGeometry(0.02, 8, 8);
    const noseMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.02, 0.21);
    headGroup.add(nose);

    // G. Robotic Back paws
    const pawGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const leftPaw = new THREE.Mesh(pawGeo, cyberMat);
    leftPaw.position.set(-0.16, -0.5, 0.1);
    rabbitGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, cyberMat);
    rightPaw.position.set(0.16, -0.5, 0.1);
    rabbitGroup.add(rightPaw);

    // Add head group to primary rabbit structure
    rabbitGroup.add(headGroup);

    // Offset placement of the Cyber-Rabbit to float beautifully in the right-center space
    rabbitGroup.position.set(0.85, -0.3, 0.8);
    scene.add(rabbitGroup);

    // --- INTERACTION & EMOTIONS STATE ---
    let mouseX = 0;
    let mouseY = 0;
    let excitedTicks = 0; // Number of animation ticks remaining in "Excited Mode"
    let eyeBlinkTimer = 0;

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) * 0.002;
      mouseY = (e.clientY - window.innerHeight / 2) * 0.002;
    };

    // Clicking anywhere triggers the rabbit's EXCITED backflip & green glow emotions!
    const handleScreenClick = () => {
      excitedTicks = 70; // 70 frames of high-speed backflip!
      leftEyeMat.color.setHex(0x05f3a2); // Turn eyes Emerald (Excited!)
      rightEyeMat.color.setHex(0x05f3a2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleScreenClick);

    // --- ANIMATION LOOP ---
    let animationFrameId;
    
    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // 1. Slow cosmic background drifting
      starField.rotation.y = time * 0.000004;
      starField.rotation.x = time * 0.0000015;

      // 2. Slow breathing background camera glide
      camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.006;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.006;
      camera.lookAt(scene.position);

      // 3. Cyber-Rabbit breathing movement
      const breathe = Math.sin(time * 0.0015) * 0.02;
      body.position.y = -0.3 + breathe;
      headGroup.position.y = 0.1 + breathe * 1.5;

      // 4. Natural blinks
      eyeBlinkTimer += 1;
      if (eyeBlinkTimer % 200 === 0) {
        leftEye.scale.y = 0;
        rightEye.scale.y = 0;
      } else if (leftEye.scale.y === 0) {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      // 5. EMOTIONS INTERPOLATOR (Happy vs. Excited)
      if (excitedTicks > 0) {
        excitedTicks--;

        // A. Excited Backflip animation!
        rabbitGroup.rotation.x += (Math.PI * 2) / 70; // 360-degree flip over 70 frames
        rabbitGroup.position.y = -0.3 + Math.sin((excitedTicks / 70) * Math.PI) * 0.4; // Jump up!

        // B. Wild excited ear-wiggling
        leftEar.rotation.x = Math.sin(time * 0.02) * 0.6;
        rightEar.rotation.x = Math.cos(time * 0.02) * 0.6;
        leftEar.rotation.z = 0.12 + Math.sin(time * 0.035) * 0.3;
        rightEar.rotation.z = -0.12 - Math.sin(time * 0.035) * 0.3;

        // C. Restore peaceful eyes color when finished
        if (excitedTicks === 0) {
          leftEyeMat.color.setHex(0x00f2fe); // Reset eyes to Neon Cyan
          rightEyeMat.color.setHex(0x00f2fe);
          rabbitGroup.rotation.x = 0;
          rabbitGroup.position.y = -0.3;
        }
      } else {
        // --- HAPPY MODE (PEACEFUL DRIFT) ---
        // Head smoothly turns to track the mouse coordinates in 3D
        const targetRotY = mouseX * 2.5;
        const targetRotX = -mouseY * 1.5;

        headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.06;
        headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.06;

        // Gentle, happy wiggles in the ears
        leftEar.rotation.z = 0.12 + Math.sin(time * 0.001) * 0.06;
        rightEar.rotation.z = -0.12 - Math.cos(time * 0.001) * 0.06;
        leftEar.rotation.x = Math.sin(time * 0.0008) * 0.08;
        rightEar.rotation.x = Math.sin(time * 0.0008) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate(0);

    // --- DYNAMIC RESIZE HANDLER ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Reposition rabbit slightly on mobile so it doesn't obstruct central text
      if (window.innerWidth < 768) {
        rabbitGroup.position.set(0, -0.7, 0.4);
        rabbitGroup.scale.set(0.7, 0.7, 0.7);
      } else {
        rabbitGroup.position.set(0.85, -0.3, 0.8);
        rabbitGroup.scale.set(1, 1, 1);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing call

    // --- CLEANUP ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleScreenClick);
      window.removeEventListener('resize', handleResize);
      starGeometry.dispose();
      starMaterial.dispose();
      bodyGeo.dispose();
      collarGeo.dispose();
      headGeo.dispose();
      earGeo.dispose();
      innerEarGeo.dispose();
      eyeGeo.dispose();
      noseGeo.dispose();
      pawGeo.dispose();
      cyberMat.dispose();
      collarMat.dispose();
      innerEarMat.dispose();
      leftEyeMat.dispose();
      rightEyeMat.dispose();
      noseMat.dispose();
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
