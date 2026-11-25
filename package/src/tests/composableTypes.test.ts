import { describe, expect, it } from "vitest";
import { effectScope, isReadonly } from "vue";
import { useDelayedLoading } from "../composables/useDelayedLoading";
import { useLoading } from "../composables/useLoading";
import { useLoadingGroup } from "../composables/useLoadingGroup";
import type { LoadingSource } from "../composables/useLoadingGroup";

describe("composable types and readonly contracts", () => {
  it("types execute results through each composable", async () => {
    const loading = useLoading();
    const delayed = useDelayedLoading(0);

    interface Payload {
      id: number;
      tags: readonly string[];
    }

    const payload: Payload = { id: 1, tags: ["a"] };
    const fromLoading: Payload = await loading.execute(async () => payload);
    const fromDelayed: Payload = await delayed.execute(async () => payload);

    expect(fromLoading.id).toBe(1);
    expect(fromDelayed.tags).toEqual(["a"]);
  });

  it("returns readonly refs from every composable", () => {
    const loading = useLoading();
    const delayed = useDelayedLoading();
    const group = useLoadingGroup([loading.isLoading]);

    expect(isReadonly(loading.isLoading)).toBe(true);
    expect(isReadonly(loading.pendingCount)).toBe(true);
    expect(isReadonly(delayed.isLoading)).toBe(true);
    expect(isReadonly(delayed.pendingCount)).toBe(true);
    expect(isReadonly(group.isLoading)).toBe(true);
    expect(isReadonly(group.activeCount)).toBe(true);
  });

  it("accepts refs and getters as group sources", () => {
    const loading = useLoading();
    const sources: readonly LoadingSource[] = [
      loading.isLoading,
      () => loading.pendingCount.value > 0,
    ];
    const group = useLoadingGroup(() => sources);

    expect(group.isLoading.value).toBe(false);
    expect(group.activeCount.value).toBe(0);
  });

  it("reports delayed loading state independently inside an effect scope", async () => {
    const scope = effectScope();
    let loading!: ReturnType<typeof useDelayedLoading>;

    scope.run(() => {
      loading = useDelayedLoading(0);
    });

    await loading.execute(async () => "done");

    expect(loading.isLoading.value).toBe(false);
    expect(loading.pendingCount.value).toBe(0);

    scope.stop();
  });
});
