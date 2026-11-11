// Builds a CSV file from the explorer's serialized columns/rows and triggers a
// browser download. No HTML is involved; cell values come from `cell.text`.
//
// Spreadsheet apps evaluate a cell as a formula when it starts with one of
// = + - @ (or a tab/CR). Member-state reported values are untrusted free text,
// so a value like `=HYPERLINK(...)` or `=cmd|'/C calc'!A0` would run when the
// exported CSV is opened. Prefixing a single quote forces literal text; quoting
// or escaping alone does NOT prevent this.

// A value that is a plain number (optional sign, digits, decimal, exponent) is
// parsed as a number and never as a formula, so it must be left untouched:
// prefixing a quote to `-5` would corrupt it into the text `'-5`. Only
// dangerous-looking values that are *not* valid numbers get neutralised.
const NUMERIC = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;
const FORMULA_PREFIX = /^[=+\-@\t\r]/;

export const escapeCell = (value) => {
  const raw = value == null ? '' : String(value);
  const needsGuard = FORMULA_PREFIX.test(raw) && !NUMERIC.test(raw);
  const text = needsGuard ? `'${raw}` : raw;

  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const downloadCsv = (columns, rows, filename) => {
  const header = columns.map((column) => escapeCell(column.label)).join(',');
  const body = (rows || [])
    .map((row) =>
      columns
        .map((column) => {
          const cell = row[column.key] || {};

          return escapeCell(cell.empty ? '' : cell.text);
        })
        .join(','),
    )
    .join('\n');

  // The BOM keeps accented characters (Eaux côtières) readable in Excel.
  const blob = new Blob([`\uFEFF${header}\n${body}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default downloadCsv;
