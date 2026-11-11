import { msg } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import {
  compileValidationRuleExpression,
  isDefined,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import {
  WebhookException,
  WebhookExceptionCode,
} from 'src/engine/metadata-modules/webhook/webhook.exception';

const buildInvalidConditionException = ({
  condition,
  reason,
}: {
  condition: string;
  reason: string;
}) =>
  new WebhookException(
    `Condition "${condition}" of the webhook is invalid: ${reason}`,
    WebhookExceptionCode.INVALID_WEBHOOK_INPUT,
    { userFriendlyMessage: msg`The condition of this webhook is invalid` },
  );

// Metadata events ignore the condition; a wildcard object compiles it per object when an event arrives
export const assertWebhookConditionCompilesOrThrow = ({
  condition,
  operations,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  condition: string | null;
  operations: string[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}) => {
  if (!isNonEmptyString(condition)) {
    return;
  }

  const objectNameSingulars = new Set(
    operations
      .filter((operation) => !operation.startsWith('metadata.'))
      .map((operation) => operation.split('.')[0])
      .filter((objectNameSingular) => objectNameSingular !== '*'),
  );

  const flatObjectMetadataByNameSingular = new Map(
    Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .map((flatObjectMetadata) => [
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      ]),
  );

  for (const objectNameSingular of objectNameSingulars) {
    const flatObjectMetadata =
      flatObjectMetadataByNameSingular.get(objectNameSingular);

    if (!isDefined(flatObjectMetadata)) {
      throw buildInvalidConditionException({
        condition,
        reason: `Unknown object ${objectNameSingular}`,
      });
    }

    const compilation = compileValidationRuleExpression({
      expression: condition,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataId: flatObjectMetadata.id,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    });

    if (!compilation.isValid) {
      throw buildInvalidConditionException({
        condition,
        reason: compilation.errorMessage,
      });
    }
  }
};
