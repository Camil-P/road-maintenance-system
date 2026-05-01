import type { WorkType } from "./types";

interface Props {
  workType: WorkType;
  phase: "before" | "after";
  className?: string;
}

export function WorkPhoto({ workType, phase, className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 120"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      aria-hidden="true"
    >
      {RENDER[workType](phase)}
    </svg>
  );
}

const RENDER: Record<WorkType, (phase: "before" | "after") => JSX.Element> = {
  asphalt_patch: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-asph-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3d46" />
          <stop offset="100%" stopColor="#1f2128" />
        </linearGradient>
        <pattern id={`speck-${phase}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="2" r="0.6" fill="rgba(255,255,255,0.07)" />
          <circle cx="4" cy="4.5" r="0.4" fill="rgba(255,255,255,0.05)" />
        </pattern>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-asph-${phase})`} />
      <rect width="200" height="120" fill={`url(#speck-${phase})`} />
      {/* lane line */}
      <rect x="96" y="0" width="2" height="120" fill="rgba(245,165,36,0.5)" strokeDasharray="6 6" />
      {/* dashed center markings */}
      {[10, 30, 50, 70, 90, 110].map((y) => (
        <rect key={y} x="96" y={y} width="2" height="6" fill="#F5A524" opacity="0.85" />
      ))}
      {phase === "before" ? (
        <>
          {/* potholes */}
          <ellipse cx="58" cy="70" rx="22" ry="11" fill="#0f1014" />
          <ellipse cx="58" cy="69" rx="20" ry="9" fill="#1a1c22" />
          <ellipse cx="58" cy="69" rx="14" ry="6" fill="#0a0b0d" />
          <ellipse cx="142" cy="40" rx="14" ry="7" fill="#0f1014" />
          <ellipse cx="142" cy="40" rx="11" ry="5" fill="#1a1c22" />
          <ellipse cx="142" cy="40" rx="6" ry="3" fill="#0a0b0d" />
          {/* warning cone */}
          <polygon points="30,98 38,98 42,82 26,82" fill="#FF5A1F" />
          <rect x="26" y="92" width="16" height="3" fill="white" opacity="0.85" />
        </>
      ) : (
        <>
          {/* fresh asphalt patch — slightly lighter rectangle */}
          <rect x="36" y="58" width="44" height="22" rx="2" fill="#2c2f37" />
          <rect x="36" y="58" width="44" height="22" rx="2" fill="rgba(255,255,255,0.04)" />
          <rect x="128" y="32" width="28" height="16" rx="2" fill="#2c2f37" />
          <rect x="128" y="32" width="28" height="16" rx="2" fill="rgba(255,255,255,0.04)" />
          {/* fresh seal seam */}
          <path d="M36 58 H80 M36 80 H80" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
        </>
      )}
    </g>
  ),
  sign_replace: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-sign-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7DB7E8" />
          <stop offset="100%" stopColor="#B8D7EE" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-sign-${phase})`} />
      {/* horizon */}
      <rect y="86" width="200" height="34" fill="#7DC768" />
      <rect y="86" width="200" height="34" fill="rgba(0,0,0,0.08)" />
      {/* road */}
      <polygon points="60,120 90,86 110,86 140,120" fill="#3a3d46" />
      <polygon points="98,86 102,86 102,120 98,120" fill="#F5A524" opacity="0.8" />
      {phase === "before" ? (
        <>
          {/* fallen sign */}
          <line x1="146" y1="90" x2="170" y2="60" stroke="#9B9FAD" strokeWidth="3" strokeLinecap="round" />
          <polygon points="170,60 180,52 178,42 168,40 158,46 162,56" fill="#E5484D" stroke="white" strokeWidth="1.5" />
          <text x="167" y="52" fontSize="6" fill="white" fontFamily="Arial" fontWeight="bold" textAnchor="middle">STOP</text>
        </>
      ) : (
        <>
          {/* upright sign */}
          <line x1="148" y1="90" x2="148" y2="38" stroke="#7B7F8A" strokeWidth="2.5" strokeLinecap="round" />
          <polygon
            points="148,18 162,24 162,38 148,44 134,38 134,24"
            fill="#E5484D"
            stroke="white"
            strokeWidth="1.5"
          />
          <text x="148" y="34" fontSize="7" fill="white" fontFamily="Arial" fontWeight="bold" textAnchor="middle">STOP</text>
        </>
      )}
    </g>
  ),
  snow_clearing: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-snow-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D7E8F4" />
          <stop offset="100%" stopColor="#EEF4FB" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-snow-${phase})`} />
      {/* snow ground */}
      <rect y="78" width="200" height="42" fill="#FFFFFF" />
      <rect y="76" width="200" height="4" fill="#D7E2EC" />
      {phase === "before" ? (
        <>
          {/* road covered in snow */}
          <rect x="40" y="78" width="120" height="42" fill="#EAF1F7" />
          {/* snowflake hints */}
          {[
            [30, 30], [60, 18], [110, 25], [150, 14], [180, 28],
            [20, 60], [80, 50], [130, 58], [170, 48],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} stroke="white" strokeWidth="1" fill="none">
              <line x1="-3" y1="0" x2="3" y2="0" />
              <line x1="0" y1="-3" x2="0" y2="3" />
              <line x1="-2" y1="-2" x2="2" y2="2" />
              <line x1="-2" y1="2" x2="2" y2="-2" />
            </g>
          ))}
        </>
      ) : (
        <>
          {/* cleared road */}
          <rect x="40" y="78" width="120" height="42" fill="#3a3d46" />
          <rect x="98" y="80" width="4" height="40" fill="#F5A524" opacity="0.85" />
          {/* salt sparkle */}
          {[
            [60, 100], [85, 110], [110, 95], [135, 105], [70, 90], [125, 115],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="0.9" fill="white" opacity="0.7" />
          ))}
          {/* small plow truck silhouette */}
          <rect x="148" y="60" width="22" height="14" rx="2" fill="#FF5A1F" />
          <rect x="170" y="64" width="6" height="10" fill="#FF5A1F" />
          <polygon points="146,74 170,74 165,68 152,68" fill="#0F7AB3" />
          <circle cx="154" cy="76" r="2.2" fill="#1a1c22" />
          <circle cx="166" cy="76" r="2.2" fill="#1a1c22" />
        </>
      )}
    </g>
  ),
  drainage: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-drain-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5894C9" />
          <stop offset="100%" stopColor="#A4C6E5" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-drain-${phase})`} />
      <rect y="80" width="200" height="40" fill="#3a3d46" />
      <rect x="0" y="78" width="200" height="2" fill="#1a1c22" />
      {/* curb */}
      <rect y="74" width="200" height="6" fill="#9B9FAD" />
      {/* drain grate */}
      <rect x="76" y="82" width="48" height="14" rx="1.5" fill="#1a1c22" />
      {[80, 88, 96, 104, 112, 120].map((x) => (
        <rect key={x} x={x} y="84" width="1.5" height="10" fill="#3a3d46" />
      ))}
      {phase === "before" ? (
        <>
          {/* puddle */}
          <ellipse cx="100" cy="100" rx="80" ry="14" fill="#4F86C0" opacity="0.85" />
          <ellipse cx="100" cy="100" rx="60" ry="9" fill="#5DA0DD" opacity="0.7" />
          <ellipse cx="80" cy="98" rx="6" ry="1.5" fill="white" opacity="0.45" />
          <ellipse cx="135" cy="105" rx="8" ry="2" fill="white" opacity="0.4" />
          {/* leaves clogging */}
          <ellipse cx="84" cy="86" rx="3" ry="2" fill="#F5A524" transform="rotate(20 84 86)" />
          <ellipse cx="100" cy="84" rx="3.5" ry="2" fill="#7DC768" transform="rotate(-15 100 84)" />
          <ellipse cx="116" cy="86" rx="3" ry="2" fill="#E5484D" transform="rotate(35 116 86)" />
        </>
      ) : (
        <>
          {/* clean road, water flowing */}
          <path
            d="M0 100 Q50 96 100 100 T200 100"
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1"
          />
          <path
            d="M20 110 Q70 106 110 110 T200 108"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
        </>
      )}
    </g>
  ),
  lighting: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-light-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={phase === "before" ? "#0F1530" : "#13315C"} />
          <stop offset="100%" stopColor={phase === "before" ? "#1A1C22" : "#1F4068"} />
        </linearGradient>
        <radialGradient id={`glow-${phase}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE99A" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#FFE99A" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#FFE99A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-light-${phase})`} />
      {/* road */}
      <rect y="84" width="200" height="36" fill="#1a1c22" />
      <rect x="98" y="84" width="4" height="36" fill="#F5A524" opacity="0.6" />
      {/* light pole */}
      <rect x="40" y="40" width="3" height="80" fill="#9B9FAD" />
      <path d="M41 40 Q70 38 80 30" stroke="#9B9FAD" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="74" y="26" width="14" height="6" rx="1.5" fill="#3a3d46" />
      <rect x="148" y="46" width="3" height="74" fill="#9B9FAD" />
      <path d="M149 46 Q120 44 110 36" stroke="#9B9FAD" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="104" y="32" width="14" height="6" rx="1.5" fill="#3a3d46" />
      {phase === "after" ? (
        <>
          <ellipse cx="81" cy="35" rx="50" ry="40" fill={`url(#glow-${phase})`} />
          <ellipse cx="111" cy="40" rx="48" ry="38" fill={`url(#glow-${phase})`} />
          <rect x="74" y="26" width="14" height="6" rx="1.5" fill="#FFE99A" />
          <rect x="104" y="32" width="14" height="6" rx="1.5" fill="#FFE99A" />
        </>
      ) : (
        <>
          {/* dim moon to suggest night */}
          <circle cx="170" cy="30" r="9" fill="#E6E8ED" opacity="0.55" />
        </>
      )}
    </g>
  ),
  debris_removal: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-deb-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9DB587" />
          <stop offset="100%" stopColor="#C5D4B5" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-deb-${phase})`} />
      {/* road */}
      <rect y="60" width="200" height="60" fill="#3a3d46" />
      <rect x="0" y="58" width="200" height="2" fill="#1a1c22" />
      {/* lane */}
      <rect x="98" y="60" width="4" height="60" fill="#F5A524" opacity="0.85" />
      {phase === "before" ? (
        <>
          {/* tire */}
          <ellipse cx="65" cy="92" rx="18" ry="10" fill="#0a0b0d" />
          <ellipse cx="65" cy="92" rx="11" ry="5" fill="#1a1c22" />
          <ellipse cx="65" cy="92" rx="5" ry="2.5" fill="#3a3d46" />
          {/* branches */}
          <path d="M120 70 L160 88 L155 96 L150 92 L140 100 L130 88 Z" fill="#5C3D1F" />
          <path d="M150 78 L170 76 L172 84 L154 86 Z" fill="#3F2C16" />
          <ellipse cx="130" cy="76" rx="3" ry="1.5" fill="#7DC768" />
          <ellipse cx="158" cy="80" rx="3" ry="1.5" fill="#7DC768" />
          {/* trash */}
          <path d="M30 110 L40 105 L50 108 L48 116 L34 116 Z" fill="#9B9FAD" />
        </>
      ) : (
        <>
          {/* clean road, slight tire scuff */}
          <path
            d="M40 95 Q90 92 150 96"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="2"
            fill="none"
          />
          <ellipse cx="170" cy="90" rx="20" ry="6" fill="rgba(255,255,255,0.04)" />
        </>
      )}
    </g>
  ),
  marking: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-mark-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2c2f37" />
          <stop offset="100%" stopColor="#1a1c22" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-mark-${phase})`} />
      {/* center line */}
      {phase === "before"
        ? [12, 32, 52, 72, 92, 112].map((x) => (
            <rect key={x} x={x} y="56" width="12" height="6" fill="#F5A524" opacity="0.35" />
          ))
        : [10, 30, 50, 70, 90, 110, 130, 150, 170].map((x) => (
            <rect key={x} x={x} y="56" width="14" height="7" fill="#FFE99A" />
          ))}
      {/* crosswalk */}
      {phase === "after" &&
        [40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150].map((x) => (
          <rect key={x} x={x} y="84" width="6" height="20" fill="white" opacity="0.95" />
        ))}
      {phase === "before" &&
        [40, 56, 76, 96, 120, 140].map((x) => (
          <rect key={x} x={x} y="84" width="5" height="14" fill="white" opacity="0.25" />
        ))}
      {/* edge */}
      <rect x="0" y="14" width="200" height="2" fill="#9B9FAD" opacity="0.5" />
      <rect x="0" y="116" width="200" height="2" fill="#9B9FAD" opacity="0.5" />
    </g>
  ),
  emergency: (phase) => (
    <g>
      <defs>
        <linearGradient id={`bg-emg-${phase}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7E1721" />
          <stop offset="100%" stopColor="#3F2C16" />
        </linearGradient>
      </defs>
      <rect width="200" height="120" fill={`url(#bg-emg-${phase})`} />
      <rect y="74" width="200" height="46" fill="#3a3d46" />
      {phase === "before" ? (
        <>
          {/* boulder/landslide */}
          <polygon points="60,74 110,40 150,72 140,84 100,96 70,88" fill="#7B5C3D" />
          <polygon points="80,68 100,50 122,66 110,80 92,80" fill="#9D7B58" />
          <polygon points="100,76 116,60 130,72 122,82 108,84" fill="#BFA67D" opacity="0.7" />
          {/* rubble */}
          <ellipse cx="35" cy="100" rx="14" ry="5" fill="#7B5C3D" />
          <ellipse cx="170" cy="98" rx="12" ry="4" fill="#9D7B58" />
        </>
      ) : (
        <>
          {/* cleared, with cones and tape */}
          <polygon points="60,84 64,84 67,72 57,72" fill="#FF5A1F" />
          <rect x="57" y="79" width="10" height="2" fill="white" />
          <polygon points="138,84 142,84 145,72 135,72" fill="#FF5A1F" />
          <rect x="135" y="79" width="10" height="2" fill="white" />
          <line x1="60" y1="74" x2="142" y2="74" stroke="#F5A524" strokeWidth="2" strokeDasharray="6 4" />
          {/* clean lane line */}
          <rect x="98" y="84" width="4" height="36" fill="#F5A524" opacity="0.85" />
        </>
      )}
    </g>
  ),
};
