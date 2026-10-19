"use client";
import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LAND_BITSET_B64, LAND_POINT_COUNT } from "@/components/globe/land";
import { DESTINATIONS, ORIGINS, CORRIDORS } from "@/content/destinations";

const R = 1;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

export function latLngToVec3(lat, lng, r = R) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function landPositions() {
  const bytes = Uint8Array.from(atob(LAND_BITSET_B64), (c) => c.charCodeAt(0));
  const out = [];
  for (let i = 0; i < LAND_POINT_COUNT; i++) {
    if (!(bytes[i >> 3] & (1 << (i & 7)))) continue;
    const y = 1 - ((i + 0.5) * 2) / LAND_POINT_COUNT;
    const lat = (Math.asin(y) * 180) / Math.PI;
    let lng = ((GOLDEN * i * 180) / Math.PI) % 360;
    if (lng > 180) lng -= 360;
    const v = latLngToVec3(lat, lng, R * 1.001);
    out.push(v.x, v.y, v.z);
  }
  return new Float32Array(out);
}

function slerpArc(a, b, steps = 64) {
  const va = a.clone().normalize();
  const vb = b.clone().normalize();
  const omega = va.angleTo(vb);
  const lift = Math.min(0.42, 0.08 + omega * 0.22);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const s = Math.sin(omega) || 1;
    const p = va.clone().multiplyScalar(Math.sin((1 - t) * omega) / s).add(vb.clone().multiplyScalar(Math.sin(t * omega) / s));
    pts.push(p.normalize().multiplyScalar(R + lift * Math.sin(Math.PI * t)));
  }
  return new THREE.CatmullRomCurve3(pts);
}

const dotsVertex = /* glsl */ `
  uniform float uSize;
  uniform float uPixelRatio;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFacing = normalize(normalMatrix * normalize(position)).z;
    gl_PointSize = uSize * uPixelRatio / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const dotsFragment = /* glsl */ `
  uniform vec3 uFront;
  uniform vec3 uBack;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    float a = smoothstep(-0.15, 0.55, vFacing);
    gl_FragColor = vec4(mix(uBack, uFront, smoothstep(0.0, 0.85, vFacing)), a * 0.95);
  }
`;
const sphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const sphereFragment = /* glsl */ `
  uniform vec3 uCore;
  uniform vec3 uRim;
  varying vec3 vNormal;
  void main() {
    float rim = pow(1.0 - max(vNormal.z, 0.0), 2.6);
    gl_FragColor = vec4(mix(uCore, uRim, rim * 0.8), 1.0);
  }
`;
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  void main() {
    float i = pow(max(0.0, 0.64 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.6);
    gl_FragColor = vec4(uColor, 1.0) * i * 0.95;
  }
`;
const arcVertex = /* glsl */ `
  varying float vT;
  void main() {
    vT = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFragment = /* glsl */ `
  uniform float uTime;
  uniform float uOffset;
  uniform float uSpeed;
  uniform float uEmphasis;
  uniform vec3 uColor;
  uniform vec3 uHead;
  varying float vT;
  void main() {
    float head = fract(uTime * uSpeed + uOffset);
    float d = head - vT;
    float trail = d >= 0.0 ? exp(-d * 10.0) : 0.0;
    float edge = smoothstep(0.0, 0.05, vT) * smoothstep(1.0, 0.95, vT);
    float base = 0.14 * uEmphasis;
    vec3 col = mix(uColor, uHead, trail);
    gl_FragColor = vec4(col, (base + trail * 0.95 * uEmphasis) * edge);
  }
