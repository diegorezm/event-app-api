import { test, expect } from "vitest";
import crypto from "./";
test("Testing the crypto class", () => {
  const keyword = "abcabc";
  const hash = crypto.encrypt(keyword);
  expect(typeof hash).toBe("string");
  expect(hash).not.toBeUndefined();
  expect(hash).not.toBe(keyword);
  // @ts-expect-error: if this was undefied the test would have failed
  const decodeHash = crypto.decrypt(hash);
  expect(decodeHash).toBe(keyword);
});
