import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows, Html } from '@react-three/drei';
import { Suspense, useRef, useState } from 'react';

function PlaceholderCharacter() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref} position={[0, 0.6, 0]}>
      <icosahedronGeometry args={[0.7, 1]} />
      <meshStandardMaterial color="#00f0ff" emissive="#c300ff" emissiveIntensity={0.45} wireframe />
    </mesh>
  );
}

function LoadedCharacter({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.2} position={[0, 0, 0]} />;
}

function PlaceholderWorld({ caste }) {
  const color = caste?.toLowerCase().includes('garden') ? '#1a3a2a' : '#1a1a28';
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.5, -3]}>
        <boxGeometry args={[4, 3, 0.2]} />
        <meshStandardMaterial color="#0c0c16" emissive="#c300ff" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[-2.2, 0.4, 1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[2.2, 0.4, 1.2]}>
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
        <meshStandardMaterial color="#ff00c8" emissive="#ff00c8" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function LoadedWorld({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

export default function WorldViewer({
  modelUrl,
  worldUrl,
  caste,
  height = 280,
  lightsOn = true
}) {
  return (
    <div className="model-viewer" style={{ height }}>
      <Canvas camera={{ position: [0, 1.6, 4.2], fov: 42 }}>
        <fog attach="fog" args={[lightsOn ? '#0a0a14' : '#000000', 6, 16]} />
        <ambientLight intensity={lightsOn ? 0.45 : 0.05} />
        <directionalLight position={[4, 6, 3]} intensity={lightsOn ? 1.1 : 0} />
        <pointLight position={[-2.5, 1.5, -1]} color="#c300ff" intensity={lightsOn ? 0.7 : 0.15} />
        <pointLight position={[2.5, 1.2, 1]} color="#00f0ff" intensity={lightsOn ? 0.5 : 0.1} />
        <Suspense fallback={null}>
          {worldUrl ? <LoadedWorld url={worldUrl} /> : <PlaceholderWorld caste={caste} />}
          {modelUrl ? <LoadedCharacter url={modelUrl} /> : <PlaceholderCharacter />}
        </Suspense>
        <ContactShadows position={[0, 0.01, 0]} opacity={lightsOn ? 0.45 : 0.15} scale={6} blur={2.5} />
        <Environment preset={lightsOn ? 'city' : 'night'} />
        <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} />
      </Canvas>
    </div>
  );
}
