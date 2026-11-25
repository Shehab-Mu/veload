export const loaderVariants = [
  "bars",
  "blob",
  "bounce",
  "breathing",
  "card-flip",
  "dot-sweep",
  "dots",
  "dual-arc",
  "element",
  "equalizer",
  "fallback",
  "flow",
  "gradient-ring",
  "grid",
  "hashtag",
  "heatmap",
  "liquid",
  "logo-spin",
  "morph",
  "orbit-dots",
  "orbit",
  "plane",
  "progress-ring",
  "pulse",
  "ring",
  "ripple",
  "rotate",
  "signal",
  "sliding-bars",
  "snake",
  "spin-dots",
  "spin",
  "squares",
  "stair",
  "typing",
  "wave",
] as const;

export type LoaderVariant = (typeof loaderVariants)[number];

export interface VLoaderProps {
  variant?: LoaderVariant;
  color?: string;
  size?: number;
  duration?: number;
  label?: string;
  decorative?: boolean;
  count?: number;
  value?: number | null;
}

export type NamedLoaderProps = Omit<VLoaderProps, "variant">;

export type VMarkLoaderProps = Omit<NamedLoaderProps, "value">;

export interface VProgressRingLoaderProps extends Omit<NamedLoaderProps, "value"> {
  value?: number | null;
}
