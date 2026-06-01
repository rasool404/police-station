import type { CSSProperties } from "react";

type Props = {
  name: string;
  id?: string | null;
  size?: number;
  style?: CSSProperties;
};

// Stable color palette for avatars — cool blues / steels / accent jewels.
const PALETTE = [
  { bg: "#14457a", fg: "#eef2f8" }, // deep navy
  { bg: "#0c1c36", fg: "#eef2f8" }, // ink
  { bg: "#4a5b7c", fg: "#eef2f8" }, // slate blue
  { bg: "#2a6b5e", fg: "#eef2f8" }, // teal
  { bg: "#5b6a87", fg: "#eef2f8" }, // steel
  { bg: "#1f3a5f", fg: "#eef2f8" }, // midnight blue
  { bg: "#3b5d8a", fg: "#eef2f8" }, // royal blue
  { bg: "#b07f1e", fg: "#0c1c36" }, // amber (one warm pop)
];

function pickColor(key: string) {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, id, size = 36, style }: Props) {
  const { bg, fg } = pickColor(id ?? name);
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "grid",
        placeItems: "center",
        fontFamily: "var(--font-display)",
        fontSize: Math.round(size * 0.42),
        lineHeight: 1,
        letterSpacing: "-0.02em",
        flexShrink: 0,
        border: "1px solid rgba(17, 25, 42, 0.15)",
        ...style,
      }}
    >
      {initials(name) || "•"}
    </div>
  );
}
