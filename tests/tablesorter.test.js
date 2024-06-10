import { test } from "uvu";
import * as assert from "uvu/assert";
import { JSDOM } from "jsdom";

import { Table, preferDatasetValue } from "../src/tablesorter.js";

test.before(async () => {});

function getValues(elem, col) {
  // Get values of the given column index
  const rows = Array.from(elem.querySelector("tbody").querySelectorAll("tr"));
  return rows.map((row) => preferDatasetValue(row.children[col]));
}

test("Tablesorter", async () => {
  global.window = (await JSDOM.fromFile("./tests/index.html")).window;

  const elem = global.window.document.getElementById("table1");
  assert.is.not(elem, null); // HTMLTableElement

  const table = new Table(elem);
  assert.equal(table.rows.length, 3);

  // Get the initial values of the first column
  const values = getValues(elem, 0);
  assert.equal(values, ["b", "z", "A"]);

  const headers = elem.getElementsByTagName("th");

  // Sort the first column, it should default to ascending
  headers[0].click();
  assert.equal(getValues(elem, 0), ["A", "b", "z"]);

  // Sort the first column again, it should now be descending
  headers[0].click();
  assert.equal(getValues(elem, 0), ["z", "b", "A"]);

  // Test the manual data type
  headers[2].click();
  assert.equal(getValues(elem, 2), ["4022424", "1.3", "-10"]);
});

test.run();
