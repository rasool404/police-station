import type { CSSProperties } from "react";

type Props = {
  name: string;
  id?: string | null;
  size?: number;
  style?: CSSProperties;
};

// Stable color palette for avatars — earth tones that fit the case-file paper.
const PALETTE = [
  { bg: "#7a1a1a", fg: "#f3ecdc" }, // oxblood
  { bg: "#3a5a2a", fg: "#f3ecdc" }, // forest
  { bg: "#9b7a2c", fg: "#11192a" }, // brass
  { bg: "#11192a", fg: "#f3ecdc" }, // ink
  { bg: "#4a5b7c", fg: "#f3ecdc" }, // slate blue
  { bg: "#6a4a2a", fg: "#f3ecdc" }, // saddle
  { bg: "#5a3a5a", fg: "#f3ecdc" }, // plum
  { bg: "#2a5a4b", fg: "#f3ecdc" }, // teal
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
