export type CollectedTokenLeaf = {
  path: string[];
  varName: string;
  light: string;
  dark: string;
  unit?: 'number';
  jsValue?: 'cssVariable';
};
