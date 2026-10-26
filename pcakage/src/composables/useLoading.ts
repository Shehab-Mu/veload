import { computed, readonly, ref, type Ref } from "vue";

/**
 * Reactive state returned by {@link useLoading}.
 */
export interface UseLoadingReturn {
  /**
   * `true` while at least one tracked operation is pending.
   */
  isLoading: Readonly<Ref<boolean>>;

  /**
   * Number of currently pending operations for this instance.
   */
  pendingCount: Readonly<Ref<number>>;

  /**
   * Runs an asynchronous operation and tracks it until it settles.
   *
   * The operation's return value and rejection reason are preserved.
   */
  execute: <T>(operation: () => Promise<T>) => Promise<T>;
}

/**
 * Tracks concurrent asynchronous operations for a single loading state.
 *
 * Each call to `execute` increments the pending count before invoking the
 * operation and decrements it in a `finally` block. The operation result or
 * error is passed through unchanged.
 */
export function useLoading(): UseLoadingReturn {
  const count = ref(0);
  const isLoading = computed(() => count.value > 0);
  const pendingCount = readonly(count);

  async function execute<T>(operation: () => Promise<T>): Promise<T> {
    count.value++;

    try {
      return await operation();
    } finally {
      count.value = Math.max(0, count.value - 1);
    }
  }

  return {
    isLoading,
    pendingCount,
    execute,
  };
}
