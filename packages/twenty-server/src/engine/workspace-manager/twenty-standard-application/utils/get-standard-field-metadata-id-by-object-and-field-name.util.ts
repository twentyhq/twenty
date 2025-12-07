import { v4 } from 'uuid';

import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { type AllStandardFieldByObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

export type StandardFieldMetadataIdByObjectAndFieldName = {
  [O in AllStandardObjectName]: {
    id: string;
    fields: Record<AllStandardFieldByObjectName<O>, string>;
  };
};

// TODO remove once we have refactored the builder to iterate over universalIdentifier only
export const getStandardFieldMetadataIdByObjectAndFieldName =
  (): StandardFieldMetadataIdByObjectAndFieldName => {
    const result = {} as StandardFieldMetadataIdByObjectAndFieldName;

    for (const objectName of Object.keys(
      STANDARD_OBJECTS,
    ) as AllStandardObjectName[]) {
      const fieldNames = Object.keys(
        STANDARD_OBJECTS[objectName].fields,
      ) as AllStandardFieldByObjectName<typeof objectName>[];

      const fieldIds = {} as Record<
        AllStandardFieldByObjectName<typeof objectName>,
        string
      >;

      for (const fieldName of fieldNames) {
        fieldIds[fieldName] = v4();
      }

      result[objectName] = {
        // @ts-expect-error ignore this
        fields: fieldIds,
        id: v4(),
      };
    }

    return result;
  };
