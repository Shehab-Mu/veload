export type SkeletonVariant = "text" | "rect" | "circle";

export interface VSkeletonProps {
  /**
   * Shape of the placeholder.
   *
   * @default "text"
   */
  variant?: SkeletonVariant;

  /**
   * Width as a pixel number or any CSS length. Defaults to `100%`, except for
   * circular skeletons, which default to `40px`.
   */
  width?: number | string;

  /**
   * Height as a pixel number or any CSS length. Circular skeletons use a
   * square aspect ratio when no height is supplied.
   */
  height?: number | string;

  /**
   * Border radius as a pixel number or any CSS length. When omitted, a shape
   * appropriate default is used.
   */
  borderRadius?: number | string;

  /**
   * Enables the shimmer animation. Reduced-motion preferences always disable
   * the animation in CSS.
   *
   * @default true
   */
  animated?: boolean;

  /**
   * Optional accessible name. When supplied, the skeleton becomes a
   * `role="status"` placeholder. When omitted, it is decorative and hidden
   * from assistive technology.
   */
  label?: string;
}
