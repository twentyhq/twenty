// A form step field as the run snapshots it into its Ask.
export type InputAskFormField = {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  value?: unknown;
  settings?: Record<string, unknown>;
};
