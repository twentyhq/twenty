import { isDefined } from '@/utils/validation';

import {
  EMAIL_DOCUMENT_MARK_CATALOG,
  isEmailDocumentMarkType,
} from './email-document-mark-catalog';
import { type EmailDocumentNode } from './email-document-node';
import {
  EMAIL_DOCUMENT_NODE_CATALOG,
  isEmailDocumentNodeType,
} from './email-document-node-catalog';
import { type EmailDocumentStringContext } from './email-document-string-context';

type StringTransformer = (
  value: string,
  context: EmailDocumentStringContext,
) => string;

type StringAttributeContexts = Readonly<
  Partial<Record<string, EmailDocumentStringContext>>
>;

const transformAttributes = (
  attributes: Record<string, unknown> | undefined,
  stringAttributes: StringAttributeContexts,
  transform: StringTransformer,
): Record<string, unknown> | undefined => {
  if (!isDefined(attributes)) {
    return attributes;
  }

  return Object.entries(stringAttributes).reduce(
    (transformedAttributes, [attributeName, context]) => {
      const value = transformedAttributes[attributeName];

      return typeof value === 'string' && isDefined(context)
        ? {
            ...transformedAttributes,
            [attributeName]: transform(value, context),
          }
        : transformedAttributes;
    },
    attributes,
  );
};

export const transformEmailDocumentStrings = <TNode extends EmailDocumentNode>(
  node: TNode,
  transform: StringTransformer,
): TNode => {
  const nodeDefinition = isEmailDocumentNodeType(node.type)
    ? EMAIL_DOCUMENT_NODE_CATALOG[node.type]
    : undefined;
  const attributes = transformAttributes(
    node.attrs,
    nodeDefinition?.stringAttributes ?? {},
    transform,
  );

  const marks = node.marks?.map((mark) => {
    if (
      typeof mark !== 'object' ||
      mark === null ||
      !('type' in mark) ||
      typeof mark.type !== 'string' ||
      !isEmailDocumentMarkType(mark.type)
    ) {
      return mark;
    }

    return {
      ...mark,
      ...('attrs' in mark &&
        typeof mark.attrs === 'object' &&
        mark.attrs !== null && {
          attrs: transformAttributes(
            mark.attrs as Record<string, unknown>,
            EMAIL_DOCUMENT_MARK_CATALOG[mark.type].stringAttributes,
            transform,
          ),
        }),
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
