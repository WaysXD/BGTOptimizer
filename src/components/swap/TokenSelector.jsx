import { useMemo, useState } from "react";
import { BERACHAIN_TOKENS } from "../../lib/tokens/berachainTokens";
import { C } from "../../lib/constants";

export default function TokenSelector({ label, selected, onSelect, blockedAddress }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const options = useMemo(() => BERACHAIN_TOKENS.filter((token) => {
    if (blockedAddress && token.address === blockedAddress) return false;
    if (!query) return true;
    return token.symbol.toLowerCase().includes(query.toLowerCase()) || token.address.includes(query.toLowerCase());
  }), [query, blockedAddress]);

  return (
    <div>
      <div style={{ fontSize: 11, color: C.text2, marginBottom: 6 }}>{label}</div>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", textAlign: "left", background: C.bg2, color: C.text0, border: `1px solid ${C.border2}`, borderRadius: 10, padding: "10px 12px", cursor: "pointer" }}>
        {selected?.symbol || "Select token"}
      </button>
      {open && (
        <div style={{ marginTop: 8, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8 }}>
          <input aria-label={`${label} search`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by symbol or address" style={{ width: "100%", marginBottom: 8 }} />
          <div style={{ maxHeight: 180, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {options.map((token) => (
              <button key={token.address} onClick={() => { onSelect(token); setOpen(false); }} style={{ textAlign: "left", background: "transparent", border: `1px solid ${C.border}`, color: C.text0, borderRadius: 8, padding: "8px 10px", cursor: "pointer" }}>
                <strong>{token.symbol}</strong> <span style={{ color: C.text2, fontSize: 12 }}>{token.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
