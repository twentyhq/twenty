import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const getTipTapFileUrlAttributeName = (
  nodeType: string,
): 'src' | 'url' | undefined => {
  switch (nodeType) {
    case TIPTAP_NODE_TYPES.IMAGE:
      return 'src';
    case TIPTAP_NODE_TYPES.FILE:
      return 'url';
    default:
      return undefined;
  }
};
