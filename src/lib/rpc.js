// Client-side RPC — proxies through /api/rpc to avoid browser CORS.
const API_RPC = "/api/rpc";
const CHUNK   = 80;

async function batchChunk(calls) {
  const payload = calls.map((c, i) => ({
    jsonrpc: "2.0",
    id: i,
    method: "eth_call",
    params: [{ to: c.to, data: c.data }, "latest"],
  }));
  const res = await fetch(API_RPC, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const data = await res.json();
  const arr  = Array.isArray(data) ? data : [data];
  return arr.sort((a, b) => a.id - b.id).map((r) => r.result ?? null);
}

export async function batchRpc(calls) {
  if (!calls.length) return [];
  const chunks = [];
  for (let i = 0; i < calls.length; i += CHUNK) {
    chunks.push(calls.slice(i, i + CHUNK));
  }
  const results = await Promise.all(chunks.map(batchChunk));
  return results.flat();
}
