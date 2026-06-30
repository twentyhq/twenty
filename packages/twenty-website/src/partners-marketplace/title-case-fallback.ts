// Turns a CRM enum value the website has no translated label for into a
// readable string: "TAMIL" -> "Tamil", "SELF_HOST" -> "Self host". The label
// maps cover the known vocabulary; this only catches values added CRM-side
// before the site syncs.
export const titleCaseFallback = (raw: string): string =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
