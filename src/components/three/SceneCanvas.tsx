"use client";

import { Component, Suspense, useEffect, useRef, useState } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { AdaptiveDpr, PerformanceMonitor } from "@react-three/drei";
import { useExperience } from "@/components/providers/ExperienceProvider";

/**
 * If a 3D asset fails (e.g. a missing photo texture) or WebGL crashes, hide just
 * this canvas instead of taking down the whole page. The DOM content stays visible.
 */
class SceneErrorBoundary extends Component<{ children: React.ReactNode; fallback?: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[3D] scene disabled after an error:", error);
  }
  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}

type Props = {
  children: React.ReactNode;
  className?: string;
  camera?: CanvasProps["camera"];
  /** Keep rendering even when off-screen (e.g. the full-screen envelope) */
  alwaysRender?: boolean;
  /** Shown instead of the canvas if the 3D scene fails */
  fallback?: React.ReactNode;
};

/**
 * Performance-minded <Canvas>:
 *  • mounts only once it scrolls near the viewport (lazy)
 *  • pauses its render loop while off-screen
 *  • lowers pixel ratio — and eventually falls back to 2D — if FPS keeps dropping
 */
export default function SceneCanvas({ children, className, camera, alwaysRender, fallback }: Props) {
  const { quality, downgradeQuality } = useExperience();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(!!alwaysRender);
  const [visible, setVisible] = useState(!!alwaysRender);
  const [dpr, setDpr] = useState(quality === "high" ? 1.75 : 1.25);

  useEffect(() => setDpr(quality === "high" ? 1.75 : 1.25), [quality]);

  useEffect(() => {
    if (alwaysRender || !wrapRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [alwaysRender]);

  return (
    <div ref={wrapRef} className={className}>
      {mounted && (
        <SceneErrorBoundary fallback={fallback}>
          <Canvas
            frameloop={visible ? "always" : "never"}
            dpr={[1, dpr]}
            camera={camera ?? { position: [0, 0, 6], fov: 45 }}
            gl={{ antialias: quality === "high", alpha: true, powerPreference: "high-performance" }}
          >
            <PerformanceMonitor
              onDecline={() => setDpr(1)}
              // After repeated drops, switch the whole site to the 2D fallback.
              onFallback={downgradeQuality}
              flipflops={3}
            >
              <AdaptiveDpr pixelated={false} />
              <Suspense fallback={null}>{children}</Suspense>
            </PerformanceMonitor>
          </Canvas>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
