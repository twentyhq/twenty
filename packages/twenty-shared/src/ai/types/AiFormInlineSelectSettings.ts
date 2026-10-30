export type AiFormInlineOption = {
  value: string;
  label: string;
};

// A SELECT or MULTI_SELECT field whose choices the agent lists itself rather
// than borrowing them from an existing select field.
export type AiFormInlineSelectSettings = {
  optionSource?: 'inline';
  options: AiFormInlineOption[];
  required?: boolean;
};
