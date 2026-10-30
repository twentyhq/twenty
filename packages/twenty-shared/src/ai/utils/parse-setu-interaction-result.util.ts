import { isString } from '@sniptt/guards';

import { SETU_INTERACTION_SCHEMA_VERSION } from '@/ai/constants/setu-interaction-schema-version.const';
import { type SetuInteractionReference } from '@/ai/types/SetuInteractionReference';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';

const MAX_REFERENCE_ID_LENGTH = 64;

const REFERENCE_ID_KEY_BY_KIND = {
  'action-review': 'actionRequestId',
  'task-status': 'taskId',
} as const;

export type ParsedSetuInteractionResult =
  | { status: 'valid'; interaction: SetuInteractionReference }
  | { status: 'unsupported-version' }
  | { status: 'invalid' };

const isReferenceId = (value: unknown): value is string =>
  isString(value) &&
  value.length > 0 &&
  value.length <= MAX_REFERENCE_ID_LENGTH;

// A newer server may emit a schema version this client does not know; that
// renders a refresh prompt instead of guessing at the shape. Anything beyond
// the exact reference keys is refused, so a display event cannot smuggle in
// state the client would trust.
export const parseSetuInteractionResult = (
  result: unknown,
): ParsedSetuInteractionResult => {
  if (!isPlainObject(result) || !isPlainObject(result.interaction)) {
    return { status: 'invalid' };
  }

  const interaction = result.interaction;
  const { schemaVersion, kind } = interaction;

  if (
    typeof schemaVersion === 'number' &&
    schemaVersion > SETU_INTERACTION_SCHEMA_VERSION
  ) {
    return { status: 'unsupported-version' };
  }

  if (
    schemaVersion !== SETU_INTERACTION_SCHEMA_VERSION ||
    (kind !== 'action-review' && kind !== 'task-status')
  ) {
    return { status: 'invalid' };
  }

  const referenceIdKey = REFERENCE_ID_KEY_BY_KIND[kind];
  const referenceId = interaction[referenceIdKey];

  if (Object.keys(interaction).length !== 3 || !isReferenceId(referenceId)) {
    return { status: 'invalid' };
  }

  return {
    status: 'valid',
    interaction:
      kind === 'action-review'
        ? { schemaVersion: 1, kind, actionRequestId: referenceId }
        : { schemaVersion: 1, kind, taskId: referenceId },
  };
};
