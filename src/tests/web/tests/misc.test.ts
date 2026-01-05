/// <reference types="mocha" />

import { expect } from "chai";
import { noop, createDeferred, setImmediate, clearImmediate } from "../../../misc/misc.ts";

describe("Misc utilities", () => {
  describe("noop", () => {
    it("returns null regardless of arguments", () => {
      expect(noop()).to.equal(null);
      expect(noop(1, "test", {})).to.equal(null);
    });
  });

  describe("createDeferred", () => {
    it("creates a deferred object", async () => {
      const deferred = await createDeferred<string>();
      expect(deferred).to.have.property("promise");
      expect(deferred).to.have.property("resolve");
      expect(deferred).to.have.property("reject");
      expect(deferred.promise).to.be.instanceOf(Promise);
    });

    it("resolves the promise when resolve is called", async () => {
      const deferred = await createDeferred<number>();
      const result = deferred.promise;
      deferred.resolve(42);
      expect(await result).to.equal(42);
    });

    it("rejects the promise when reject is called", async () => {
      const deferred = await createDeferred<number>();
      const error = new Error("test error");
      deferred.reject(error);
      try {
        await deferred.promise;
        expect.fail("Promise should have rejected");
      } catch (err) {
        expect(err).to.equal(error);
      }
    });
  });

  describe("setImmediate", () => {
    it("executes the callback asynchronously", async () => {
      let executed = false;
      setImmediate(() => {
        executed = true;
      });
      expect(executed).to.be.false;
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).to.be.true;
    });

    it("passes arguments to the callback", async () => {
      let receivedArgs: unknown[] = [];
      setImmediate(
        (arg1, arg2) => {
          receivedArgs = [arg1, arg2];
        },
        ["hello", 123],
      );

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(receivedArgs).to.deep.equal(["hello", 123]);
    });

    it("throws error for invalid callback", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate("not a function")).to.throw(TypeError);
    });

    it("throws error for invalid arguments", () => {
      // @ts-expect-error Testing runtime check
      expect(() => setImmediate(() => {}, "not an array")).to.throw(TypeError);
    });
  });

  describe("clearImmediate", () => {
    it("cancels the execution of the callback", async () => {
      let executed = false;
      const id = setImmediate(() => {
        executed = true;
      });
      clearImmediate(id);

      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(executed).to.be.false;
    });

    it("does nothing if immediate does not exist", () => {
      expect(clearImmediate(999999)).to.equal(null);
    });
  });
});
