export type ComponentDocumentation = {
  name: string;
  entryPoint: string;
  slug: string;
  parts?: {
    name: string;
    props: ComponentDocumentation['props'];
  }[];
  props: {
    name: string;
    type: string;
    required: boolean;
    defaultValue: string | null;
    description: string;
  }[];
};

export type TokenDocumentation = {
  path: string;
  cssVariable: string;
  light: string;
  dark: string;
  isNumber: boolean;
};
