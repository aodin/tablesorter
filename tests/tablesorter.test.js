import { test } from "uvu";
import * as assert from "uvu/assert";
import { JSDOM } from "jsdom";

import { Table, preferDatasetValue } from "../src/tablesorter.js";
import { percent, numeric, text } from "../src/tablesorter.js";

test.before(async () => {});

function getValues(elem, col) {
  // Get values of the given column index
  const rows = Array.from(elem.querySelector("tbody").querySelectorAll("tr"));
  return rows.map((row) => preferDatasetValue(row.children[col]));
}

function detect(type, values) {
  return values.every((value) => type.check(type.filter(value)));
}

test("types", () => {
  // Negatives, empty strings, standalone "-", and commas should still pass
  // the check for numeric
  const numbers = ["0", "-", "", "-0.004", "1,000,001"];
  assert.is(
    detect(numeric, numbers),
    true,
    "Numbers were not detected as numbers",
  );

  // NAICS codes should be recognized as strings, not numbers
  const naics = ["11", "21", "31-33", "42", "44-45"];
  assert.is(detect(numeric, naics), false, "NAICS were detected as numbers");

  // Percents should be recognized as a percent
  const percents = ["8.4%", "10.8%", "-", "", "-0.6%", "1,000.0%", "10000000%"];
  assert.is(
    detect(percent, percents),
    true,
    "Percents were not detected as percents",
  );
});

test("Tablesorter", async () => {
  const window = (await JSDOM.fromFile("./tests/index.html")).window;

  const elem = window.document.getElementById("table1");
  assert.is.not(elem, null); // HTMLTableElement

  const table = new Table(elem, window);

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

  // Test that numeric-appearing text is still sorted as text
  headers[1].click();
  assert.equal(getValues(elem, 1), ["0.4.5", "1.4.5.6", "99.4.0"]);

  // Test the manual data type
  headers[3].click();
  assert.equal(getValues(elem, 3), ["4022424", "1.3", "-10"]);
});

test.run();
