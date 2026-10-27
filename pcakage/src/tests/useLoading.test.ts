import { describe, expect, it } from "vitest";
import { isReadonly } from "vue";
import { effectScope } from "vue";
import { useLoading } from "../composables/useLoading";

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useLoading", () => {
  it("initializes with isLoading false and pendingCount 0", () => {
    const { isLoading, pendingCount } = useLoading();

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("sets loading to true while pending, returns result, and resets state", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const deferred = createDeferred<string>();

    const promise = execute(() => deferred.promise);

    expect(isLoading.value).toBe(true);
    expect(pendingCount.value).toBe(1);

    deferred.resolve("success");
    const result = await promise;

    expect(result).toBe("success");
    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("propagates error to caller and resets loading state when operation rejects", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const deferred = createDeferred<string>();
    const expectedError = new Error("Operation failed");

    const promise = execute(() => deferred.promise);

    expect(isLoading.value).toBe(true);
    expect(pendingCount.value).toBe(1);

    deferred.reject(expectedError);

    await expect(promise).rejects.toThrow(expectedError);
    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("handles synchronous throws from the operation callback", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const expectedError = new Error("Synchronous failure");

    await expect(
      execute(() => {
        throw expectedError;
      }),
    ).rejects.toThrow(expectedError);

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("keeps isLoading true when overlapping operations complete out of order", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const op1 = createDeferred<string>();
    const op2 = createDeferred<number>();

    const promise1 = execute(() => op1.promise);
    const promise2 = execute(() => op2.promise);

    expect(isLoading.value).toBe(true);
    expect(pendingCount.value).toBe(2);

    op1.resolve("first");
    const res1 = await promise1;

    expect(res1).toBe("first");
    expect(isLoading.value).toBe(true);
    expect(pendingCount.value).toBe(1);

    op2.resolve(42);
    const res2 = await promise2;

    expect(res2).toBe(42);
    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("accurately tracks pendingCount across multiple concurrent operations", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const deferreds = [
      createDeferred<void>(),
      createDeferred<void>(),
      createDeferred<void>(),
    ];

    const p0 = execute(() => deferreds[0].promise);
    expect(pendingCount.value).toBe(1);

    const p1 = execute(() => deferreds[1].promise);
    expect(pendingCount.value).toBe(2);

    const p2 = execute(() => deferreds[2].promise);
    expect(pendingCount.value).toBe(3);
    expect(isLoading.value).toBe(true);

    deferreds[1].resolve();
    await p1;
    expect(pendingCount.value).toBe(2);
    expect(isLoading.value).toBe(true);

    deferreds[0].resolve();
    await p0;
    expect(pendingCount.value).toBe(1);
    expect(isLoading.value).toBe(true);

    deferreds[2].resolve();
    await p2;
    expect(pendingCount.value).toBe(0);
    expect(isLoading.value).toBe(false);
  });

  it("returns to idle after mixed success and failure of overlapping operations", async () => {
    const { isLoading, pendingCount, execute } = useLoading();
    const success = createDeferred<string>();
    const failure = createDeferred<string>();

    const successPromise = execute(() => success.promise);
    const failurePromise = execute(() => failure.promise);

    success.resolve("ok");
    failure.reject(new Error("nope"));

    await expect(successPromise).resolves.toBe("ok");
    await expect(failurePromise).rejects.toThrow("nope");

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("maintains independent state across separate instances", async () => {
    const instanceA = useLoading();
    const instanceB = useLoading();
    const deferredA = createDeferred<string>();

    const promiseA = instanceA.execute(() => deferredA.promise);

    expect(instanceA.isLoading.value).toBe(true);
    expect(instanceA.pendingCount.value).toBe(1);
    expect(instanceB.isLoading.value).toBe(false);
    expect(instanceB.pendingCount.value).toBe(0);

    deferredA.resolve("done");
    await promiseA;

    expect(instanceA.isLoading.value).toBe(false);
    expect(instanceA.pendingCount.value).toBe(0);
    expect(instanceB.isLoading.value).toBe(false);
    expect(instanceB.pendingCount.value).toBe(0);
  });

  it("settles correctly when called outside an active effect scope", async () => {
    const { isLoading, pendingCount, execute } = useLoading();

    await expect(execute(async () => "no-scope")).resolves.toBe("no-scope");

    expect(isLoading.value).toBe(false);
    expect(pendingCount.value).toBe(0);
  });

  it("continues tracking pending operations after its effect scope is disposed", async () => {
    let instance!: ReturnType<typeof useLoading>;
    const scope = effectScope();

    scope.run(() => {
      instance = useLoading();
    });

    const deferred = createDeferred<string>();
    const promise = instance.execute(() => deferred.promise);

    scope.stop();

    expect(instance.isLoading.value).toBe(true);
    expect(instance.pendingCount.value).toBe(1);

    deferred.resolve("completed");
    await expect(promise).resolves.toBe("completed");

    expect(instance.isLoading.value).toBe(false);
    expect(instance.pendingCount.value).toBe(0);
  });

  it("exposes readonly state refs", () => {
    const { isLoading, pendingCount } = useLoading();

    expect(isReadonly(isLoading)).toBe(true);
    expect(isReadonly(pendingCount)).toBe(true);
  });

  it("preserves operation return type without type escapes", async () => {
    const { execute } = useLoading();

    interface UserData {
      id: number;
      name: string;
    }

    const user: UserData = { id: 1, name: "Alice" };
    const result: UserData = await execute(async () => user);

    expect(result.id).toBe(1);
    expect(result.name).toBe("Alice");
  });
});
