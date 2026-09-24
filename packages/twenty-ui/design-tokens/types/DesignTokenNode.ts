import { type DesignTokenLeaf } from './DesignTokenLeaf';

export type DesignTokenNode = {
  [key: string]: DesignTokenNode | DesignTokenLeaf;
};
