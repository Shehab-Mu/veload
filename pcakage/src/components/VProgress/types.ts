export interface VProgressProps {
  /**
   * Current progress value. Omit, pass `null`, or pass a non-finite value to
   * render an indeterminate progress bar.
   */
  value?: number | null;

  /**
   * Lower bound of the value range.
   *
   * @default 0
   */
  min?: number;

  /**
   * Upper bound of the value range. When `max` is not greater than `min`, the
   * bar renders as indeterminate.
   *
   * @default 100
   */
  max?: number;

  /**
   * Accessible name for the progress bar.
   *
   * @default "Progress"
   */
  label?: string;

  /**
   * Optional human-readable value text, for example `"3 of 10 files"`.
   * Only applied while determinate.
   */
  valueText?: string;

  /**
   * Thickness of the bar as a pixel number or any CSS length.
   *
   * @default 8
   */
  height?: number | string;

  /**
   * Color of the filled portion. Overrides `--v-progress-color`.
   */
  color?: string;

  /**
   * Color of the unfilled track. Overrides `--v-progress-track-color`.
   */
  trackColor?: string;
}
