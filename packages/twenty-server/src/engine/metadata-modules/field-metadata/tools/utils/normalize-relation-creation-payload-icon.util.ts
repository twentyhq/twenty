import { FIELD_TYPE_DEFAULT_ICONS } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { normalizeIconName } from 'src/engine/core-modules/tool-provider/utils/normalize-icon-name.util';

export const normalizeRelationCreationPayloadIcon = (
  relationCreationPayload: unknown,
): unknown => {
  if (
    !isDefined(relationCreationPayload) ||
    typeof relationCreationPayload !== 'object' ||
    Array.isArray(relationCreationPayload)
  ) {
    return relationCreationPayload;
  }

  const { targetFieldIcon } = relationCreationPayload as {
    targetFieldIcon?: string;
  };

  return {
    ...relationCreationPayload,
    targetFieldIcon:
      normalizeIconName(targetFieldIcon) ??
      FIELD_TYPE_DEFAULT_ICONS[FieldMetadataType.RELATION],
  };
};
