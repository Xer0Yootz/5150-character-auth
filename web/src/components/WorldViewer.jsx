import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { Suspense, useRef } from 'react';

function PlaceholderCharacter() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <mesh ref={ref} position={[0, 0.6, 0]} castShadow>
      <icosahedronGeometry args={[0.7, 1]} />
      <meshStandardMaterial color="#00f0ff" emissive="#c300ff" emissiveIntensity={0.35} roughness={0.4} metalness={0.2} wireframe />
    </mesh>
  );
}

function LoadedCharacter({ url }) {
  const { scene } = useGLTF(url);
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return <primitive object={scene} scale={1.2} position={[0, 0, 0]} />;
}

function ProceduralGarden() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#00ccff" emissive="#0088aa" emissiveIntensity={0.2} transparent opacity={0.55} roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[-2.4, 2.8, -5]}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#ff66aa" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 1.6, 0.8, -3 - (i % 2)]} rotation={[0, 0, (i % 2 ? 0.2 : -0.2)]} castShadow>
          <coneGeometry args={[0.16, 1.6 + (i % 3) * 0.4, 6]} />
          <meshStandardMaterial color="#0a1a12" emissive="#00ff88" emissiveIntensity={0.25} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function PlaceholderWorld() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial color="#1a1a28" roughness={0.85} metalness={0.05} />
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
  const isGarden = viewMode === 'procedural';

  return (
    <div className="model-viewer" style={{ height, background: bg }}>
      {viewMode === 'plate' ? (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'end center', paddingBottom: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #00f0ff', background: 'rgba(0,240,255,0.12)', display: 'grid', placeItems: 'center', color: '#00f0ff', fontSize: 12 }}>N</div>
        </div>
      ) : (
        <Canvas shadows camera={{ position: [0, 1.6, 4.2], fov: 42 }}>
          <fog attach="fog" args={[isGarden ? '#4a1848' : (lightsOn ? '#0a0a14' : '#000'), 8, 22]} />
          <hemisphereLight
            args={[isGarden ? '#ff88cc' : '#88aaff', isGarden ? '#00aa88' : '#1a1a28', lightsOn ? 0.55 : 0.08]}
          />
          <directionalLight
            position={isGarden ? [-3, 6, -2] : [4, 6, 3]}
            intensity={lightsOn ? 1.4 : 0}
            color={isGarden ? '#ff6699' : '#fff4e0'}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={20}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
          />
          <directionalLight
            position={[2, 3, 4]}
            intensity={lightsOn ? 0.35 : 0}
            color={isGarden ? '#66ccff' : '#aaccff'}
          />
          <pointLight position={[-2.5, 1.2, 1]} color="#c300ff" intensity={lightsOn ? 0.6 : 0.1} distance={8} decay={2} />
          <pointLight position={[2.8, 0.8, -1]} color="#00ffaa" intensity={lightsOn ? 0.45 : 0.08} distance={7} decay={2} />
          <Suspense fallback={null}>
            {isGarden ? <ProceduralGarden /> : worldUrl ? null : <PlaceholderWorld />}
            {modelUrl ? <LoadedCharacter url={modelUrl} /> : <PlaceholderCharacter />}
          </Suspense>
          <ContactShadows position={[0, 0.01, 0]} opacity={lightsOn ? 0.5 : 0.12} scale={8} blur={2.8} far={4} />
          <Environment preset={lightsOn ? (isGarden ? 'sunset' : 'city') : 'night'} />
          <OrbitControls enablePan={false} minDistance={2.5} maxDistance={8} />
        </Canvas>
      )}
    </div>
  );
}
