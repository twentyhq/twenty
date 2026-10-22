import { isNonEmptyString } from '@sniptt/guards';

import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

import { type TipTapMark } from './tiptap-mark-types';
import { type TipTapNode } from './tiptap-node';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

export const convertTextToTipTapNodes = (
  text: string,
  marks: TipTapMark[],
): TipTapNode[] =>
  text.split('\n').flatMap((line, lineIndex) => {
    const lineNodes: TipTapNode[] =
      lineIndex > 0 ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK }] : [];

    if (isNonEmptyString(line)) {
      lineNodes.push(
        isNonEmptyArray(marks)
          ? { type: TIPTAP_NODE_TYPES.TEXT, text: line, marks }
          : { type: TIPTAP_NODE_TYPES.TEXT, text: line },
      );
    }

    return lineNodes;
  });
