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
  /** Visual treatment used by the loader. */
  variant?: LoaderVariant;
  /** Primary color. @default "currentColor" */
  color?: string;
  /** Base size in pixels; repeated treatments may grow to fit count. @default 40 */
  size?: number;
  /** Animation duration in milliseconds. @default 1000 */
  duration?: number;
  /** Accessible name announced by the status region. @default "Loading" */
  label?: string;
  /** Hides the loader from assistive technology. @default false */
  decorative?: boolean;
  /** Repeated marks, rounded and clamped to 1–12. Fixed-shape treatments ignore it. @default 4 */
  count?: number;
  /** Optional completion value for the progress-ring treatment, from 0 to 100. */
  value?: number | null;
}

export type NamedLoaderProps = Omit<VLoaderProps, "variant">;

/** Props shared by treatments that render repeated marks. */
export type VMarkLoaderProps = Omit<NamedLoaderProps, "value">;

/** Props specific to the determinate or indeterminate progress-ring treatment. */
export interface VProgressRingLoaderProps extends Omit<NamedLoaderProps, "value"> {
  /** Completion percentage from 0 to 100. Omit for an indeterminate ring. */
  value?: number | null;
}
