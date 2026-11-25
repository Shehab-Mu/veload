import { computed, type ComputedRef, type Ref } from "vue";


export type LoadingSource = Readonly<Ref<boolean>> | (() => boolean);

export interface UseLoadingGroupReturn {

  isLoading: ComputedRef<boolean>;


  activeCount: ComputedRef<number>;
}


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
