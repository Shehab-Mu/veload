import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { effectScope, isReadonly } from "vue";
import { useDelayedLoading } from "../composables/useDelayedLoading";

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useDelayedLoading", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("initializes with isLoading false and pendingCount 0", () => {
    const { isLoading, pendingCount } = useDelayedLoading();

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
    expect(isReadonly(isLoading)).toBe(true);
    expect(isReadonly(pendingCount)).toBe(true);
  });

  it("never displays loading if operation completes before the delay", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading();
    const deferred = createDeferred<string>();

    const promise = execute(() => deferred.promise);

    expect(pendingCount.value).toBe(1);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(100);
    expect(isLoading.value).toBe(false);

    deferred.resolve("quick");
    const result = await promise;

    expect(result).toBe("quick");
    expect(pendingCount.value).toBe(0);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(200);
    expect(isLoading.value).toBe(false);
  });

  it("displays loading after the delay elapses for slow operations", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading();
    const deferred = createDeferred<string>();

    const promise = execute(() => deferred.promise);

    expect(pendingCount.value).toBe(1);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(199);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(isLoading.value).toBe(true);
    expect(pendingCount.value).toBe(1);

    deferred.resolve("slow");
    const result = await promise;

    expect(result).toBe("slow");
    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("tracks pendingCount accurately as operations start and complete", async () => {
    const { pendingCount, execute } = useDelayedLoading();
    const op1 = createDeferred<void>();
    const op2 = createDeferred<void>();

    const p1 = execute(() => op1.promise);
    expect(pendingCount.value).toBe(1);

    const p2 = execute(() => op2.promise);
    expect(pendingCount.value).toBe(2);

    op1.resolve();
    await p1;
    expect(pendingCount.value).toBe(1);

    op2.resolve();
    await p2;
    expect(pendingCount.value).toBe(0);
  });

  it("does not prematurely hide loading during overlapping operations", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading();
    const op1 = createDeferred<string>();
    const op2 = createDeferred<string>();

    const p1 = execute(() => op1.promise);
    vi.advanceTimersByTime(100);

    const p2 = execute(() => op2.promise);
    expect(pendingCount.value).toBe(2);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(100);
    expect(isLoading.value).toBe(true);

    op1.resolve("op1");
    await p1;
    expect(pendingCount.value).toBe(1);
    expect(isLoading.value).toBe(true);

    op2.resolve("op2");
    await p2;
    expect(pendingCount.value).toBe(0);
    expect(isLoading.value).toBe(false);
  });

  it("prevents the loading indicator from appearing later if all operations finish before the delay", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading();
    const op1 = createDeferred<void>();
    const op2 = createDeferred<void>();

    const p1 = execute(() => op1.promise);
    vi.advanceTimersByTime(50);
    const p2 = execute(() => op2.promise);

    op1.resolve();
    await p1;

    vi.advanceTimersByTime(50);
    op2.resolve();
    await p2;

    expect(pendingCount.value).toBe(0);
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(500);
    expect(isLoading.value).toBe(false);
  });

  it("propagates rejected errors and cleans up state properly before and after delay", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading();

    const slowDeferred = createDeferred<string>();
    const slowError = new Error("Slow failure");
    const slowPromise = execute(() => slowDeferred.promise);

    vi.advanceTimersByTime(200);
    expect(isLoading.value).toBe(true);

    slowDeferred.reject(slowError);
    await expect(slowPromise).rejects.toThrow(slowError);

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);

    const fastDeferred = createDeferred<string>();
    const fastError = new Error("Fast failure");
    const fastPromise = execute(() => fastDeferred.promise);

    vi.advanceTimersByTime(50);
    fastDeferred.reject(fastError);
    await expect(fastPromise).rejects.toThrow(fastError);

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);

    vi.advanceTimersByTime(300);
    expect(isLoading.value).toBe(false);
  });

  it("maintains completely independent state and timers across instances", async () => {
    const instanceA = useDelayedLoading(100);
    const instanceB = useDelayedLoading(300);

    const deferredA = createDeferred<string>();
    const promiseA = instanceA.execute(() => deferredA.promise);

    expect(instanceA.pendingCount.value).toBe(1);
    expect(instanceB.pendingCount.value).toBe(0);

    vi.advanceTimersByTime(100);
    expect(instanceA.isLoading.value).toBe(true);
    expect(instanceB.isLoading.value).toBe(false);

    deferredA.resolve("done");
    await promiseA;

    expect(instanceA.isLoading.value).toBe(false);
    expect(instanceB.isLoading.value).toBe(false);
  });

  it("cleans up active timer when the associated effect scope is disposed", () => {
    let instance!: ReturnType<typeof useDelayedLoading>;
    const scope = effectScope();

    scope.run(() => {
      instance = useDelayedLoading(200);
    });

    const deferred = createDeferred<void>();
    instance.execute(() => deferred.promise);

    expect(instance.pendingCount.value).toBe(1);
    expect(instance.isLoading.value).toBe(false);

    scope.stop();

    vi.advanceTimersByTime(300);

    expect(instance.isLoading.value).toBe(false);
  });

  it("hides a visible indicator immediately when its scope is disposed", async () => {
    let instance!: ReturnType<typeof useDelayedLoading>;
    const scope = effectScope();

    scope.run(() => {
      instance = useDelayedLoading(50);
    });

    const deferred = createDeferred<void>();
    const promise = instance.execute(() => deferred.promise);

    vi.advanceTimersByTime(50);
    expect(instance.isLoading.value).toBe(true);

    scope.stop();
    expect(instance.isLoading.value).toBe(false);

    deferred.resolve();
    await promise;

    vi.advanceTimersByTime(500);
    expect(instance.isLoading.value).toBe(false);
  });

  it("respects custom delay options object and numeric delay", async () => {
    const loader500 = useDelayedLoading({ delay: 500 });
    const def500 = createDeferred<void>();
    const p500 = loader500.execute(() => def500.promise);

    vi.advanceTimersByTime(499);
    expect(loader500.isLoading.value).toBe(false);
    vi.advanceTimersByTime(1);
    expect(loader500.isLoading.value).toBe(true);

    def500.resolve();
    await p500;

    const loader0 = useDelayedLoading({ delay: 0 });
    const def0 = createDeferred<void>();
    const p0 = loader0.execute(() => def0.promise);

    expect(loader0.isLoading.value).toBe(true);

    def0.resolve();
    await p0;
    expect(loader0.isLoading.value).toBe(false);
  });

  it("normalizes negative delays to zero", () => {
    const { isLoading, execute } = useDelayedLoading(-100);
    const deferred = createDeferred<void>();

    void execute(() => deferred.promise);

    expect(isLoading.value).toBe(true);

    deferred.resolve();
  });

  it("falls back to the default delay for non-finite delays", () => {
    const nan = useDelayedLoading(Number.NaN);
    const infinite = useDelayedLoading({ delay: Number.POSITIVE_INFINITY });
    const nanDeferred = createDeferred<void>();
    const infiniteDeferred = createDeferred<void>();

    void nan.execute(() => nanDeferred.promise);
    void infinite.execute(() => infiniteDeferred.promise);

    vi.advanceTimersByTime(199);
    expect(nan.isLoading.value).toBe(false);
    expect(infinite.isLoading.value).toBe(false);

    vi.advanceTimersByTime(1);
    expect(nan.isLoading.value).toBe(true);
    expect(infinite.isLoading.value).toBe(true);

    nanDeferred.resolve();
    infiniteDeferred.resolve();
  });

  it("keeps the indicator visible for the minimum duration", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 100,
      minVisibleDuration: 300,
    });
    const deferred = createDeferred<void>();

    const promise = execute(() => deferred.promise);

    vi.advanceTimersByTime(100);
    expect(isLoading.value).toBe(true);

    // The operation finishes shortly after the indicator appears.
    vi.advanceTimersByTime(20);
    deferred.resolve();
    await promise;

    expect(isLoading.value).toBe(true);

    // 20ms of the 300ms minimum have elapsed; 280ms remain.
    vi.advanceTimersByTime(279);
    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(isLoading.value).toBe(false);
  });

  it("does not extend visibility when an operation outlives the minimum duration", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 100,
      minVisibleDuration: 300,
    });
    const deferred = createDeferred<void>();

    const promise = execute(() => deferred.promise);

    vi.advanceTimersByTime(500);
    expect(isLoading.value).toBe(true);

    deferred.resolve();
    await promise;

    expect(isLoading.value).toBe(false);
  });

  it("hides immediately when minVisibleDuration is zero", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 0,
      minVisibleDuration: 0,
    });
    const deferred = createDeferred<void>();

    const promise = execute(() => deferred.promise);

    expect(isLoading.value).toBe(true);

    deferred.resolve();
    await promise;

    expect(isLoading.value).toBe(false);
  });

  it("treats invalid minVisibleDuration values as zero", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 0,
      minVisibleDuration: Number.NaN,
    });
    const deferred = createDeferred<void>();

    const promise = execute(() => deferred.promise);
    expect(isLoading.value).toBe(true);

    deferred.resolve();
    await promise;

    expect(isLoading.value).toBe(false);
  });

  it("keeps loading visible while a new operation starts during the minimum duration", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading({
      delay: 50,
      minVisibleDuration: 200,
    });
    const first = createDeferred<void>();

    const firstPromise = execute(() => first.promise);

    vi.advanceTimersByTime(50);
    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(10);
    first.resolve();
    await firstPromise;

    expect(isLoading.value).toBe(true);

    const second = createDeferred<void>();
    const secondPromise = execute(() => second.promise);

    expect(pendingCount.value).toBe(1);
    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(50);
    second.resolve();
    await secondPromise;

    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(200);
    expect(isLoading.value).toBe(false);
  });

  it("starts a fresh minimum-visible window for a later operation", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 0,
      minVisibleDuration: 100,
    });
    const first = createDeferred<void>();

    const firstPromise = execute(() => first.promise);
    expect(isLoading.value).toBe(true);

    first.resolve();
    await firstPromise;
    expect(isLoading.value).toBe(true);

    // The first minimum window completes and hides the indicator.
    vi.advanceTimersByTime(100);
    expect(isLoading.value).toBe(false);

    // A later operation gets its own minimum-visible window.
    const second = createDeferred<void>();
    const secondPromise = execute(() => second.promise);

    expect(isLoading.value).toBe(true);

    second.resolve();
    await secondPromise;

    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(99);
    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(1);
    expect(isLoading.value).toBe(false);
  });

  it("does not hide a new operation because of a stale minimum-duration timer", async () => {
    const { isLoading, execute } = useDelayedLoading({
      delay: 0,
      minVisibleDuration: 100,
    });
    const first = createDeferred<void>();

    const firstPromise = execute(() => first.promise);
    first.resolve();
    await firstPromise;

    // A hide is pending for the remainder of the minimum window.
    expect(isLoading.value).toBe(true);

    vi.advanceTimersByTime(50);

    // Start a new operation before the pending hide fires.
    const second = createDeferred<void>();
    const secondPromise = execute(() => second.promise);

    // Advance past the original hide deadline; the new operation must stay visible.
    vi.advanceTimersByTime(100);
    expect(isLoading.value).toBe(true);

    second.resolve();
    await secondPromise;

    // Visibility has already exceeded the minimum, so hiding is immediate.
    expect(isLoading.value).toBe(false);

    vi.advanceTimersByTime(500);
    expect(isLoading.value).toBe(false);
  });

  it("settles correctly when called outside an active effect scope", async () => {
    const { isLoading, pendingCount, execute } = useDelayedLoading(0);

    await expect(execute(async () => "no-scope")).resolves.toBe("no-scope");

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("preserves operation return type without type escapes", async () => {
    const { execute } = useDelayedLoading();

    interface Product {
      id: number;
      title: string;
    }

    const product: Product = { id: 42, title: "Gadget" };
    const result: Product = await execute(async () => product);

    expect(result.id).toBe(42);
    expect(result.title).toBe("Gadget");
  });
});
