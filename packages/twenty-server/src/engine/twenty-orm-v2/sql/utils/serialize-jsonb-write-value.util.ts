import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceColumnShape } from 'src/engine/twenty-orm-v2/table-shape/types/workspace-table-shape.type';

const isJsonbFieldMetadataType = (
  fieldMetadataType: FieldMetadataType,
): boolean =>
  fieldMetadataType === FieldMetadataType.RAW_JSON ||
  fieldMetadataType === FieldMetadataType.FILES;

// TypeORM's jsonb column transformer JSON.stringify-ed values on write. The v2
// path binds straight to `pg`, which stringifies a plain object but encodes a JS
// array as a Postgres array literal — invalid for jsonb. Mirror the transformer
// so composite array sub-columns (secondaryLinks, additionalEmails, ...) and
// FILES values reach jsonb columns as JSON text.
export const serializeJsonbWriteValue = (
  columnShape: WorkspaceColumnShape | undefined,
  value: unknown,
): unknown => {
  if (!isDefined(columnShape) || !isDefined(value)) {
    return value;
  }

  return isJsonbFieldMetadataType(columnShape.fieldMetadataType)
    ? JSON.stringify(value)
    : value;
};
