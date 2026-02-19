"use client";
import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

export const StarsCanvas = () => {
  const [key, setKey] = useState(0);

  const handleContextLost = (event: any) => {
    console.warn("WebGL context lost, recovering...");
    event.preventDefault();
    // Espera un pequeño tiempo y recrea el Canvas
    setTimeout(() => {
      setKey((prev) => prev + 1);
    }, 100);
  };

  return (
    <div className="absolute inset-0 z-0" key={key}>
      <Canvas
        gl={{
          antialias: true,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", handleContextLost);
          return () => {
            canvas.removeEventListener("webglcontextlost", handleContextLost);
          };
        }}
      >
        <Stars radius={50} count={2500} factor={4} fade speed={2} />
      </Canvas>
    </div>
  );
};
