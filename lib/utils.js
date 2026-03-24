import { C, PROTO_URL } from "./constants.js";

export function fmt(n, d = 2) {
  if (n == null || isNaN(n)) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(d);
}

export function aprColor(a) {
  if (a >= 500) return C.honey;
  if (a >= 100) return C.green;
  if (a >= 20)  return C.text0;
  return C.text2;
}

export function aprPill(a) {
  if (a >= 500) return { bg: C.honeyDim, c: C.honey };
  if (a >= 100) return { bg: C.greenDim, c: C.green };
  if (a >= 20)  return { bg: C.bg3,      c: C.text1 };
  return { bg: C.bg2, c: C.text2 };
}

export function stakeUrl(vault) {
  return PROTO_URL[vault.protocol] ?? `https://app.kodiak.finance/`;
}
