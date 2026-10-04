"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const RADIUS = 1.6;

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
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.22 + delay) % 1;
    ref.current.material.opacity = 0.25 + 0.65 * Math.sin(t * Math.PI);
  });

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color="#ff6b81" transparent opacity={0.5} />
    </line>
  );
}

function Marker({ lat, lng, gold }) {
  const pos = latLngToVec3(lat, lng, RADIUS + 0.015);
  return (
    <mesh position={pos}>
      <sphereGeometry args={[gold ? 0.045 : 0.03, 10, 10]} />
      <meshBasicMaterial color={gold ? "#d9a441" : "#2f6fed"} />
    </mesh>
  );
}

function Globe() {
  const groupRef = useRef();
  const wireGeo = useMemo(() => new THREE.SphereGeometry(RADIUS, 36, 36), []);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.09;
  });

  return (
    <group ref={groupRef}>
      <mesh scale={0.99}>
        <sphereGeometry args={[RADIUS, 64, 64]} />
        <meshBasicMaterial color="#eaf2ff" transparent opacity={0.35} />
      </mesh>
      <mesh geometry={wireGeo}>
        <meshBasicMaterial color="#2f6fed" wireframe transparent opacity={0.3} />
      </mesh>
      <Marker lat={DESTINATION.lat} lng={DESTINATION.lng} gold />
      {SOURCES.map((s) => (
        <Marker key={s.label} lat={s.lat} lng={s.lng} />
      ))}
      {SOURCES.map((s, i) => (
        <Arc key={s.label} from={s} to={DESTINATION} delay={i / SOURCES.length} />
      ))}
    </group>
  );
}

export default function GlobeHero() {
  return (
    <div className="absolute inset-0 flex items-start justify-center pt-20">
      <div className="w-full max-w-[680px] aspect-square opacity-80">
        <Canvas camera={{ position: [0, 0.4, 6.4], fov: 42 }} dpr={[1, 1.5]}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.9} />
            <Globe />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
