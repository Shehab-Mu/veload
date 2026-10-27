export type SkeletonVariant = "text" | "rect" | "circle";

export interface VSkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
  animated?: boolean;
  label?: string;
}
