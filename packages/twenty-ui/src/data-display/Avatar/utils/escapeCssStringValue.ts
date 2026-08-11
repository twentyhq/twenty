// Escapes the two characters that terminate or corrupt a double-quoted CSS
// string value (e.g. inside url("...")), leaving URL semantics untouched.
export const escapeCssStringValue = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
