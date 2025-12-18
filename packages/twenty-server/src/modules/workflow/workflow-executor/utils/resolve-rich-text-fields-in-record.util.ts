import { isString } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined, resolveRichTextVariables } from 'twenty-shared/utils';

import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

export const resolveRichTextFieldsInRecord = (
  objectRecord: Record<string, unknown>,
  objectMetadataInfo: ObjectMetadataInfo,
  context: Record<string, unknown>,
): Record<string, unknown> => {
  const { flatObjectMetadata, flatFieldMetadataMaps } = objectMetadataInfo;

  const richTextFieldNames = flatObjectMetadata.fieldMetadataIds
    .map((fieldId) => flatFieldMetadataMaps.byId[fieldId])
    .filter((field) => field?.type === FieldMetadataType.RICH_TEXT_V2)
    .map((field) => field?.name)
    .filter(isDefined);

  const resolvedRecord = { ...objectRecord };

  for (const fieldName of richTextFieldNames) {
    const fieldValue = resolvedRecord[fieldName];

    if (
      isDefined(fieldValue) &&
      'blocknote' in fieldValue &&
      isString(fieldValue.blocknote)
    ) {
      const richTextValue = fieldValue as { blocknote: string };

      resolvedRecord[fieldName] = {
        ...richTextValue,
        blocknote: resolveRichTextVariables(richTextValue.blocknote, context),
      };
    }
  }

  return resolvedRecord;
};
