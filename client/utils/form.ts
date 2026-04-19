export function filterEmptyValues(obj: any) {
  const out: any = {};
  for (const k in obj) { if (obj[k] !== null && obj[k] !== undefined && obj[k] !== '') out[k] = obj[k]; }
  return out;
}
