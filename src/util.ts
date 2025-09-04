export const KEY_IDENTIFIER = '_vmId';
export function getUserIdentifier() {
  return sessionStorage.getItem(KEY_IDENTIFIER) || undefined;
}
