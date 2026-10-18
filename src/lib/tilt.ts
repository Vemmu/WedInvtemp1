/**
 * Shared, mutable pointer/tilt state read by 3D scenes inside useFrame.
 * Kept outside React so updating it never triggers re-renders.
 *
 * x / y are normalised to roughly [-1, 1].
 */
export const tilt = { x: 0, y: 0, active: false };

let listening = false;

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  tilt.active = true;
  // gamma: left/right (-90..90), beta: front/back (-180..180). Phones are usually held ~45° upright.
  tilt.x = Math.max(-1, Math.min(1, e.gamma / 30));
  tilt.y = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
}

/**
 * Starts listening to phone tilt. On iOS this must be called from a user gesture
 * (we call it when the guest taps "Open Invitation").
 */
export async function enableTilt() {
  if (listening || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
  try {
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<"granted" | "denied"> };
    if (typeof DOE.requestPermission === "function") {
      const res = await DOE.requestPermission();
      if (res !== "granted") return;
    }
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    listening = true;
  } catch {
    /* permission denied or unsupported — mouse/touch still works */
  }
}
