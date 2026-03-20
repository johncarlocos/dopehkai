/**
 * Validate password strength.
 * Rules:
 * - At least 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 *
 * Returns error message string, or "" if valid.
 */
export function validatePassword(password: string): string {
    if (!password) return "請輸入密碼";
    if (password.length < 8) return "密碼至少需要8個字元";
    if (!/[A-Z]/.test(password)) return "密碼需要包含至少一個大寫字母";
    if (!/[a-z]/.test(password)) return "密碼需要包含至少一個小寫字母";
    return "";
}
