import React from "react";

/**
 * EngineeringBackground
 * ----------------------
 * Light-lavender, blueprint / technical-drawing style background.
 * No gradient blobs, no glow orbs — a real drafting grid, corner crop
 * marks, a dimension line, a protractor motif, an isometric cube and
 * a small title block, the way an actual engineering sheet is laid out.
 *
 * Usage:
 *   <div className="relative min-h-screen">
 *     <EngineeringBackground />
 *     <div className="relative z-10"> ...page content... </div>
 *   </div>
 */

const COLORS = {
  base: "#F6F3FC",
  baseSoft: "#EFE9FA",
  gridFine: "#E4DAF4",
  gridMajor: "#D0BEEE",
  ink: "#4B3878",
  accent: "#9B7EDE",
  label: "#8677AC",
};

export default function EngineeringBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: `linear-gradient(180deg, ${COLORS.base} 0%, ${COLORS.baseSoft} 100%)`,
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {/* fine drafting grid, 24px */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.gridFine} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.gridFine} 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      {/* major grid, every 5th line -> 120px */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(${COLORS.gridMajor} 1px, transparent 1px),
            linear-gradient(90deg, ${COLORS.gridMajor} 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
        }}
      />

      {/* corner crop marks */}
      <CornerMark style={{ top: 24, left: 24 }} />
      <CornerMark style={{ top: 24, right: 24 }} flipX />
      <CornerMark style={{ bottom: 24, left: 24 }} flipY />
      <CornerMark style={{ bottom: 24, right: 24 }} flipX flipY />

      {/* dimension line */}
      <div style={{ position: "absolute", top: 96, left: 120 }}>
        <DimensionLine length={260} label="260.00 mm" />
      </div>

      {/* protractor / drafting-compass motif */}
      <div style={{ position: "absolute", left: "9%", bottom: "14%", opacity: 0.5 }}>
        <ProtractorMotif />
      </div>

      {/* crosshair reference points */}
      <Crosshair style={{ left: "18%", top: "22%" }} />
      <Crosshair style={{ left: "82%", top: "14%" }} />
      <Crosshair style={{ left: "72%", top: "68%" }} />
      <Crosshair style={{ left: "30%", top: "78%" }} />

      {/* faint isometric cube */}
      <div style={{ position: "absolute", left: "78%", top: "16%", opacity: 0.35 }}>
        <IsoCube size={54} />
      </div>

      {/* title block, bottom-right, like a real drawing sheet */}
      <div style={{ position: "absolute", right: 28, bottom: 24 }}>
        <TitleBlock />
      </div>
    </div>
  );
}

function CornerMark({
  style,
  flipX = false,
  flipY = false,
}: {
  style: React.CSSProperties;
  flipX?: boolean;
  flipY?: boolean;
}) {
  return (
    <svg
      width="24"
      height="24"
      style={{
        position: "absolute",
        ...style,
        transform: `scaleX(${flipX ? -1 : 1}) scaleY(${flipY ? -1 : 1})`,
      }}
    >
      <g stroke={COLORS.ink} strokeWidth="1.4" opacity="0.6">
        <line x1="0" y1="0" x2="22" y2="0" />
        <line x1="0" y1="0" x2="0" y2="22" />
      </g>
    </svg>
  );
}

function Crosshair({ style }: { style: React.CSSProperties }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="-12 -12 24 24"
      style={{ position: "absolute", ...style }}
    >
      <g stroke={COLORS.accent} strokeWidth="1" opacity="0.55" fill="none">
        <circle r="7" />
        <line x1="-12" y1="0" x2="12" y2="0" />
        <line x1="0" y1="-12" x2="0" y2="12" />
      </g>
    </svg>
  );
}

