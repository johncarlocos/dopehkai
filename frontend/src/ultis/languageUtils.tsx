export function getTeamNameInCurrentLanguage(
    languages?: { zh?: string; [key: string]: string | undefined },
    fallbackName?: string
): string {
    if (!languages) return fallbackName || "";

    // Always return Traditional Chinese (zh) since it's the only supported language
    return languages.zh || fallbackName || "";
}