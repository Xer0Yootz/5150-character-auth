import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { useLoader, Suspense } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

function LoadedGLB({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.4} position={[0, -0.8, 0]} />;
}

function LoadedOBJ({ url }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} scale={1.4} position={[0, -0.8, 0]} />;
}

function LoadedSTL({ url }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh geometry={geometry} scale={1.4} position={[0, -0.8, 0]}>
      <meshStandardMaterial color="#c8c8d0" metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

function ModelByUrl({ url }) {
  if (!url) return null;
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.obj')) return <LoadedOBJ url={url} />;
  if (lower.endsWith('.stl')) return <LoadedSTL url={url} />;
  return <LoadedGLB url={url} />;
}

function Placeholder() {
  return (
    <mesh position={[0, 0.2, 0]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#00f0ff" emissive="#c300ff" emissiveIntensity={0.35} wireframe />
    </mesh>
  );
}

export default function ModelViewer({ modelUrl, height = 280 }) {
  return (
    <div className="model-viewer" style={{ height }}>
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 42 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <pointLight position={[-2, 1, -2]} color="#c300ff" intensity={0.8} />
        <Suspense fallback={<Placeholder />}>
          {modelUrl ? <ModelByUrl url={modelUrl} /> : <Placeholder />}
        </Suspense>
        <ContactShadows position={[0, -1.1, 0]} opacity={0.4} scale={4} blur={2} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
}
