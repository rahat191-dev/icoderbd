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

    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- Three.js Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0x1e1e1e, 1);
    mountRef.current.appendChild(renderer.domElement);

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

    // --- Configuration ---
    const gridSize = 4;
    const totalLinePaths = 500;
    const maxAnimatedLines = 60; 
    const animatedLines: AnimatedLine[] = [];
    const backgroundLines: THREE.Line[] = []; 

    type Point2D = { x: number; y: number };

    // স্থির ধূসর ব্যাকগ্রাউন্ডের মেটেরিয়াল (চিকন লাইন)
    const backgroundMaterial = new THREE.LineBasicMaterial({
        color: 0x333333,
        linewidth: 0.5,
    });

    const availablePaths: Point2D[][] = [];

    // --- Path Generation ---
    function createRandomPath(): Point2D[] {
      const path: Point2D[] = [];
      let x = Math.random() * width - width / 2;
      let y = Math.random() * height - height / 2;
      path.push({ x, y });

      // Line Length 3x longer
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

    function pathToVector3(path: Point2D[]): THREE.Vector3[] {
      return path.map(p => new THREE.Vector3(p.x, p.y, 0));
    }

    function initializeAvailablePaths() {
        availablePaths.length = 0;
        for (let i = 0; i < totalLinePaths; i++) {
            availablePaths.push(createRandomPath());
        }
    }
    initializeAvailablePaths();

    // --- Animated Line Class (Optimized with Draw Range) ---
    class AnimatedLine {
      path: Point2D[];
      lineMesh: THREE.Line;
      backgroundMesh: THREE.Line; 
      geometry: THREE.BufferGeometry;

      index = 1; 
      speed: number;
      fading = false;
      opacity = 1;
      fadeStep: number;
      totalPoints: number;

      constructor(path: Point2D[]) {
        this.path = path;
        this.totalPoints = path.length;
        const positions = pathToVector3(this.path);
        
        // 1. স্থির ধূসর ব্যাকগ্রাউন্ড লাইন তৈরি: এটি Initially Hidden
        const bgGeometry = new THREE.BufferGeometry().setFromPoints(positions);
        this.backgroundMesh = new THREE.Line(bgGeometry, backgroundMaterial);
        this.backgroundMesh.visible = false; 
        scene.add(this.backgroundMesh);
        backgroundLines.push(this.backgroundMesh); 

        // 2. অ্যানিমেটেড সবুজ লাইন তৈরি 
        this.geometry = new THREE.BufferGeometry().setFromPoints(positions);
        this.geometry.setDrawRange(0, 1); 
        
        const animMaterial = new THREE.LineBasicMaterial({
            color: 0xb7ff6f,
            transparent: true,
            opacity: 1,
            linewidth: 0.5,
        });
        this.lineMesh = new THREE.Line(this.geometry, animMaterial);
        scene.add(this.lineMesh);
        
        // গতি ৩ গুণ বাড়ানো হয়েছে
        const baseSpeed = Math.random() * 1.5 + 0.75;
        this.speed = baseSpeed * 3; 

        // ✅ ফেইড আউট গতি ২ গুণ দ্রুত: (1 / (60 * 3)) এর বদলে (1 / (60 * 1.5))
        this.fadeStep = 1 / (60 * 1.5); // 1.5 সেকেন্ডের ফেইড টাইম
      }

      update(): boolean {
        // Line drawing animation
        if (!this.fading) {
          this.index += this.speed;
          
          if (this.index >= this.totalPoints) {
            this.index = this.totalPoints;
            this.fading = true;
            // ✅ পরিবর্তন: যখন আঁকা শেষ হবে, তখনই ব্যাকগ্রাউন্ড visible হবে
            this.backgroundMesh.visible = true; 
          }
          
          this.geometry.setDrawRange(0, Math.floor(this.index));

        }

        // Fading animation
        if (this.fading) {
          this.opacity -= this.fadeStep;
          (this.lineMesh.material as THREE.LineBasicMaterial).opacity = this.opacity;

          if (this.opacity <= 0) {
            
            this.dispose();
            return true;
          }
        }
        return false;
      }

      dispose() {
          if (this.lineMesh.parent) {
              scene.remove(this.lineMesh);
              this.geometry.dispose();
              (this.lineMesh.material as THREE.LineBasicMaterial).dispose();
          }
      }
    }

    // --- Animation Loop ---
    function animate() {
      requestAnimationFrame(animate);

      // Spawn new animated lines
      if (animatedLines.length < maxAnimatedLines && Math.random() < 0.2) {
        const randomPath = availablePaths[Math.floor(Math.random() * availablePaths.length)];
        animatedLines.push(new AnimatedLine(randomPath)); 
      }

      // Update and remove finished lines
      for (let i = animatedLines.length - 1; i >= 0; i--) {
        if (animatedLines[i].update()) animatedLines.splice(i, 1);
      }

      renderer.render(scene, camera);
    }

    animate();

    // --- Cleanup & Resize Handler ---
    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;

        renderer.setSize(width, height);
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();

        animatedLines.forEach(line => line.dispose());
        animatedLines.length = 0;

        backgroundLines.forEach(line => {
            scene.remove(line);
            line.geometry.dispose();
        });
        backgroundLines.length = 0;

        initializeAvailablePaths();
    };


    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={`${className} relative`}>
      <div ref={mountRef} className="w-full h-full absolute top-0 left-0" />
    </div>;
}