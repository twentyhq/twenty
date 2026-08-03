// Accepts flat names ({{firstName}}) and field paths ({{name.firstName}}).
export const CAMPAIGN_VARIABLE_PATTERN =
  /\{\{\s*([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z][a-zA-Z0-9_]*)*)\s*\}\}/g;
