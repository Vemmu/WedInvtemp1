/**
 * A toran: the festive doorway garland of marigolds and mango leaves.
 * Pure SVG; `swing` adds a gentle sway to the hanging strands.
 */
export function Toran({ className = "", strands = 13, swing = true }: { className?: string; strands?: number; swing?: boolean }) {
  const w = 600;
  return (
    <svg viewBox={`0 0 ${w} 120`} className={className} aria-hidden preserveAspectRatio="xMidYMin meet">
      {/* rope */}
      <path d={`M0 10 Q ${w / 2} 34 ${w} 10`} fill="none" stroke="#B08D22" strokeWidth="3" />
      {/* marigold swag */}
      {Array.from({ length: 40 }).map((_, i) => {
        const t = i / 39;
        const x = t * w;
        const y = 10 + Math.sin(t * Math.PI) * 24;
        return <circle key={i} cx={x} cy={y} r="7" fill={i % 2 ? "#F7A70F" : "#F28C0F"} stroke="#D9730A" strokeWidth="0.8" />;
      })}
      {/* hanging strands with mango leaves */}
      {Array.from({ length: strands }).map((_, i) => {
        const t = (i + 0.5) / strands;
        const x = t * w;
        const y = 10 + Math.sin(t * Math.PI) * 24;
        const len = i % 2 ? 54 : 74;
        return (
          <g key={i} className={swing ? "origin-top animate-swing" : ""} style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${(i % 5) * 0.35}s` }}>
            {Array.from({ length: Math.round(len / 12) }).map((_, k) => (
              <circle key={k} cx={x} cy={y + 10 + k * 12} r="5.5" fill={k % 2 ? "#F28C0F" : "#F7C71C"} />
            ))}
            <path d={`M${x} ${y + len + 4} q 9 14 0 30 q -9 -16 0 -30`} fill="#3E7B3A" />
          </g>
        );
      })}
    </svg>
  );
}
