/**
 * Rendering quality tiers:
 *  - "high": full 3D, higher pixel ratio, more particles
 *  - "low":  3D with reduced pixel ratio / particle counts (mid-range phones)
 *  - "2d":   no WebGL — lightweight CSS/SVG fallbacks (low-end phones, reduced motion, data saver)
 */
export type Quality = "high" | "low" | "2d";

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function detectQuality(): Quality {
  if (typeof window === "undefined") return "low";

  const params = new URLSearchParams(window.location.search);
  const forced = params.get("quality");
  if (forced === "high" || forced === "low" || forced === "2d") return forced; // handy for testing: ?quality=2d

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "2d";
  if (!hasWebGL()) return "2d";

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "2d";

  const memory = nav.deviceMemory ?? 4; // GB (Chrome/Android only)
  const cores = nav.hardwareConcurrency ?? 4;
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  if (memory <= 2 || cores <= 2) return "2d";
  if (isMobile && (memory <= 4 || cores <= 6)) return "low";
  return "high";
}