function DimensionLine({ length, label }: { length: number; label: string }) {
  return (
    <svg width={length + 20} height="30" viewBox={`-10 -16 ${length + 20} 30`}>
      <g stroke={COLORS.ink} strokeWidth="1" opacity="0.55">
        <line x1="0" y1="0" x2={length} y2="0" />
        <line x1="0" y1="-6" x2="0" y2="6" />
        <line x1={length} y1="-6" x2={length} y2="6" />
        <path d="M0 0 L10 -3 L10 3 Z" fill={COLORS.ink} stroke="none" />
        <path d={`M${length} 0 L${length - 10} -3 L${length - 10} 3 Z`} fill={COLORS.ink} stroke="none" />
        <text
          x={length / 2}
          y="-10"
          textAnchor="middle"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="11"
          fill={COLORS.label}
          stroke="none"
          opacity="0.9"
        >
          {label}
        </text>
      </g>
    </svg>
  );
}

function ProtractorMotif() {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  const R = 46;
  return (
    <svg width={R * 2 + 8} height={R * 2 + 8} viewBox={`${-R - 4} ${-R - 4} ${R * 2 + 8} ${R * 2 + 8}`}>
      <g stroke={COLORS.ink} fill="none">
        <circle r={R} strokeWidth="1" opacity="0.5" />
        <circle r={R - 16} strokeWidth="1" opacity="0.35" />
        {ticks.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const long = deg % 90 === 0;
          const r1 = R;
          const r2 = long ? R - 8 : R - 4;
          return (
            <line
              key={deg}
              x1={r1 * Math.cos(rad)}
              y1={r1 * Math.sin(rad)}
              x2={r2 * Math.cos(rad)}
              y2={r2 * Math.sin(rad)}
              strokeWidth={long ? 1.4 : 0.8}
              opacity="0.5"
            />
          );
        })}
        <line x1={-R - 4} y1="0" x2={R + 4} y2="0" strokeWidth="0.8" opacity="0.3" />
        <line x1="0" y1={-R - 4} x2="0" y2={R + 4} strokeWidth="0.8" opacity="0.3" />
      </g>
    </svg>
  );
}

function IsoCube({ size }: { size: number }) {
  const s = size;
  const top = `0,${-s} ${s * 0.87},${-s / 2} 0,0 ${-s * 0.87},${-s / 2}`;
  const right = `0,0 ${s * 0.87},${-s / 2} ${s * 0.87},${s / 2} 0,${s}`;
  const left = `0,0 ${-s * 0.87},${-s / 2} ${-s * 0.87},${s / 2} 0,${s}`;
  return (
    <svg
      width={s * 2}
      height={s * 2}
      viewBox={`${-s} ${-s} ${s * 2} ${s * 2}`}
    >
      <g stroke={COLORS.ink} strokeWidth="1" fill="none">
        <polygon points={top} />
        <polygon points={right} />
        <polygon points={left} />
      </g>
    </svg>
  );
}

function TitleBlock() {
  return (
    <svg width="240" height="72" viewBox="0 0 240 72">
      <g stroke={COLORS.ink} strokeWidth="1" opacity="0.6">
        <rect x="0" y="0" width="240" height="72" fill="none" />
        <line x1="0" y1="24" x2="240" y2="24" />
        <line x1="0" y1="48" x2="240" y2="48" />
        <line x1="120" y1="24" x2="120" y2="72" />
        <line x1="180" y1="24" x2="180" y2="48" />
        <text
          x="10"
          y="16"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="10"
          letterSpacing="1.5"
          fill={COLORS.label}
          stroke="none"
        >
          PROJECT — STRUCTURE
        </text>
        <text
          x="10"
          y="40"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="9"
          fill={COLORS.label}
          stroke="none"
          opacity="0.85"
        >
          SCALE 1:20
        </text>
        <text
          x="130"
          y="40"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="9"
          fill={COLORS.label}
          stroke="none"
          opacity="0.85"
        >
          SHEET 01/01
        </text>
        <text
          x="10"
          y="64"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="9"
          fill={COLORS.label}
          stroke="none"
          opacity="0.85"
        >
          REV. A
        </text>
        <text
          x="190"
          y="64"
          fontFamily="'JetBrains Mono', 'Courier New', monospace"
          fontSize="9"
          fill={COLORS.label}
          stroke="none"
          opacity="0.85"
        >
          A-4
        </text>
      </g>
    </svg>
  );
}
