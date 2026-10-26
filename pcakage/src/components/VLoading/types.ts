export interface VLoadingProps {
  /**
   * Whether the loading overlay is active.
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Accessible loading message. The text is visually hidden by default.
   *
   * @default "Loading"
   */
  label?: string;

  /**
   * Makes the wrapped content inert while the overlay is active. This prevents
   * pointer and keyboard interaction with content beneath the overlay.
   *
   * @default true
   */
  inertContent?: boolean;

  /**
   * Diameter of the default spinner in pixels.
   *
   * @default 28
   */
  indicatorSize?: number;
}
