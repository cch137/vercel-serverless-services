export function Booleanish(value: any) {
  if (typeof value !== "string") return Boolean(value);
  if (value === "false" || value === "0") return false;
  return true;
}

export function toSafeFilename(value: string) {
  return value.replace(/[\/:*?"<>|\\\x00-\x1F]/g, "_");
}
