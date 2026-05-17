import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SpaceBackground() {
  const containerRef = useRef(null);
  const [showCloud, setShowCloud] = useState(false);
  const [showVictoryCloud, setShowVictoryCloud] = useState(false);

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
    camera.position.z = 2.4;

    // WebGL Renderer with Alpha support and high-performance settings
    const renderer = new THREE.WebGLRenderer({ 
      canvas: containerRef.current, 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffebd2, 1.4); // Warm sunlight glow
    dirLight.position.set(4, 5, 4);
    scene.add(dirLight);

    const softFillLight = new THREE.PointLight(0x00f2fe, 1.2, 8); // Cyber fill light from below-left
    softFillLight.position.set(-3, -2, 2);
    scene.add(softFillLight);

    // --- STARS GEOMETRY (PARTICLES BACKGROUND) ---
    const starsCount = 1200;
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
      size: 1.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // --- ORGANIC HIGHLY REALISTIC 3D RABBIT CREATION ---
    const rabbitGroup = new THREE.Group();

    // 1. Soft Fluffy Fur Material (Velvety, high roughness)
    const furMat = new THREE.MeshStandardMaterial({
      color: 0xfdfbf7,   // Cream-white fluffy bunny color
      roughness: 0.95,   // Soft non-reflective texture
      metalness: 0.02
    });

    const innerPinkMat = new THREE.MeshStandardMaterial({
      color: 0xffb3c1,   // Soft organic warm pink for ears & nose
      roughness: 0.85,
      metalness: 0.01
    });

    // A. Fluffy Chubby Body
    const bodyGeo = new THREE.SphereGeometry(0.25, 32, 32);
    bodyGeo.scale(1, 1.28, 0.95);
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.position.y = -0.32;
    rabbitGroup.add(body);

    // B. Fluffy Round Tail
    const tailGeo = new THREE.SphereGeometry(0.065, 16, 16);
    const tail = new THREE.Mesh(tailGeo, furMat);
    tail.position.set(0, -0.48, -0.22);
    rabbitGroup.add(tail);

    // C. Head Group
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.06, 0);

    const headGeo = new THREE.SphereGeometry(0.18, 32, 32);
    headGeo.scale(1.05, 0.96, 1);
    const head = new THREE.Mesh(headGeo, furMat);
    headGroup.add(head);

    // D. Organic Chubby Muzzle Cheeks
    const cheekGeo = new THREE.SphereGeometry(0.05, 16, 16);
    const leftCheek = new THREE.Mesh(cheekGeo, furMat);
    leftCheek.position.set(-0.042, -0.04, 0.13);
    headGroup.add(leftCheek);

    const rightCheek = new THREE.Mesh(cheekGeo, furMat);
    rightCheek.position.set(0.042, -0.04, 0.13);
    headGroup.add(rightCheek);

    // E. Cute Pink Nose
    const noseGeo = new THREE.SphereGeometry(0.018, 12, 12);
    const nose = new THREE.Mesh(noseGeo, innerPinkMat);
    nose.position.set(0, -0.015, 0.178);
    headGroup.add(nose);

    // F. FLOPPY ORGANIC EARS
    const earGeo = new THREE.SphereGeometry(0.044, 16, 16);
    earGeo.scale(1, 4.4, 0.28);

    // Left Ear
    const leftEar = new THREE.Mesh(earGeo, furMat);
    leftEar.position.set(-0.08, 0.22, -0.01);
    leftEar.rotation.z = 0.22;
    leftEar.rotation.y = 0.08;
    headGroup.add(leftEar);

    const innerEarGeo = new THREE.SphereGeometry(0.026, 16, 16);
    innerEarGeo.scale(1, 3.6, 0.1);
    const leftInner = new THREE.Mesh(innerEarGeo, innerPinkMat);
    leftInner.position.set(0, 0.01, 0.022);
    leftEar.add(leftInner);

    // Right Ear
    const rightEar = new THREE.Mesh(earGeo, furMat);
    rightEar.position.set(0.08, 0.22, -0.01);
    rightEar.rotation.z = -0.22;
    rightEar.rotation.y = -0.08;
    headGroup.add(rightEar);

    const rightInner = new THREE.Mesh(innerEarGeo, innerPinkMat);
    rightInner.position.set(0, 0.01, 0.022);
    rightEar.add(rightInner);

    // G. HIGHLY REALISTIC GLASSY EYES
    const eyeScleraGeo = new THREE.SphereGeometry(0.032, 32, 32);
    const glassyMat = new THREE.MeshStandardMaterial({
      color: 0x080808,   // Deep obsidian black
      roughness: 0.02,   // Glossy glassy
      metalness: 0.1
    });

    const leftEye = new THREE.Mesh(eyeScleraGeo, glassyMat);
    leftEye.position.set(-0.082, 0.022, 0.135);
    headGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeScleraGeo, glassyMat);
    rightEye.position.set(0.082, 0.022, 0.135);
    headGroup.add(rightEye);

    // Eye catchlights (shiny highlights)
    const catchlightGeo = new THREE.SphereGeometry(0.01, 8, 8);
    const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    const leftGlint = new THREE.Mesh(catchlightGeo, catchlightMat);
    leftGlint.position.set(0.014, 0.014, 0.022);
    leftEye.add(leftGlint);

    const rightGlint = new THREE.Mesh(catchlightGeo, catchlightMat);
    rightGlint.position.set(0.014, 0.014, 0.022);
    rightEye.add(rightGlint);

    // H. Cute Whiskers (White detailed thin elements)
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0xe2e8f0 });
    
    const createWhisker = (points) => {
      const wGeo = new THREE.BufferGeometry().setFromPoints(points);
      return new THREE.Line(wGeo, whiskerMat);
    };

    // Left Whiskers
    const lw1 = createWhisker([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.16, 0.02, 0.02)]);
    lw1.position.set(-0.05, -0.04, 0.135);
    headGroup.add(lw1);

    const lw2 = createWhisker([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-0.17, -0.025, 0.01)]);
    lw2.position.set(-0.05, -0.04, 0.135);
    headGroup.add(lw2);

    // Right Whiskers
    const rw1 = createWhisker([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.16, 0.02, 0.02)]);
    rw1.position.set(0.05, -0.04, 0.135);
    headGroup.add(rw1);

    const rw2 = createWhisker([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.17, -0.025, 0.01)]);
    rw2.position.set(0.05, -0.04, 0.135);
    headGroup.add(rw2);

    // I. Robotic Back paws
    const pawGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const leftPaw = new THREE.Mesh(pawGeo, furMat);
    leftPaw.position.set(-0.16, -0.5, 0.1);
    rabbitGroup.add(leftPaw);

    const rightPaw = new THREE.Mesh(pawGeo, furMat);
    rightPaw.position.set(0.16, -0.5, 0.1);
    rabbitGroup.add(rightPaw);

    // Add head to base rabbit
    rabbitGroup.add(headGroup);

    // Position perfectly in the dead center
    rabbitGroup.position.set(0, -0.4, 0.4);
    scene.add(rabbitGroup);

    // --- SOLID WHITE MESHES FOR RAYCASTING ---
    const solidMeshes = [body, head, leftEar, rightEar, leftPaw, rightPaw];

    // --- INTERACTIVE RAYCASTING, HOVER & AUDIO SYSTEMS ---
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    let mouseX = 0;
    let mouseY = 0;
    let excitedTicks = 0;
    let angryTicks = 0;
    let danceTicks = 0;
    let eyeBlinkTimer = 0;
    let isHovered = false;

    // Smooth 3D look-at target vector
    const targetLookAt = new THREE.Vector3(0, 0, 1.5);

    // Web Audio purr & alarm synthesizer
    let audioCtx = null;
    let purrOsc = null;
    let lfoOsc = null;
    let purrGain = null;
    let harmonicOsc = null;

    let activePurr = null;
    let activeLfo = null;
    let activeHarmonic = null;

    const startPurrAudio = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        // Fundamental Low Purr Hum (Set to 85Hz for absolute laptop speaker auditability!)
        purrOsc = audioCtx.createOscillator();
        purrOsc.type = 'triangle';
        purrOsc.frequency.setValueAtTime(85, audioCtx.currentTime);

        // Modulator LFO (4.6Hz) to create vibrating purring rhythm
        lfoOsc = audioCtx.createOscillator();
        lfoOsc.type = 'sine';
        lfoOsc.frequency.setValueAtTime(4.6, audioCtx.currentTime);

        const lfoGain = audioCtx.createGain();
        lfoGain.gain.setValueAtTime(12, audioCtx.currentTime);

        lfoOsc.connect(lfoGain);
        lfoGain.connect(purrOsc.frequency);

        // High soft harmonic hum (220Hz) to represent loving cat breathing
        harmonicOsc = audioCtx.createOscillator();
        harmonicOsc.type = 'sine';
        harmonicOsc.frequency.setValueAtTime(220, audioCtx.currentTime);

        const harmonicLfoGain = audioCtx.createGain();
        harmonicLfoGain.gain.setValueAtTime(15, audioCtx.currentTime);
        lfoOsc.connect(harmonicLfoGain);
        harmonicLfoGain.connect(harmonicOsc.frequency);

        const harmonicVolume = audioCtx.createGain();
        harmonicVolume.gain.setValueAtTime(0.015, audioCtx.currentTime);

        harmonicOsc.connect(harmonicVolume);

        // Main output volume gain fade-in
        purrGain = audioCtx.createGain();
        purrGain.gain.setValueAtTime(0, audioCtx.currentTime);
        purrGain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 0.3);

        purrOsc.connect(purrGain);
        harmonicVolume.connect(purrGain);
        purrGain.connect(audioCtx.destination);

        purrOsc.start();
        harmonicOsc.start();
        lfoOsc.start();

        activePurr = purrOsc;
        activeLfo = lfoOsc;
        activeHarmonic = harmonicOsc;
      } catch (err) {
        console.warn("Acoustic purr synthesis failed:", err);
      }
    };

    const stopPurrAudio = () => {
      if (purrGain && audioCtx) {
        try {
          purrGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
          const p = activePurr;
          const l = activeLfo;
          const h = activeHarmonic;
          setTimeout(() => {
            try {
              if (p) p.stop();
              if (l) l.stop();
              if (h) h.stop();
            } catch (e) {}
          }, 300);
        } catch (e) {}
      }
    };

    // Synthesize a grumpy pitch-dropping warning meow buzzer sound natively!
    const playAngryNoise = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(55, audioCtx.currentTime + 0.65);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.65);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.65);

        // Rapid second meow growl
        setTimeout(() => {
          try {
            const osc2 = audioCtx.createOscillator();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(180, audioCtx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(45, audioCtx.currentTime + 0.5);

            const gain2 = audioCtx.createGain();
            gain2.gain.setValueAtTime(0.18, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.5);
          } catch (e) {}
        }, 220);

      } catch (err) {
        console.warn("Angry sound failed:", err);
      }
    };

    // Synthesize a beautiful, high-pitched sweet meow chime for victory!
    const playHappyChirp = () => {
      try {
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
          audioCtx.resume();
        }

        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.35);

        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);

        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);

        // Secondary delayed sweet chirp harmonic
        setTimeout(() => {
          try {
            const osc2 = audioCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(450, audioCtx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(980, audioCtx.currentTime + 0.3);

            const gain2 = audioCtx.createGain();
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.3);
          } catch (e) {}
        }, 120);

      } catch (err) {
        console.warn("Happy chirp failed:", err);
      }
    };

    const handleMouseMove = (e) => {
      mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouseY = -(e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    // Click triggers excited jump ONLY if clicking DIRECTLY on the bunny
    const handleScreenClick = () => {
      if (isHovered && excitedTicks === 0 && angryTicks === 0 && danceTicks === 0) {
        excitedTicks = 75;
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    };

    // Trigger tab-transition backflip!
    const handleSectionChanged = () => {
      if (excitedTicks === 0 && angryTicks === 0 && danceTicks === 0) {
        excitedTicks = 75;
      }
    };

    // Trigger Angry Alert & speech bubble when a deadline is reached!
    const handleDeadlineExpired = () => {
      // Clear victory states if running
      danceTicks = 0;
      setShowVictoryCloud(false);

      angryTicks = 420;
      setShowCloud(true);
      playAngryNoise();
      
      setTimeout(() => {
        setShowCloud(false);
      }, 7000);
    };

    // Trigger Victory Dance State when a task is completed!
    const handleTaskCompleted = () => {
      // Clear anger states if running
      angryTicks = 0;
      setShowCloud(false);

      danceTicks = 420; // 7 seconds of high-energy dancing joy!
      setShowVictoryCloud(true);
      playHappyChirp();

      setTimeout(() => {
        setShowVictoryCloud(false);
      }, 7000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleScreenClick);
    window.addEventListener('studyhub-section-changed', handleSectionChanged);
    window.addEventListener('study-deadline-expired', handleDeadlineExpired);
    window.addEventListener('study-task-completed', handleTaskCompleted);

    // --- ANIMATION LOOP ---
    let animationFrameId;
    
    const animate = (time) => {
      animationFrameId = requestAnimationFrame(animate);

      // Raycasting checking solid white meshes only
      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(solidMeshes, false);
      const currentlyHovered = intersects.length > 0 && angryTicks === 0 && danceTicks === 0;

      // Handle hover audio triggers
      if (currentlyHovered && !isHovered) {
        isHovered = true;
        startPurrAudio();
      } else if (!currentlyHovered && isHovered) {
        isHovered = false;
        stopPurrAudio();
      }

      // Background stellar rotation
      starField.rotation.y = time * 0.000003;
      starField.rotation.x = time * 0.000001;

      // Camera breathing glide
      camera.position.x += (mouseX * 0.2 - camera.position.x) * 0.006;
      camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.006;
      camera.lookAt(scene.position);

      // Base breathing movement
      const breathe = Math.sin(time * 0.0016) * 0.015;
      body.position.y = -0.32 + breathe;

      // ANIMATIONS ACCORDING TO STATE (Angry > Dance/Happy > Hovered > Excited > Peaceful)
      if (angryTicks > 0) {
        angryTicks--;

        leftEye.material.color.setHex(0xff003c); // Neon Red eyes
        rightEye.material.color.setHex(0xff003c);

        leftEar.rotation.x = 0.8; // Aggressive floppy ear stance
        rightEar.rotation.x = 0.8;
        leftEar.rotation.z = 0.55;
        rightEar.rotation.z = -0.55;

        // Rapid shaking quivering
        headGroup.rotation.y = Math.sin(time * 0.06) * 0.09;
        headGroup.rotation.x = 0.12 + Math.sin(time * 0.045) * 0.04;
        headGroup.rotation.z = 0;

        const fastBreathe = Math.sin(time * 0.008) * 0.024;
        body.position.y = -0.32 + fastBreathe;
        headGroup.position.y = 0.06 + fastBreathe * 1.5;

        if (angryTicks === 0) {
          leftEye.material.color.setHex(0x080808); // Reset to obsidian
          rightEye.material.color.setHex(0x080808);
          leftEar.rotation.x = 0;
          rightEar.rotation.x = 0;
          leftEar.rotation.z = 0.22;
          rightEar.rotation.z = -0.22;
          headGroup.rotation.set(0, 0, 0);
        }
      } else if (danceTicks > 0) {
        danceTicks--;

        leftEye.material.color.setHex(0x00ff87); // Glowing neon emerald eyes!
        rightEye.material.color.setHex(0x00ff87);

        // A. Spin the entire rabbit Group in absolute joy!
        rabbitGroup.rotation.y = time * 0.008;

        // B. Bouncing up and down high-energy dance!
        const danceBreathe = Math.sin(time * 0.012) * 0.14;
        rabbitGroup.position.y = -0.4 + Math.abs(danceBreathe);

        // C. Joyful rapid ear waving droops
        leftEar.rotation.z = 0.22 + Math.sin(time * 0.035) * 0.35;
        rightEar.rotation.z = -0.22 - Math.sin(time * 0.035) * 0.35;
        leftEar.rotation.x = Math.sin(time * 0.03) * 0.3;
        rightEar.rotation.x = Math.cos(time * 0.03) * 0.3;

        // Sweet head bobbing
        headGroup.rotation.y = Math.sin(time * 0.01) * 0.12;
        headGroup.rotation.x = -0.06 + Math.sin(time * 0.02) * 0.05;

        if (danceTicks === 0) {
          leftEye.material.color.setHex(0x080808); // Reset elements to standard
          rightEye.material.color.setHex(0x080808);
          rabbitGroup.rotation.set(0, 0, 0);
          rabbitGroup.position.y = -0.4;
          leftEar.rotation.x = 0;
          rightEar.rotation.x = 0;
          leftEar.rotation.z = 0.22;
          rightEar.rotation.z = -0.22;
          headGroup.rotation.set(0, 0, 0);
        }
      } else if (isHovered) {
        // --- HOVER PETTING MODE ---
        leftEye.scale.y = 0.05;
        rightEye.scale.y = 0.05;

        headGroup.rotation.y = Math.sin(time * 0.0035) * 0.16;
        headGroup.rotation.x = -0.04 + Math.sin(time * 0.002) * 0.03;
        headGroup.rotation.z = Math.sin(time * 0.002) * 0.04;

        leftEar.rotation.z = 0.32 + Math.sin(time * 0.002) * 0.03;
        rightEar.rotation.z = -0.32 - Math.sin(time * 0.002) * 0.03;
        
        nose.position.y = -0.015 + Math.sin(time * 0.02) * 0.003;
        headGroup.position.y = 0.06 + breathe * 0.8;
      } else if (excitedTicks > 0) {
        // --- EXCITED JUMP BACKFLIP MODE ---
        excitedTicks--;
        
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;

        const progress = (75 - excitedTicks) / 75;
        rabbitGroup.rotation.x = progress * Math.PI * 2;
        rabbitGroup.position.y = -0.4 + Math.sin(progress * Math.PI) * 0.35;

        leftEar.rotation.x = Math.sin(time * 0.02) * 0.4;
        rightEar.rotation.x = Math.cos(time * 0.02) * 0.4;
        leftEar.rotation.z = 0.22 + Math.sin(time * 0.03) * 0.2;
        rightEar.rotation.z = -0.22 - Math.sin(time * 0.03) * 0.2;

        if (excitedTicks === 0) {
          rabbitGroup.rotation.x = 0;
          rabbitGroup.position.y = -0.4;
        }
      } else {
        // --- PEACEFUL LOOK AT MOUSE MODE ---
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;

        const mouse3D = new THREE.Vector3(
          mouseX * 1.8, 
          mouseY * 1.2, 
          1.6
        );

        targetLookAt.x += (mouse3D.x - targetLookAt.x) * 0.08;
        targetLookAt.y += (mouse3D.y - targetLookAt.y) * 0.08;
        targetLookAt.z += (mouse3D.z - targetLookAt.z) * 0.08;

        headGroup.lookAt(targetLookAt);

        // Natural blinks
        eyeBlinkTimer += 1;
        if (eyeBlinkTimer % 230 === 0) {
          leftEye.scale.y = 0;
          rightEye.scale.y = 0;
        }

        // Gentle nose twitching
        nose.position.y = -0.015 + Math.sin(time * 0.015) * 0.003;

        // Floppy ears sway
        leftEar.rotation.z = 0.22 + Math.sin(time * 0.001) * 0.04;
        rightEar.rotation.z = -0.22 - Math.cos(time * 0.001) * 0.04;
        leftEar.rotation.x = Math.sin(time * 0.0008) * 0.05;
        rightEar.rotation.x = Math.sin(time * 0.0008) * 0.05;
        headGroup.position.y = 0.06 + breathe * 1.3;
      }

      renderer.render(scene, camera);
    };

    animate(0);

    // --- RESPONSIVE RESIZE CONFIGURATION ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);

      if (window.innerWidth < 768) {
        rabbitGroup.position.set(0, -0.58, 0.4);
        rabbitGroup.scale.set(0.72, 0.72, 0.72);
      } else {
        rabbitGroup.position.set(0, -0.4, 0.45);
        rabbitGroup.scale.set(1.05, 1.05, 1.05);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // --- CLEANUP ON DISMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleScreenClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('studyhub-section-changed', handleSectionChanged);
      window.removeEventListener('study-deadline-expired', handleDeadlineExpired);
      window.removeEventListener('study-task-completed', handleTaskCompleted);
      if (isHovered) stopPurrAudio();
      
      starGeometry.dispose();
      starMaterial.dispose();
      bodyGeo.dispose();
      tailGeo.dispose();
      headGeo.dispose();
      cheekGeo.dispose();
      noseGeo.dispose();
      earGeo.dispose();
      innerEarGeo.dispose();
      eyeScleraGeo.dispose();
      catchlightGeo.dispose();
      pawGeo.dispose();
      furMat.dispose();
      innerPinkMat.dispose();
      glassyMat.dispose();
      catchlightMat.dispose();
      whiskerMat.dispose();
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes bounceCloud {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -10px) scale(1.03); }
        }
        .thought-cloud-bubble {
          animation: bounceCloud 2.4s infinite ease-in-out;
          box-shadow: 0 0 30px rgba(255, 0, 60, 0.55), inset 0 0 15px rgba(255, 0, 60, 0.1);
        }
        .victory-cloud-bubble {
          animation: bounceCloud 2.4s infinite ease-in-out;
          box-shadow: 0 0 30px rgba(0, 255, 135, 0.55), inset 0 0 15px rgba(0, 255, 135, 0.1);
        }
      `}</style>

      {/* Real-time cloudy thought bubble absolute positioned directly above center rabbit */}
      {showCloud && (
        <div className="thought-cloud-bubble" style={{
          position: 'fixed',
          top: 'calc(50% - 210px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '4px solid #ff003c',
          borderRadius: '45px',
          padding: '16px 28px',
          color: '#0e1320',
          fontWeight: 900,
          fontSize: '1.15rem',
          fontFamily: 'var(--font-display)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          pointerEvents: 'none'
        }}>
          <div style={{ textAlign: 'center', letterSpacing: '0.5px' }}>
            ⚠️ DEADLINE HITS...NIGGA! 🚨
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '22px',
            height: '22px',
            background: '#fff',
            border: '4px solid #ff003c',
            borderRadius: '50%',
            boxShadow: '0 4px 10px rgba(255, 0, 60, 0.2)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-32px',
            left: '46%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: '#fff',
            border: '4px solid #ff003c',
            borderRadius: '50%',
            boxShadow: '0 4px 10px rgba(255, 0, 60, 0.2)'
          }} />
        </div>
      )}

      {/* Real-time Task Completed Victory thought bubble overlay */}
      {showVictoryCloud && (
        <div className="victory-cloud-bubble" style={{
          position: 'fixed',
          top: 'calc(50% - 210px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff',
          border: '4px solid #00ff87',
          borderRadius: '45px',
          padding: '18px 30px',
          color: '#0e1320',
          fontWeight: 900,
          fontSize: '1.15rem',
          fontFamily: 'var(--font-display)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          pointerEvents: 'none'
        }}>
          <div style={{ textAlign: 'center', letterSpacing: '0.5px', lineHeight: '1.4' }}>
            🎉 well done my nigga...i belive in you &lt;3 💖
          </div>
          <div style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '22px',
            height: '22px',
            background: '#fff',
            border: '4px solid #00ff87',
            borderRadius: '50%',
            boxShadow: '0 4px 10px rgba(0, 255, 135, 0.2)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-32px',
            left: '46%',
            transform: 'translateX(-50%)',
            width: '12px',
            height: '12px',
            background: '#fff',
            border: '4px solid #00ff87',
            borderRadius: '50%',
            boxShadow: '0 4px 10px rgba(0, 255, 135, 0.2)'
          }} />
        </div>
      )}

      <canvas 
        ref={containerRef} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: -1,
          pointerEvents: 'auto',
          background: 'transparent'
        }}
      />
    </>
  );
}
