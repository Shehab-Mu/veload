export type LoadingButtonType = "button" | "submit" | "reset";

export interface VLoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  type?: LoadingButtonType;
  indicatorSize?: number;
}
