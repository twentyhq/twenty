import { type DesignTokenLeaf } from './DesignTokenLeaf';

export type CollectedTokenLeaf = DesignTokenLeaf & {
  path: string[];
  varName: string;
};
