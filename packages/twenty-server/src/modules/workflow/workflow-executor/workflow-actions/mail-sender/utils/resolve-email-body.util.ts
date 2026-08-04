import {
  type EmailDocument,
  type EmailDocumentNode,
  parseJson,
  parseEmailDocument,
  TIPTAP_NODE_TYPES,
  transformEmailDocumentStrings,
} from 'twenty-shared/utils';

import { renderEmailBodyToHtml } from 'src/engine/core-modules/tool/tools/email-tool/utils/render-email-body.util';
import { resolveWorkflowEmailTemplateString } from 'src/modules/workflow/workflow-executor/workflow-actions/mail-sender/utils/resolve-workflow-email-template-string.util';

const textToInlineNodes = (text: string): EmailDocumentNode[] =>
  text.split('\n').flatMap((line, index, lines) => [
    ...(line === ''
      ? []
      : [
          {
            type: TIPTAP_NODE_TYPES.TEXT,
            text: line,
          } satisfies EmailDocumentNode,
        ]),
    ...(index < lines.length - 1
      ? [{ type: TIPTAP_NODE_TYPES.HARD_BREAK } satisfies EmailDocumentNode]
      : []),
  ]);

const resolveDocumentNode = (
  node: EmailDocumentNode,
  context: Record<string, unknown>,
): EmailDocumentNode[] => {
  if (node.type === TIPTAP_NODE_TYPES.VARIABLE_TAG) {
    const variable = node.attrs?.variable;

    return textToInlineNodes(
      typeof variable === 'string'
        ? resolveWorkflowEmailTemplateString(variable, context, {
            escapeValues: false,
          })
        : '',
    );
  }

  const { content, ...nodeWithoutContent } = node;
  const resolvedNode = transformEmailDocumentStrings(
    nodeWithoutContent,
    (value, stringContext) =>
      resolveWorkflowEmailTemplateString(value, context, {
        escapeValues: stringContext === 'html',
      }),
  );

  return [
    {
      ...resolvedNode,
      ...(content && {
        content: content.flatMap((childNode) =>
          resolveDocumentNode(childNode, context),
        ),
      }),
    },
  ];
};

export const resolveEmailBody = async (
  body: string,
  context: Record<string, unknown>,
): Promise<string> => {
  const unresolvedDocument = parseJson<unknown>(body);
  const isDocument =
    typeof unresolvedDocument === 'object' &&
    unresolvedDocument !== null &&
    'type' in unresolvedDocument &&
    unresolvedDocument.type === 'doc';

  if (!isDocument) {
    return resolveWorkflowEmailTemplateString(body, context, {
      escapeValues: false,
    });
  }

  const parseResult = parseEmailDocument(unresolvedDocument);

  if (!parseResult.success) {
    throw new Error(`Invalid workflow email document: ${parseResult.error}`);
  }

  const [resolvedDocument] = resolveDocumentNode(parseResult.document, context);

  return renderEmailBodyToHtml(resolvedDocument as EmailDocument);
};
