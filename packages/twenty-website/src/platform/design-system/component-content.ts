import { type ReactNode } from 'react';

import { type Scheme } from '@/tokens';

export type ComponentExample = {
  id: string;
  title: string;
  description?: ReactNode;
  code: string;
  render: () => ReactNode;
  // Overrides the page scheme, e.g. when the example nests sections itself.
  scheme?: Scheme;
};

// What a component page needs beyond what component-docs.json reads from the types.
export type ComponentContent = {
  name: string;
  summary: ReactNode;
  // Renders the component with axis props merged over a valid base.
  renderWith?: (axisProps: Record<string, unknown>) => ReactNode;
  // Base props as they appear in the generated code snippets.
  baseCode?: Record<string, string>;
  codeChildren?: string;
  hideCombinations?: boolean;
  hiddenAxes?: string[];
  layout?: 'row' | 'stack';
  // For components that are sections themselves and carry their own scheme.
  fixedScheme?: Scheme;
  examples?: ComponentExample[];
  // Usage rules the code states or enforces, each with a stable id.
  practices?: { id: string; text: ReactNode }[];
};
