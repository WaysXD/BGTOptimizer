import { C } from "../../lib/constants";

export default function MetricCard({ label, value, sub }) {
  return (
    <div style={{ background: C.bg1, border: `1px solid ${C.border}`, borderRadius: 12, padding: "0.9rem 1rem" }}>
      <div style={{ color: C.text2, fontSize: 11, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: C.mono, fontSize: 22 }}>{value}</div>
      {sub ? <div style={{ color: C.text2, fontSize: 11, marginTop: 4 }}>{sub}</div> : null}
    </div>
  );
}