`;

function Atmosphere() {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color("#2dd4bf") } }), []);
  return (
    <mesh scale={1.18}>
      <sphereGeometry args={[R, 64, 64]} />
      <shaderMaterial vertexShader={sphereVertex} fragmentShader={glowFragment} uniforms={uniforms} side={THREE.BackSide} blending={THREE.AdditiveBlending} transparent depthWrite={false} />
    </mesh>
  );
}

function Stars() {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const n = 700;
    const pos = new Float32Array(n * 3);
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize().multiplyScalar(7 + rand() * 6);
      pos.set([v.x, v.y, v.z], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.025} color="#9be7dc" transparent opacity={0.45} sizeAttenuation depthWrite={false} />
    </points>
  );
}

function Arc({ curve, offset, emphasis, reduced }) {
  const geometry = useMemo(() => new THREE.TubeGeometry(curve, 72, 0.0042, 6, false), [curve]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOffset: { value: offset },
      uSpeed: { value: 0.22 },
      uEmphasis: { value: 1 },
      uColor: { value: new THREE.Color("#2dd4bf") },
      uHead: { value: new THREE.Color("#fff7d6") },
    }),
    [offset]
  );
  const material = useRef(null);
  useFrame((state, delta) => {
    const u = material.current?.uniforms;
    if (!u) return;
    if (!reduced) u.uTime.value += delta;
    u.uEmphasis.value += (emphasis - u.uEmphasis.value) * Math.min(1, delta * 6);
  });
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <shaderMaterial ref={material} vertexShader={arcVertex} fragmentShader={arcFragment} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function HubMarker({ position, active, reduced }) {
  const ring = useRef(null);
  const quat = useMemo(() => new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), position.clone().normalize()), [position]);
  useFrame((state) => {
    if (!ring.current) return;
    const t = reduced ? 0.5 : (state.clock.elapsedTime * 0.7) % 1;
    const s = 0.02 + t * (active ? 0.09 : 0.06);
    ring.current.scale.setScalar(s / 0.02);
    ring.current.material.opacity = (1 - t) * (active ? 0.9 : 0.55);
  });
  return (
    <group position={position} quaternion={quat}>
      <mesh>
        <circleGeometry args={[active ? 0.016 : 0.012, 24]} />
        <meshBasicMaterial color={active ? "#fff7d6" : "#5eead4"} transparent depthWrite={false} />
      </mesh>
      <mesh ref={ring} position={[0, 0, 0.001]}>
        <ringGeometry args={[0.017, 0.02, 40]} />
        <meshBasicMaterial color="#5eead4" transparent depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene({ focus, reduced, dragRef, labelRefs }) {
  const group = useRef(null);
  const dotMaterial = useRef(null);
  const fitted = useRef({ width: 0, height: 0 });
  const land = useMemo(() => landPositions(), []);
  const dotUniforms = useMemo(
    () => ({ uSize: { value: 6.5 }, uPixelRatio: { value: Math.min(2, typeof window !== "undefined" ? window.devicePixelRatio : 1) }, uFront: { value: new THREE.Color("#7ff0dd") }, uBack: { value: new THREE.Color("#1b6f6a") } }),
    []
  );
  const sphereUniforms = useMemo(() => ({ uCore: { value: new THREE.Color("#061a33") }, uRim: { value: new THREE.Color("#0f4c5c") } }), []);

  const hubs = useMemo(() => DESTINATIONS.map((d) => ({ slug: d.slug, country: d.country, position: latLngToVec3(d.hub.lat, d.hub.lng, R * 1.004), lat: d.hub.lat, lng: d.hub.lng })), []);
  const origins = useMemo(() => ORIGINS.map((o) => ({ ...o, position: latLngToVec3(o.lat, o.lng, R * 1.004) })), []);
  const arcs = useMemo(
    () =>
      CORRIDORS.map(([from, to], i) => {
        const o = origins.find((x) => x.city === from);
        const h = hubs.find((x) => x.slug === to);
        if (!o || !h) return null;
        return { key: `${from}-${to}`, to, curve: slerpArc(o.position, h.position), offset: (i * 0.137) % 1 };
      }).filter(Boolean),
    [origins, hubs]
  );

  const target = useRef({ x: 0.32, y: null });
  useEffect(() => {
    const hub = hubs.find((h) => h.slug === (focus || "india"));
    const v = latLngToVec3(hub.lat, hub.lng);
    const alpha = Math.atan2(v.x, v.z);
    target.current.y = -alpha;
    target.current.x = focus ? Math.max(-0.5, Math.min(0.75, (hub.lat * Math.PI) / 180)) : 0.32;
    if (group.current && dragRef.current.initialised !== true) {
      group.current.rotation.set(target.current.x, target.current.y - 0.45, 0);
      dragRef.current.initialised = true;
    }
  }, [focus, hubs, dragRef]);

  const tmp = useMemo(() => ({ v: new THREE.Vector3(), cam: new THREE.Vector3() }), []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const { width, height } = state.size;
    if (fitted.current.width !== width || fitted.current.height !== height) {
      // Fit the globe plus its atmosphere inside the canvas at any aspect ratio, and scale dots with it.
      const half = Math.tan((state.camera.fov * Math.PI) / 360);
      state.camera.position.z = Math.max(1.32 / half, 1.32 / (half * (width / Math.max(1, height))), 3.2);
      state.camera.updateProjectionMatrix();
      const u = dotMaterial.current?.uniforms;
      if (u) {
        u.uPixelRatio.value = state.gl.getPixelRatio();
        u.uSize.value = 6.5 * Math.max(0.6, Math.min(1.8, height / 640));
      }
      fitted.current = { width, height };
    }
    // Project hub positions to screen space for the HTML label overlay.
    tmp.cam.copy(state.camera.position).normalize();
    hubs.forEach((h, i) => {
      const el = labelRefs.current[i];
      if (!el) return;
      tmp.v.copy(h.position).multiplyScalar(1.02).applyMatrix4(g.matrixWorld);
      const facing = tmp.v.clone().normalize().dot(tmp.cam);
      tmp.v.project(state.camera);
      const x = (tmp.v.x * 0.5 + 0.5) * state.size.width;
      const y = (-tmp.v.y * 0.5 + 0.5) * state.size.height;
      const o = Math.max(0, Math.min(1, (facing - 0.25) * 4));
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, ${h.slug === "singapore" ? "55%" : "-150%"})`;
      el.style.opacity = o.toFixed(2);
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
    });
    const d = dragRef.current;
    const dt = Math.min(delta, 0.05);
    if (d.dragging) {
      d.lastInteraction = performance.now();
    } else if (Math.abs(d.vy) > 0.0001 || Math.abs(d.vx) > 0.0001) {
      g.rotation.y += d.vy;
      g.rotation.x = Math.max(-0.6, Math.min(0.9, g.rotation.x + d.vx));
      d.vy *= 0.94;
      d.vx *= 0.9;
    } else {
      const idle = performance.now() - (d.lastInteraction || 0) > 2500;
      if (focus) {
        // shortest path to the focused hub
        let dy = target.current.y - g.rotation.y;
        dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        g.rotation.y += dy * Math.min(1, dt * 3.2);
        g.rotation.x += (target.current.x - g.rotation.x) * Math.min(1, dt * 3);
      } else if (idle && !reduced) {
        g.rotation.y += dt * 0.08;
        g.rotation.x += (0.32 - g.rotation.x) * Math.min(1, dt * 0.8);
      }
    }
    if (d.pending) {
      g.rotation.y += d.pending.dy;
      g.rotation.x = Math.max(-0.6, Math.min(0.9, g.rotation.x + d.pending.dx));
      d.pending = null;
    }
  });

  return (
    <>
      <Stars />
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[R * 0.995, 96, 96]} />
          <shaderMaterial vertexShader={sphereVertex} fragmentShader={sphereFragment} uniforms={sphereUniforms} />
        </mesh>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[land, 3]} />
          </bufferGeometry>
          <shaderMaterial ref={dotMaterial} vertexShader={dotsVertex} fragmentShader={dotsFragment} uniforms={dotUniforms} transparent depthWrite={false} />
        </points>
        {arcs.map((a) => (
          <Arc key={a.key} curve={a.curve} offset={a.offset} reduced={reduced} emphasis={!focus || a.to === focus ? 1 : 0.18} />
        ))}
        {hubs.map((h) => (
          <HubMarker key={h.slug} position={h.position} active={focus === h.slug} reduced={reduced} />
        ))}
        {origins.map((o) => (
          <mesh key={o.city} position={o.position}>
            <sphereGeometry args={[0.0075, 10, 10]} />
            <meshBasicMaterial color="#cdefea" />
          </mesh>
        ))}
      </group>
      <Atmosphere />
    </>
  );
}

