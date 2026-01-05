import type { AnyFunction } from "../types/types.ts";
import type { Deferred } from "./types.ts";

export const noop = (...args: unknown[]): null => null;
export const createDeferred = async <T>(): Promise<Deferred<T>> => {
  const deferred: Deferred<T> = {
    promise: {} as Promise<T>,
    resolve: noop,
    reject: noop,
  };

  await new Promise((rresolved) => {
    deferred.promise = new Promise<T>((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
      rresolved(null);
    });
  });

  return deferred;
};
export const { setImmediate, clearImmediate } = (() => {
  type Immediate = number;
  type QueueEntry = {
    callback: AnyFunction;
    arguments: unknown[];
    canceled: boolean;
  };

  const immediateQueue = new Map<Immediate, QueueEntry>();
  const channel = new MessageChannel();
  const dummyEntry: QueueEntry = {
    callback: () => {},
    arguments: [],
    canceled: false,
  };

  const drainQueue = () => {
    const queue = [...immediateQueue.values()];
    immediateQueue.clear();
    awaitingDrain = false;

    for (let i = 0; i < queue.length; ++i) {
      const entry = queue[i];
      if (!entry || entry.canceled) continue;

      try {
        entry.callback(...entry.arguments);
      } catch (error) {
        console.log("An error occured whilst executing an immediate callback.");
        console.error(error);
      }
    }

    return null;
  };

  let awaitingDrain = false;
  let immediate = 0;

  channel.port2.onmessage = drainQueue;
  return {
    setImmediate: <T extends AnyFunction>(callback: T, args: unknown[] = []): Immediate => {
      if (typeof callback !== "function") throw new TypeError("Invalid callback.");
      if (!Array.isArray(args)) throw new TypeError("Invalid callback arguments.");

      const _immediate = immediate++;
      immediateQueue.set(_immediate, {
        callback,
        arguments: args,
        canceled: false,
      });

      if (!awaitingDrain) {
        channel.port1.postMessage(null);
        awaitingDrain = true;
      }

      return _immediate;
    },
    clearImmediate: (immediate: Immediate): null => {
      (immediateQueue.get(immediate) || dummyEntry).canceled = true;
      return null;
    },
  };
})();

export * from "./types.ts";
