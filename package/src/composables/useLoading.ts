import { computed, readonly, ref, type Ref } from "vue";


export interface UseLoadingReturn {

  isLoading: Readonly<Ref<boolean>>;


  pendingCount: Readonly<Ref<number>>;


  execute: <T>(operation: () => Promise<T>) => Promise<T>;
}


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
