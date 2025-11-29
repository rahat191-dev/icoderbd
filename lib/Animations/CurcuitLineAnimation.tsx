"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  className?: string;
}

export default function CurcuitLineAnimation({ className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // **❌ WebGPU/Adapter Error Fix Simulation (Not needed in this THREE.js code)**
    // যেহেতু এটি Three.js কোড (WebGL ব্যবহার করে), তাই এখানে navigator.gpu চেক করার দরকার নেই।
    // যদি কোনো কারণে WebGL কনটেক্সট তৈরি না হয়, তাহলে এটি স্বয়ংক্রিয়ভাবে ব্যর্থ হবে।

    let width = window.innerWidth;
    let height = window.innerHeight;

    // -------- Renderer --------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    // WebGL Renderer তৈরি না হলে, এখানে কোড ক্র্যাশ করতে পারে। 
    // যদি renderer তৈরি না হয়, আমরা return করে দেবো।
    if (!renderer) {
        console.error("WebGL Renderer failed to initialize.");
        return;
    }

    renderer.setSize(width, height);
    renderer.setClearColor(0x1e1e1e, 1);
    mountRef.current.appendChild(renderer.domElement);

    // -------- Camera --------
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      -1000,
      1000
    );
    camera.position.z = 1;

    const scene = new THREE.Scene();

    const isMobile = window.innerWidth < 768;
    const gridSize = 4;
    const totalLinePaths = isMobile ? 150 : 400;
    const maxAnimatedLines = isMobile ? 20 : 60;
    
    // **FINAL OPTIMIZATION VARIABLES (Circular Buffer Setup)**
    const MAX_POINTS = isMobile ? 30000 : 100000;
    const MAX_COMPONENTS = MAX_POINTS * 3; // 3D পজিশন: x, y, z

    // mergedPositions: প্রি-অ্যালোকেটেড Float32Array (FIFO Data)
    const mergedPositions = new Float32Array(MAX_COMPONENTS); 
    
    // mergedPathSegments: FIFO বাফার ম্যানেজ করার জন্য প্রতিটি লাইনের কম্পোনেন্ট সংখ্যা রাখে।
    const mergedPathSegments: number[] = []; 
    
    // totalActiveComponents: বর্তমানে কত কম্পোনেন্ট রেন্ডার হচ্ছে তার হিসেব রাখে।
    let totalActiveComponents = 0;
    // **END FINAL OPTIMIZATION VARIABLES**


    const animatedLines: AnimatedLine[] = [];

    type Point2D = { x: number; y: number };

    // -----------------------------
    // MERGED BACKGROUND BUFFER
    // -----------------------------
    const mergedBackgroundGeometry = new THREE.BufferGeometry();
    
    mergedBackgroundGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(mergedPositions, 3).setUsage(THREE.DynamicDrawUsage)
    );
    mergedBackgroundGeometry.setDrawRange(0, 0); 

    const mergedBackgroundMaterial = new THREE.LineBasicMaterial({
      color: 0x333333,
      linewidth: 1,
    });

    const mergedBackgroundLine = new THREE.LineSegments(
      mergedBackgroundGeometry,
      mergedBackgroundMaterial
    );
    scene.add(mergedBackgroundLine);

    /**
     * নতুন পথকে সার্কুলার বাফারে যুক্ত করে।
     * এটিই ল্যাগ-মুক্ত FIFO লজিক।
     */
    function mergePath(path: Point2D[]) {
      const pathComponents: number[] = []; 

      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        pathComponents.push(p1.x, p1.y, 0, p2.x, p2.y, 0);
      }
      
      const newComponentCount = pathComponents.length;
      let componentsToRemove = 0;

      // 1. FIFO: কতগুলি পুরোনো কম্পোনেন্ট সরাতে হবে তা নির্ধারণ করা 
      while (totalActiveComponents + newComponentCount > MAX_COMPONENTS) {
          if (mergedPathSegments.length === 0) break;
          
          const oldestSegmentComponents = mergedPathSegments.shift()!;
          componentsToRemove += oldestSegmentComponents;
      }
      
      if (componentsToRemove > 0) {
          // 2. ডেটা শিফটিং: Float32Array.copyWithin ব্যবহার করে ডেটা দ্রুত কপি করা
          const srcStart = componentsToRemove;
          const destStart = 0;
          const numToCopy = totalActiveComponents - componentsToRemove;
          
          // ডেটা শিফট করা
          mergedPositions.copyWithin(destStart, srcStart, srcStart + numToCopy);

          totalActiveComponents = numToCopy;
      }
      
      // 3. নতুন ডেটা যুক্ত করা: বাফারের শেষে নতুন ডেটা লেখা
      let currentWriteOffset = totalActiveComponents;
      
      for (let i = 0; i < newComponentCount; i++) {
        mergedPositions[currentWriteOffset + i] = pathComponents[i];
      }
      
      // 4. ট্র্যাকার আপডেট করা
      mergedPathSegments.push(newComponentCount);
      totalActiveComponents += newComponentCount;

      // 5. Geometry আপডেট করা 
      const positionAttribute = mergedBackgroundGeometry.getAttribute('position');
      positionAttribute.needsUpdate = true;

      // Draw Range আপডেট করা
      mergedBackgroundGeometry.setDrawRange(0, totalActiveComponents / 3); 
    }

    // -------- Create Random Paths --------
    const availablePaths: Point2D[][] = [];

    function createRandomPath(): Point2D[] {
      const path: Point2D[] = [];
      let x = Math.random() * width - width / 2;
      let y = Math.random() * height - height / 2;
      path.push({ x, y });

      const length = (Math.random() * 50 + 20) * 3; 
      let direction = Math.floor(Math.random() * 4);

      for (let i = 0; i < length; i++) {
        switch (direction) {
          case 0: x += gridSize; break;
          case 1: y += gridSize; break;
          case 2: x -= gridSize; break;
          case 3: y -= gridSize; break;
        }

        x = Math.min(Math.max(x, -width / 2), width / 2);
        y = Math.min(Math.max(y, -height / 2), height / 2);

        path.push({ x, y });

        if (Math.random() < 0.3) direction = Math.floor(Math.random() * 4);
      }
      return path;
    }

    function pathToVec3(path: Point2D[]) {
      return path.map((p) => new THREE.Vector3(p.x, p.y, 0));
    }

    function initializeAvailablePaths() {
      availablePaths.length = 0;
      for (let i = 0; i < totalLinePaths; i++) {
        availablePaths.push(createRandomPath());
      }
    }

    initializeAvailablePaths();

    // -----------------------------
    // PRE-POPULATE BACKGROUND LINES
    // -----------------------------
    const initialBackgroundLines = isMobile ? 50 : 150; 
    for (let i = 0; i < initialBackgroundLines; i++) {
      const path = createRandomPath(); 
      mergePath(path); 
    }

    // -----------------------------
    // ANIMATED LINE CLASS (No Change)
    // -----------------------------
    class AnimatedLine {
      path: Point2D[];
      geometry: THREE.BufferGeometry;
      line: THREE.Line;

      index = 1;
      speed: number;
      fading = false;
      opacity = 1;
      fadeStep: number;
      totalPoints: number;

      constructor(path: Point2D[]) {
        this.path = path;
        this.totalPoints = path.length;

        const pts = pathToVec3(path);
        this.geometry = new THREE.BufferGeometry().setFromPoints(pts);
        this.geometry.setDrawRange(0, 1);

        const material = new THREE.LineBasicMaterial({
          color: 0xb7ff6f,
          transparent: true,
          opacity: 1,
          linewidth: 1,
        });

        this.line = new THREE.Line(this.geometry, material);
        scene.add(this.line);

        const baseSpeed = Math.random() * 1.5 + 0.75;
        this.speed = baseSpeed * 3; 

        this.fadeStep = 1 / (60 * 1.5); 
      }

      update() {
        if (!this.fading) {
          this.index += this.speed;

          if (this.index >= this.totalPoints) {
            this.index = this.totalPoints;
            this.fading = true;

            mergePath(this.path); 
          }

          this.geometry.setDrawRange(0, Math.floor(this.index));
        }

        if (this.fading) {
          this.opacity -= this.fadeStep;
          (this.line.material as THREE.LineBasicMaterial).opacity = this.opacity;

          if (this.opacity <= 0) {
            this.dispose();
            return true;
          }
        }
        return false;
      }

      dispose() {
        if (this.line.parent) {
          scene.remove(this.line);
          this.geometry.dispose();
          (this.line.material as THREE.LineBasicMaterial).dispose();
        }
      }
    }

    // -----------------------------
    // ANIMATION LOOP
    // -----------------------------
    function animate() {
      requestAnimationFrame(animate);

      if (animatedLines.length < maxAnimatedLines && Math.random() < 0.2) {
        const randomIndex = Math.floor(Math.random() * availablePaths.length);
        const randomPath = availablePaths[randomIndex];
        animatedLines.push(new AnimatedLine(randomPath));
      }

      for (let i = animatedLines.length - 1; i >= 0; i--) {
        if (animatedLines[i].update()) animatedLines.splice(i, 1);
      }

      renderer.render(scene, camera);
    }

    animate();

    // -----------------------------
    // RESIZE HANDLER
    // -----------------------------
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      renderer.setSize(width, height);

      camera.left = width / -2;
      camera.right = width / 2;
      camera.top = height / 2;
      camera.bottom = height / -2;
      camera.updateProjectionMatrix();

      animatedLines.forEach((line) => line.dispose());
      animatedLines.length = 0;

      // বাফার রিসেট
      totalActiveComponents = 0;
      mergedPathSegments.length = 0; 
      mergedBackgroundGeometry.setDrawRange(0, 0); 
      mergedBackgroundGeometry.getAttribute('position').needsUpdate = true;

      initializeAvailablePaths();
      // রিসাইজের পরেও ব্যাকগ্রাউন্ড আবার পূরণ করা
      for (let i = 0; i < initialBackgroundLines; i++) {
        const path = createRandomPath();
        mergePath(path);
      }
    };

    window.addEventListener("resize", handleResize);

    // -----------------------------
    // CLEANUP
    // -----------------------------
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`${className} absolute`}>
      <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
    </div>
  );
}