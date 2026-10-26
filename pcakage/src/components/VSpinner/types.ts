export interface VSpinnerProps {
  /**
   * Diameter of the spinner in pixels. Non-finite and negative values are
   * safely normalized.
   *
   * @default 24
   */
  size?: number;

  /**
   * Accent color of the active edge. The remaining track uses
   * `--v-spinner-track-color` (falling back to `currentColor`).
   *
   * @default "currentColor"
   */
  color?: string;

  /**
   * Accessible name announced by the status element.
   *
   * @default "Loading"
   */
  label?: string;

  /**
   * Hides the spinner from assistive technology. Use this when an ancestor
   * already exposes a loading status, such as `VLoading`.
   *
   * @default false
   */
  decorative?: boolean;
}
