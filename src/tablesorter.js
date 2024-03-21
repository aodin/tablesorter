const removeCommas = (v) => v.replaceAll(",", "");
const removePercent = (v) => v.replace(/%$/, "");
const emptyZeros = (v) => (v === "-" || v === "" ? "0" : v);

// Table data types
export const numeric = {
  name: "numeric",
  filter: (v) => emptyZeros(removeCommas(v)),
  check: (v) => !isNaN(v),
  sort: (a, b) => parseFloat(a) - parseFloat(b),
  defaultAsc: false,
};

export const percent = Object.assign({}, numeric, {
  name: "percent",
  filter: (v) => emptyZeros(removePercent(removeCommas(v))),
});

export const text = {
  name: "text",
  filter: (v) => v,
  check: (v) => true,
  sort: (a, b) => a.localeCompare(b),
  defaultAsc: true,
};

// Types should be ordered from most specific to most generic
export const types = [percent, numeric, text];

export function preferDatasetValue(elem) {
  // Return the text that should be used for sorting
  // NOTE This function previously used innerText, but was changed since jsDOM
  // doesn't support innerText. There may be formatting differences within
  // the element, but any leading or trailing whitespace will be trimmed
  return elem.dataset.value ? elem.dataset.value : elem.textContent.trim();
}

export class Table {
  constructor(elem, _window = window) {
    this.rows = [];
    this.types = [];
    const thead = elem.querySelector("thead");
    if (!thead) return; // Sorting requires a thead

    this.tbody = elem.querySelector("tbody");
    this.rows = Array.from(this.tbody.querySelectorAll("tr"));
    const headers = thead.querySelectorAll("th");

    // Determine the types of each column and add an event listener for sorting
    headers.forEach((header, col) => {
      // Ignore headers with the `no-sort` class
      if (header.classList.contains("no-sort")) return;

      // Column types can be requested by setting dataset-type to the type name
      const name = header.dataset.type;

      // Find an appropriate type for the column
      // The last type is a catchall and doesn't need to be tested
      let t = types.slice(0, -1).find((type) => {
        if (name && type.name === name) {
          return true;
        }

        return this.rows.every((row) => {
          return type.check(type.filter(this.getValue(row.children[col])));
        });
      });

      // If no type was matched, use the last available type
      if (!t) t = types[types.length - 1];

      // Save the type
      this.types[col] = this.detect(header, col);

      // Add the event listener
      header.addEventListener("click", () => {
        // If there is already a sorting class, invert that, otherwise use default
        let asc = t.defaultAsc;
        if (header.classList.contains("asc")) {
          asc = false;
        } else if (header.classList.contains("desc")) {
          asc = true;
        }

        // Remove the sorting classes from all headers
        headers.forEach((th) => th.classList.remove("active", "desc", "asc"));

        // Add the correct classes to the clicked header
        header.classList.add("active");
        asc ? header.classList.add("asc") : header.classList.add("desc");
        this.sortWithType(col, asc, t);

        // Dispatch an event whenever the table is sorted
        if (_window) {
          const event = new _window.CustomEvent("sort", {
            detail: { col, asc },
          });
          elem.dispatchEvent(event);
        }
      });

      // Prevent repeated clicking on headers from selecting them
      header.addEventListener("mousedown", (evt) => evt.preventDefault());
    });
  }

  detect(header, col) {
    // To set a column type manually, add a dataset-type with the type name
    const name = header.dataset.type;

    // Find an appropriate type for the column
    // The last type is a catchall and doesn't need to be tested
    let t = types.slice(0, -1).find((type) => {
      if (name && type.name === name) return true;
      return this.rows.every((row) => this.checkRow(type, row, col));
    });

    if (t) return t;

    // If no type was matched, use the last available type
    return types[types.length - 1];
  }

  checkRow(type, row, col) {
    return type.check(type.filter(this.getValue(row.children[col])));
  }

  getValue(elem) {
    return preferDatasetValue(elem);
  }

  sort(col, asc = true) {
    this.sortWithType(col, asc, this.types[col]);
  }

  sortAsc(col) {
    this.sort(col, true);
  }
  sortDesc(col) {
    this.sort(col, false);
  }

  sortWithType(col, asc, type) {
    // Sorts the table using the given column, type, and direction
    const sorted = this.rows.sort((a, b) => {
      const va = type.filter(this.getValue(a.children[col]));
      const vb = type.filter(this.getValue(b.children[col]));
      return asc ? type.sort(va, vb) : type.sort(vb, va);
    });

    // Append each sorted row to the tbody
    sorted.forEach((row) => this.tbody.appendChild(row));
  }
}
