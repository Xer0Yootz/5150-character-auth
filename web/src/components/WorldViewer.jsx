import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';

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

function ProceduralGarden() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#00ccff" emissive="#0088aa" emissiveIntensity={0.35} transparent opacity={0.55} />
      </mesh>
      <mesh position={[-2.4, 2.8, -5]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#ff66aa" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 1.6, 0.8, -3 - (i % 2)]} rotation={[0, 0, (i % 2 ? 0.2 : -0.2)]}>
          <coneGeometry args={[0.16, 1.6 + (i % 3) * 0.4, 6]} />
          <meshStandardMaterial color="#0a1a12" emissive="#00ff88" emissiveIntensity={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function PlaceholderWorld() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a1a28" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function WorldViewer({
  modelUrl,
  worldUrl,
  viewMode = 'procedural',
  plateUrl,
  height = 280,
  lightsOn = true
}) {
  const bg = viewMode === 'plate' && plateUrl ? `url(${plateUrl}) center/cover no-repeat` : undefined;

  return (
    <div className="model-viewer" style={{ height, background: bg }}>
      {viewMode === 'plate' ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'end center', paddingBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #00f0ff', background: 'rgba(0,240,255,0.12)', display: 'grid', placeItems: 'center', color: '#00f0ff', fontSize: 12 }}>N</div>
        </div>
      ) : (
        <Canvas camera={{ position: [0, 1.6, 4.2], fov: 42 }}>
          <fog attach="fog" args={[viewMode === 'procedural' ? '#6a2068' : (lightsOn ? '#0a0a14' : '#000'), 6, 16]} />
          <ambientLight intensity={lightsOn ? 0.45 : 0.05} />
          <directionalLight position={[4, 6, 3]} intensity={lightsOn ? 1.1 : 0} color={viewMode === 'procedural' ? '#ff4488' : '#ffffff'} />
          <pointLight position={[-2.5, 1.5, -1]} color="#c300ff" intensity={lightsOn ? 0.7 : 0.15} />
          <Suspense fallback={null}>
            {viewMode === 'procedural' ? <ProceduralGarden /> : worldUrl ? null : <PlaceholderWorld />}
            {modelUrl ? <LoadedCharacter url={modelUrl} /> : <PlaceholderCharacter />}
          </Suspense>
          <ContactShadows position={[0, 0.01, 0]} opacity={lightsOn ? 0.45 : 0.15} scale={6} blur={2.5} />
          {viewMode !== 'procedural' && <Environment preset={lightsOn ? 'city' : 'night'} />}
          <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} />
        </Canvas>
      )}
    </div>
  );
}
