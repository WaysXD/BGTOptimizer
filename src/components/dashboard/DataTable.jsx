import { C } from "../../lib/constants";

export default function DataTable({ title, columns, rows }) {
  return (
    <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
      <div style={{ marginBottom: 8, fontWeight: 600 }}>{title}</div>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr>{columns.map((c) => <th key={c.key} style={{ textAlign: "left", color: C.text2, borderBottom: `1px solid ${C.border}`, padding: "8px 6px" }}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? <tr><td colSpan={columns.length} style={{ padding: 10, color: C.text2 }}>No records</td></tr> : rows.map((row, idx) => (
              <tr key={row.id || idx}>
                {columns.map((c) => <td key={c.key} style={{ padding: "8px 6px", borderBottom: `1px solid ${C.border}` }}>{c.render ? c.render(row) : String(row[c.key] ?? "—")}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
