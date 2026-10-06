// Builds a CSV file from the explorer's serialized columns/rows and triggers a
// browser download. No HTML is involved; cell values come from `cell.text`.
const escapeCell = (value) => {
  const text = value == null ? '' : String(value);

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
