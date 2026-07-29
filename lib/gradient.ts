export interface GradientStop {
  id: string;
  color: string;
}

export type GradientType = "linear" | "radial";

export function buildGradientCss(
  type: GradientType,
  angle: number,
  stops: GradientStop[]
): string {
  const colors = stops.map((stop) => stop.color).join(", ");
  return type === "linear"
    ? `linear-gradient(${angle}deg, ${colors})`
    : `radial-gradient(circle, ${colors})`;
}