export default function Globe({ focus, onSelect, reduced, active = true }) {
  const labelRefs = useRef([]);
  const dragRef = useRef({ dragging: false, vx: 0, vy: 0, lastX: 0, lastY: 0, lastInteraction: 0, pending: null, initialised: false });
  const wrap = useRef(null);

  function onPointerDown(e) {
    if (e.target.closest("button")) return;
    const d = dragRef.current;
    d.dragging = true;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.vx = d.vy = 0;
    wrap.current?.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d.dragging) return;
    const dx = e.clientX - d.lastX;
    const dy = e.clientY - d.lastY;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    d.vy = dx * 0.0055;
    d.vx = dy * 0.004;
    d.pending = { dy: d.vy, dx: d.vx };
  }
  function onPointerUp(e) {
    dragRef.current.dragging = false;
    dragRef.current.lastInteraction = performance.now();
    wrap.current?.releasePointerCapture?.(e.pointerId);
  }

  return (
    <div
      ref={wrap}
      className="relative h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Interactive globe showing care corridors from patients' home cities to treatment destinations. Drag to rotate."
      role="img"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 3.05], fov: 40, near: 0.1, far: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={active ? "always" : "never"}
      >
        <Scene focus={focus} reduced={reduced} dragRef={dragRef} labelRefs={labelRefs} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.slug}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            onClick={() => onSelect?.(d.slug)}
            style={{ opacity: 0, transform: "translate(-9999px, -9999px)" }}
            className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md transition-colors ${
              focus === d.slug ? "bg-white text-ink-900 shadow-glow" : "bg-ink-950/60 text-white ring-1 ring-white/20 hover:bg-ink-900/90"
            }`}
          >
            {d.country}
          </button>
        ))}
      </div>
    </div>
  );
}
