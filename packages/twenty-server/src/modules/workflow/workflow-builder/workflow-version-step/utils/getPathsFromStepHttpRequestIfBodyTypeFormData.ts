import { isDefined } from 'twenty-shared/utils';

import { parseBodyJson } from 'src/modules/workflow/workflow-builder/workflow-version-step/utils/parseBodyJson';
import {
  type FormDataFile,
  type WorkflowHttpRequestActionInput,
} from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';

export const getPathsFromStepHttpRequestIfBodyTypeFormData = (
  input?: WorkflowHttpRequestActionInput | null,
): string[] | null => {
  if (!isDefined(input) || input.bodyType !== 'FormData') return null;
  let body = input.body;

  if (typeof body === 'string') {
    body = parseBodyJson(body);
  }
  if (!body || typeof body !== 'object') return null;

  const paths: string[] = [];

  Object.values(body).forEach((bodyValue) => {
    if (!Array.isArray(bodyValue) || bodyValue.length === 0) return;

    if (
      typeof bodyValue[0] === 'object' &&
      bodyValue[0] !== null &&
      'path' in bodyValue[0]
    ) {
      (bodyValue as FormDataFile[]).forEach((file) => {
        if (file?.path && file?.filename) paths.push(file.path);
      });
    }
  });

  return paths.length > 0 ? paths : null;
};
