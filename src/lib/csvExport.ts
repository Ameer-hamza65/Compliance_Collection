// Generic CSV Export Utility

export interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number;
}

export function exportToCSV<T>(
  rows: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  const headers = columns.map(c => c.header).join(',');
  const csvRows = rows.map(row =>
    columns.map(col => {
      const val = col.accessor(row);
      // Escape strings with commas or quotes
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return String(val);
    }).join(',')
  );

  const csv = [headers, ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
