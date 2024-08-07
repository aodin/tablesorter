import { test } from "uvu";
import * as assert from "uvu/assert";
import { JSDOM } from "jsdom";

import { Table, New, preferDatasetValue } from "../src/tablesorter.js";

// Test subclass
class List extends Table {}

test.before(async () => {});

function getValues(elem, col) {
  // Get values of the given column index
  const rows = Array.from(elem.querySelector("tbody").querySelectorAll("tr"));
  return rows.map((row) => preferDatasetValue(row.children[col]));
}

test("Table", async () => {
  global.window = (await JSDOM.fromFile("./tests/index.html")).window;

  const elem = global.window.document.getElementById("table1");
  assert.is.not(elem, null); // HTMLTableElement

  const table = New(elem);
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

  // Test events
  let fired = false;
  table.onSort((d) => {
    fired = true;
  });
  table.sortAsc(1);
  assert.equal(fired, true);

  // Test subclass
  const list = new List(elem);
  assert.equal(list.rows.length, 3);
});

test.run();
