/**
 * Removes invisible characters from a string, including:
 * - Control characters (U+0000 to U+001F, U+007F to U+009F)
 * - Zero width space (U+200B)
 * - Zero width non-joiner (U+200C)
 * - Zero width joiner (U+200D)
 * - Left-to-right mark (U+200E)
 * - Right-to-left mark (U+200F)
 * - Directional overrides (U+202A to U+202E)
 * - Byte order mark (U+FEFF)
 */
export const removeInvisibleChars = (str: string): string => {
  return str.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\uFEFF]/g, '');
};

