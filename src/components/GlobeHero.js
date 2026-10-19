"use client";
import { Component, useEffect, useRef, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";

const Globe = dynamic(() => import("@/components/globe/Globe"), {
  ssr: false,
  loading: () => <GlobeFallback pulsing />,
});

function GlobeFallback({ pulsing }) {
  return (
    <div aria-hidden className="flex h-full w-full items-center justify-center">
      <div
        className={`aspect-square w-[78%] rounded-full ${pulsing ? "animate-pulse" : ""}`}
        style={{
          background: "radial-gradient(circle at 35% 30%, rgba(94,234,212,0.28), rgba(6,26,51,0.95) 62%), radial-gradient(circle, rgba(45,212,191,0.25), transparent 70%)",
          boxShadow: "0 0 120px 10px rgba(45,212,191,0.18), inset 0 0 60px rgba(94,234,212,0.15)",
        }}
      />
    </div>
  );
}

class GlobeBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <GlobeFallback /> : this.props.children;
  }
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

let webglSupport = null;
const readWebgl = () => (webglSupport ??= hasWebGL());
const noSubscribe = () => () => {};

export default function GlobeHero({ focus, onSelect, className }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const webgl = useSyncExternalStore(noSubscribe, readWebgl, () => null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {webgl === false ? (
        <GlobeFallback />
      ) : webgl ? (
        <GlobeBoundary>
          <Globe focus={focus} onSelect={onSelect} reduced={Boolean(reduced)} active={visible} />
        </GlobeBoundary>
      ) : (
        <GlobeFallback pulsing />
      )}
    </div>
  );
}
