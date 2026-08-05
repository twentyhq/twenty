import { type EmailDocumentNode } from './email-document-node';
import { type EmailDocumentStringContext } from './email-document-string-context';
import { TIPTAP_MARK_TYPES } from './tiptap-mark-types';
import { TIPTAP_NODE_TYPES } from './tiptap-node-types';

type StringTransformer = (
  value: string,
  context: EmailDocumentStringContext,
) => string;

const transformAttribute = (
  attributes: Record<string, unknown> | undefined,
  attributeName: string,
  context: EmailDocumentStringContext,
  transform: StringTransformer,
): Record<string, unknown> | undefined => {
  const value = attributes?.[attributeName];

  if (typeof value !== 'string') {
    return attributes;
  }

  return {
    ...attributes,
    [attributeName]: transform(value, context),
  };
};

export const transformEmailDocumentStrings = <TNode extends EmailDocumentNode>(
  node: TNode,
  transform: StringTransformer,
): TNode => {
  let attributes = node.attrs;

  if (node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG) {
    attributes = transformAttribute(attributes, 'variable', 'text', transform);
  }

  if (node.type === TIPTAP_NODE_TYPES.BUTTON) {
    attributes = transformAttribute(attributes, 'href', 'url', transform);
  }

  if (node.type === TIPTAP_NODE_TYPES.IMAGE) {
    for (const attributeName of ['src', 'href']) {
      attributes = transformAttribute(
        attributes,
        attributeName,
        'url',
        transform,
      );
    }

    for (const attributeName of ['alt', 'title']) {
      attributes = transformAttribute(
        attributes,
        attributeName,
        'text',
        transform,
      );
    }
  }

  if (node.type === TIPTAP_NODE_TYPES.HTML) {
    attributes = transformAttribute(attributes, 'html', 'html', transform);
  }

  const marks = node.marks?.map((mark) => {
    if (
      typeof mark !== 'object' ||
      mark === null ||
      !('type' in mark) ||
      mark.type !== TIPTAP_MARK_TYPES.LINK ||
      !('attrs' in mark) ||
      typeof mark.attrs !== 'object' ||
      mark.attrs === null
    ) {
      return mark;
    }

    return {
      ...mark,
      attrs: transformAttribute(
        mark.attrs as Record<string, unknown>,
        'href',
        'url',
        transform,
      ),
    };
  });

  return {
    ...node,
    ...(typeof node.text === 'string' && {
      text: transform(node.text, 'text'),
    }),
    ...(attributes && { attrs: attributes }),
    ...(marks && { marks }),
    ...(node.content && {
      content: node.content.map((childNode) =>
        transformEmailDocumentStrings(childNode, transform),
      ),
    }),
  } as TNode;
};
