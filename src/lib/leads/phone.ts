/**
 * Normalize Ukrainian (and similar) phone numbers to a digits-only key
 * so that +380…, 380… and 0… variants of the same number collide.
 */
export function phoneFingerprint(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10 && digits.startsWith("0")) {
    return `380${digits.slice(1)}`;
  }

  if (digits.length === 11 && digits.startsWith("80")) {
    return `3${digits}`;
  }

  return digits;
}
