import { describe, expect, it } from "vitest";
import { effectScope, ref } from "vue";
import { useLoading } from "../composables/useLoading";
import { useLoadingGroup } from "../composables/useLoadingGroup";

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useLoadingGroup", () => {
  it("starts idle", () => {
    const { isLoading, activeCount } = useLoadingGroup([]);

    expect(isLoading.value).toBe(false);
    expect(activeCount.value).toBe(0);
  });

  it("aggregates multiple loading refs", async () => {
    const a = useLoading();
    const b = useLoading();
    const group = useLoadingGroup([a.isLoading, b.isLoading]);

    const deferredA = createDeferred<void>();
    const promiseA = a.execute(() => deferredA.promise);

    expect(group.isLoading.value).toBe(true);
    expect(group.activeCount.value).toBe(1);

    const deferredB = createDeferred<void>();
    const promiseB = b.execute(() => deferredB.promise);

    expect(group.activeCount.value).toBe(2);

    deferredA.resolve();
    await promiseA;

    expect(group.isLoading.value).toBe(true);
    expect(group.activeCount.value).toBe(1);

    deferredB.resolve();
    await promiseB;

    expect(group.isLoading.value).toBe(false);
    expect(group.activeCount.value).toBe(0);
  });

  it("accepts getter functions as sources", () => {
    const first = ref(false);
    const second = ref(true);
    const group = useLoadingGroup([
      () => first.value,
      () => second.value,
    ]);

    expect(group.isLoading.value).toBe(true);
    expect(group.activeCount.value).toBe(1);

    first.value = true;
    second.value = false;

    expect(group.activeCount.value).toBe(1);
    expect(group.isLoading.value).toBe(true);

    first.value = false;
    expect(group.isLoading.value).toBe(false);
  });

  it("reacts to a dynamically changing source list", () => {
    const a = ref(false);
    const b = ref(false);
    const sources = ref([a]);

    const group = useLoadingGroup(() => sources.value.map((source) => source));

    expect(group.isLoading.value).toBe(false);

    a.value = true;
    expect(group.isLoading.value).toBe(true);

    sources.value = [a, b];
    expect(group.activeCount.value).toBe(1);

    b.value = true;
    expect(group.activeCount.value).toBe(2);

    sources.value = [];
    expect(group.isLoading.value).toBe(false);
    expect(group.activeCount.value).toBe(0);
  });

  it("does not own or mutate its sources", async () => {
    const a = useLoading();
    const group = useLoadingGroup([a.isLoading]);
    const deferred = createDeferred<void>();

    const promise = a.execute(() => deferred.promise);

    expect(group.isLoading.value).toBe(true);
    expect(a.isLoading.value).toBe(true);

    deferred.resolve();
    await promise;

    expect(a.isLoading.value).toBe(false);
    expect(group.isLoading.value).toBe(false);
  });

  it("works inside and outside an effect scope", () => {
    const scope = effectScope();
    const source = ref(true);

    let group!: ReturnType<typeof useLoadingGroup>;

    scope.run(() => {
      group = useLoadingGroup([source]);
    });

    expect(group.isLoading.value).toBe(true);

    source.value = false;
    expect(group.isLoading.value).toBe(false);

    scope.stop();
    expect(group.isLoading.value).toBe(false);
  });
});
