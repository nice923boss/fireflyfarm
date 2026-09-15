/** Unique-enough id for newly created items (rooms, seasons, edm, ...). */
export function newId(prefix: string, now = Date.now()): string {
  return `${prefix}-${now.toString(36)}`;
}
