import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDecimalBytes } from "../src/lib/format.ts";

test("formata bytes decimais em português e respeita as fronteiras de unidade", () => {
  assert.equal(formatDecimalBytes("0"), "0 B");
  assert.equal(formatDecimalBytes("999"), "999 B");
  assert.equal(formatDecimalBytes("1000"), "1,0 KB");
  assert.equal(formatDecimalBytes("999949"), "999,9 KB");
  assert.equal(formatDecimalBytes("999950"), "1,0 MB");
  assert.equal(formatDecimalBytes("-1234"), "−1,2 KB");
});

test("formata contagens de bytes acima do limite seguro sem perder precisão", () => {
  assert.equal(formatDecimalBytes("9567199254740993000"), "9,6 EB");
});
