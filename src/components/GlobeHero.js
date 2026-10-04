"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RADIUS = 2.2;

function latLngToVec3(lat, lng, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const DESTINATION = { lat: 12.9716, lng: 77.5946 }; // Bangalore
const SOURCES = [
  { lat: 25.2048, lng: 55.2708, label: "UAE" },
  { lat: 51.5072, lng: -0.1276, label: "UK" },
  { lat: 40.7128, lng: -74.006, label: "USA" },
  { lat: 43.6532, lng: -79.3832, label: "Canada" },
  { lat: -33.8688, lng: 151.2093, label: "Australia" },
  { lat: -1.2921, lng: 36.8219, label: "Kenya" },
  { lat: 23.685, lng: 90.3563, label: "Bangladesh" },
];

function arcPoints(a, b, segments = 64) {
  const start = latLngToVec3(a.lat, a.lng);
  const end = latLngToVec3(b.lat, b.lng);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const midLen = mid.length();
  mid.normalize().multiplyScalar(midLen + start.distanceTo(end) * 0.55);
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
  return curve.getPoints(segments);
}

function Arc({ from, to, delay }) {
  const points = useMemo(() => arcPoints(from, to), [from, to]);
  const ref = useRef();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(points);
    return g;
  }, [points]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.25 + delay) % 1;
    const material = ref.current.material;
    material.opacity = 0.15 + 0.65 * Math.sin(t * Math.PI);
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#8fd6cc" transparent opacity={0.4} />
    </line>
  );
}

function Marker({ lat, lng, label }) {
  const pos = latLngToVec3(lat, lng, RADIUS + 0.01);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.025, 8, 8]} />
      <meshBasicMaterial color="#C9A66B" />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef();
  const wireGeo = useMemo(() => new THREE.SphereGeometry(RADIUS, 32, 32), []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={wireGeo}>
        <meshBasicMaterial
          color="#16375c"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
      <mesh scale={0.995}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial color="#0a1c30" transparent opacity={0.9} />
      </mesh>
      <Marker lat={DESTINATION.lat} lng={DESTINATION.lng} label="India" />
      {SOURCES.map((s, i) => (
        <Marker key={s.label} lat={s.lat} lng={s.lng} label={s.label} />
      ))}
      {SOURCES.map((s, i) => (
        <Arc key={s.label} from={s} to={DESTINATION} delay={i / SOURCES.length} />
      ))}
    </group>
  );
}

function Starfield() {
  const positions = useMemo(() => {
    const arr = new Float32Array(600 * 3);
    for (let i = 0; i < 600; i++) {
      const r = 8 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#4B5D6B" size={0.02} sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

export default function GlobeHero() {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0.4, 5.2], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <Starfield />
          <Globe />
        </Suspense>
      </Canvas>
    </div>
  );
}
