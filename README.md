# tablesorter
Native JS tablesorter


Install with:

```
npm i @aodin/tablesorter
```

A minified JS file and map is included in the `dist` directory.


### Usage

Tables must be initialized before sorting is active.

```js
new tablesorter.Table(document.getElementById("table"))
```

Or to initialize all tables with a certain class, such as `tablesorter`:

```js
document.querySelectorAll(".tablesorter").forEach(elem => new tablesorter.Table(elem))
```

Column types can be explicitly set using a `data-type` attribute on the `th` element. For example:

```html
<th data-type="numeric">Data</th>
```

To prevent a column from being sortable, add a `no-sort` class to the `th` element.


### Project summary

* Native JS with no dependencies
* About 1kb minified and compressed
* Module and ES6 export based file structure
* Simple class-based states: `active`, `asc`, `desc`
* Reads from either the data attribute `data-value` or HTML inner text
* Uses local string comparison
* Default sort for text columns is ascending, default sort for numeric is descending
* Table fires a `sort` event when sorted, which includes col and asc details
* Includes example Sass and CSS styles
* MIT license


### Development

Test with:

```
npm test
```

Build with:

```
npm run build
```

Happy hacking!

aodin, 2024
