export const BASIC_FAILING_STRING_EDGE_CASE_INPUTS: {
  label: string;
  input: string | undefined | number | null;
}[] = [
  { input: '          ', label: 'only white spaces' },
  { input: '', label: 'empty string' },
  { input: null, label: 'null' },
  { input: 22222, label: 'not a string' },
  { input: 'a'.repeat(64), label: 'too long' },
] as const;
