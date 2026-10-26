export type LoadingButtonType = "button" | "submit" | "reset";

export interface VLoadingButtonProps {
  /**
   * Whether the button is performing work. While loading, the button is
   * disabled, exposes `aria-busy`, and shows an indicator.
   *
   * @default false
   */
  loading?: boolean;

  /**
   * Native disabled state. The button is also disabled while loading.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Native button type. Defaults to `"button"` so the component does not
   * accidentally submit a surrounding form.
   *
   * @default "button"
   */
  type?: LoadingButtonType;

  /**
   * Diameter of the default indicator in pixels.
   *
   * @default 16
   */
  indicatorSize?: number;
}
