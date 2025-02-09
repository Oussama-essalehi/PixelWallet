'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { AvatarModel } from './avatar-model';

interface AvatarViewerProps {
  gender: 'M' | 'F';
}

export function AvatarViewer({ gender }: AvatarViewerProps) {
  return (
    <div className="w-full h-[300px]">
      <Suspense fallback={
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">Chargement de l'avatar...</p>
        </div>
      }>
        <Canvas
          camera={{
            position: [0, 1.3, 1.5],
            fov: 30,
          }}
        >
          <OrbitControls 
            enableZoom={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
          />
          <ambientLight intensity={1} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          <AvatarModel position={[0, -1.3, 0]} scale={1} gender={gender} />
        </Canvas>
      </Suspense>
    </div>
  );
}
