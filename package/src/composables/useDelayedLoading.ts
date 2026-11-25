import {
  getCurrentScope,
  onScopeDispose,
  readonly,
  ref,
} from "vue";
import type { UseLoadingReturn } from "./useLoading";

const DEFAULT_DELAY = 200;

export interface UseDelayedLoadingOptions {

  delay?: number;


  minVisibleDuration?: number;
}

export type UseDelayedLoadingReturn = UseLoadingReturn;

function normalizeDuration(value: number | undefined, fallback: number): number {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, value);
}


export function useDelayedLoading(
  options?: UseDelayedLoadingOptions | number,
): UseDelayedLoadingReturn {
  const rawDelay = typeof options === "number" ? options : options?.delay;
  const rawMinVisibleDuration =
    typeof options === "number" ? 0 : options?.minVisibleDuration;

  const delay = normalizeDuration(rawDelay, DEFAULT_DELAY);
  const minVisibleDuration = normalizeDuration(rawMinVisibleDuration, 0);

  const count = ref(0);
  const loading = ref(false);

  const isLoading = readonly(loading);
  const pendingCount = readonly(count);

  let showTimer: ReturnType<typeof setTimeout> | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let visibleSince: number | null = null;
  let disposed = false;

  function clearShowTimer(): void {
    if (showTimer !== null) {
      clearTimeout(showTimer);
      showTimer = null;
    }
  }

  function clearHideTimer(): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function showLoading(): void {
    loading.value = true;
    visibleSince = Date.now();
  }

  function scheduleShow(): void {
    if (disposed || loading.value || showTimer !== null || count.value === 0) {
      return;
    }

    if (delay <= 0) {
      showLoading();
      return;
    }

    showTimer = setTimeout(() => {
      showTimer = null;

      if (!disposed && count.value > 0) {
        showLoading();
      }
    }, delay);
  }

  function scheduleHide(): void {
    clearShowTimer();
    clearHideTimer();

    if (!loading.value) {
      visibleSince = null;
      return;
    }

    if (minVisibleDuration <= 0 || visibleSince === null) {
      loading.value = false;
      visibleSince = null;
      return;
    }

    const remaining = minVisibleDuration - (Date.now() - visibleSince);

    if (remaining <= 0) {
      loading.value = false;
      visibleSince = null;
      return;
    }

    hideTimer = setTimeout(() => {
      hideTimer = null;

      if (!disposed && count.value === 0) {
        loading.value = false;
        visibleSince = null;
      }
    }, remaining);
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      disposed = true;
      clearShowTimer();
      clearHideTimer();
      loading.value = false;
      visibleSince = null;
    });
  }

  async function execute<T>(operation: () => Promise<T>): Promise<T> {
    count.value++;
    clearHideTimer();
    scheduleShow();

    try {
      return await operation();
    } finally {
      count.value = Math.max(0, count.value - 1);

      if (count.value === 0) {
        scheduleHide();
      }
    }
  }

  return {
    isLoading,
    pendingCount,
    execute,
  };
}
