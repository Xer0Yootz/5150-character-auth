import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { useLoader, Suspense, useMemo } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';

function applyAccent(object, accentColor) {
  if (!object || !accentColor) return;
  const color = new THREE.Color(accentColor);
  object.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((mat) => {
      if (!mat) return;
      const next = mat.clone();
      if (next.color) next.color.copy(color);
      if (next.emissive) {
        next.emissive.copy(color);
        next.emissiveIntensity = Math.max(next.emissiveIntensity || 0, 0.25);
      }
      child.material = Array.isArray(child.material) ? mats.map((m) => (m === mat ? next : m)) : next;
    });
  });
}

function LoadedGLB({ url, accentColor }) {
  const { scene } = useGLTF(url);
  const tinted = useMemo(() => {
    const clone = scene.clone(true);
    applyAccent(clone, accentColor);
    return clone;
  }, [scene, accentColor]);
  return <primitive object={tinted} scale={1.4} position={[0, -0.8, 0]} />;
}

function LoadedOBJ({ url, accentColor }) {
  const obj = useLoader(OBJLoader, url);
  const tinted = useMemo(() => {
    const clone = obj.clone(true);
    applyAccent(clone, accentColor);
    return clone;
  }, [obj, accentColor]);
  return <primitive object={tinted} scale={1.4} position={[0, -0.8, 0]} />;
}

function LoadedSTL({ url, accentColor }) {
  const geometry = useLoader(STLLoader, url);
  const color = accentColor || '#c8c8d0';
  return (
    <mesh geometry={geometry} scale={1.4} position={[0, -0.8, 0]}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} metalness={0.4} roughness={0.5} />
    </mesh>
  );
}

function ModelByUrl({ url, accentColor }) {
  if (!url) return null;
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.obj')) return <LoadedOBJ url={url} accentColor={accentColor} />;
  if (lower.endsWith('.stl')) return <LoadedSTL url={url} accentColor={accentColor} />;
  return <LoadedGLB url={url} accentColor={accentColor} />;
}

function Placeholder({ accentColor }) {
  const color = accentColor || '#00f0ff';
  return (
    <mesh position={[0, 0.2, 0]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} wireframe />
    </mesh>
  );
}

export default function ModelViewer({ modelUrl, accentColor, height = 280 }) {
  return (
    <div className="model-viewer" style={{ height }}>
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 42 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <pointLight position={[-2, 1, -2]} color={accentColor || '#c300ff'} intensity={0.8} />
        <Suspense fallback={<Placeholder accentColor={accentColor} />}>
          {modelUrl ? <ModelByUrl url={modelUrl} accentColor={accentColor} /> : <Placeholder accentColor={accentColor} />}
        </Suspense>
        <ContactShadows position={[0, -1.1, 0]} opacity={0.4} scale={4} blur={2} />
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={2} maxDistance={6} />
      </Canvas>
    </div>
  );
}
