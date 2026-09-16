import { test } from "node:test";
import assert from "node:assert/strict";

test("el runner de tests ejecuta TypeScript", () => {
  const suma: number = 1 + 1;
  assert.equal(suma, 2);
});
