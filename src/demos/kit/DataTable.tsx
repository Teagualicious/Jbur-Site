import "./kit.css";

export interface Column<Row> {
  key: keyof Row & string;
  label: string;
  /** Hidden when the demo is narrow (phones). */
  low?: boolean;
  numeric?: boolean;
  editable?: boolean;
}

interface Props<Row> {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  /** Row key for editable inputs' labels and for highlighting. */
  rowLabel: (row: Row, index: number) => string;
  onEdit?: (index: number, key: keyof Row & string, value: string) => void;
  /** Optional per-row class, e.g. "flag" to highlight. */
  rowClass?: (row: Row, index: number) => string | undefined;
  /** Rows beyond this are summarised as "+N more". */
  limit?: number;
}

export function DataTable<Row extends Record<string, unknown>>(props: Props<Row>) {
  const { caption, columns, rows, rowLabel, onEdit, rowClass, limit = rows.length } = props;
  const visible = rows.slice(0, limit);
  return (
    <div class="table-wrap">
      <table class="data">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th scope="col" class={[c.low && "low", c.numeric && "num"].filter(Boolean).join(" ")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map((row, i) => (
            <tr class={rowClass?.(row, i)}>
              {columns.map((c) => (
                <td class={[c.low && "low", c.numeric && "num"].filter(Boolean).join(" ")}>
                  {c.editable && onEdit ? (
                    <input
                      type="text"
                      value={String(row[c.key] ?? "")}
                      aria-label={`${c.label}, ${rowLabel(row, i)}`}
                      onChange={(e) => onEdit(i, c.key, (e.target as HTMLInputElement).value)}
                    />
                  ) : (
                    String(row[c.key] ?? "")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > visible.length && <p class="table-more">+{rows.length - visible.length} more rows</p>}
    </div>
  );
}
