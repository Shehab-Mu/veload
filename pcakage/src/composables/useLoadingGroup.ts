import { computed, type ComputedRef, type Ref } from "vue";

/**
 * A reactive boolean source or a getter that returns one.
 *
 * Typically this is the `isLoading` ref from another composable instance.
 */
export type LoadingSource = Readonly<Ref<boolean>> | (() => boolean);

export interface UseLoadingGroupReturn {
  /**
   * `true` when at least one source is active.
   */
  isLoading: ComputedRef<boolean>;

  /**
   * Number of sources that are currently active.
   */
  activeCount: ComputedRef<number>;
}

/**
 * Aggregates independent loading sources into a single loading state.
 *
 * Pass an array for a fixed set of sources, or a getter when the set of
 * sources changes dynamically. The group does not own the sources; it only
 * reads them.
 */
export function useLoadingGroup(
  sources: readonly LoadingSource[] | (() => readonly LoadingSource[]),
): UseLoadingGroupReturn {
  const getSources = typeof sources === "function" ? sources : () => sources;

  const activeCount = computed(() => {
    let count = 0;

    for (const source of getSources()) {
      const active = typeof source === "function" ? source() : source.value;

      if (active) {
        count++;
      }
    }

    return count;
  });

  const isLoading = computed(() => activeCount.value > 0);

  return {
    isLoading,
    activeCount,
  };
}
