export const enc    = (n)    => BigInt(n).toString(16).padStart(64, "0");
export const encAddr = (addr) => addr.replace(/^0x/i, "").toLowerCase().padStart(64, "0");
export const dU     = (h)    => BigInt("0x" + h.slice(2, 66));
export const dAddr  = (h)    => "0x" + h.slice(2).slice(24, 64).toLowerCase();

export function dStr(h) {
  try {
    const r      = h.slice(2);
    const offset = parseInt(r.slice(0, 64), 16) * 2;
    const len    = parseInt(r.slice(offset, offset + 64), 16);
    const bytes  = r.slice(offset + 64, offset + 64 + len * 2);
    return decodeURIComponent(bytes.replace(/../g, "%$&"));
  } catch {
    return "?";
  }
}
