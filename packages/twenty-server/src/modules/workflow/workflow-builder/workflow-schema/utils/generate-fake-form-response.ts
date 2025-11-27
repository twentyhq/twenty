import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type Leaf,
  type Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeFormField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-field';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

type GenerateFakeFormResponseArgs = {
  formFieldMetadataItems: FormFieldMetadata[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  objectIdByNameSingular: Record<string, string>;
};

export const generateFakeFormResponse = ({
  formFieldMetadataItems,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  objectIdByNameSingular,
}: GenerateFakeFormResponseArgs): Record<string, Leaf | Node> => {
  const result = formFieldMetadataItems.map((formFieldMetadata) => {
    if (formFieldMetadata.type === 'RECORD') {
      if (!formFieldMetadata?.settings?.objectName) {
        return undefined;
      }

      const objectId =
        objectIdByNameSingular[formFieldMetadata?.settings?.objectName];

      if (!isDefined(objectId)) {
        throw new Error(
          `Object metadata not found for object name ${formFieldMetadata?.settings?.objectName}`,
        );
      }

      const flatObjectMetadata = flatObjectMetadataMaps.byId[objectId];

      if (!isDefined(flatObjectMetadata)) {
        throw new Error(
          `Object metadata not found for object name ${formFieldMetadata?.settings?.objectName}`,
        );
      }

      return {
        [formFieldMetadata.name]: {
          isLeaf: false,
          label: formFieldMetadata.label,
          value: generateFakeObjectRecord({
            objectMetadataInfo: {
              flatObjectMetadata,
              flatObjectMetadataMaps,
              flatFieldMetadataMaps,
            },
          }),
        },
      };
    } else {
      return {
        [formFieldMetadata.name]: generateFakeFormField({
          type: formFieldMetadata.type,
          label: formFieldMetadata.label,
          value: formFieldMetadata.placeholder,
        }),
      };
    }
  });

  return result.filter(isDefined).reduce(
    (acc, curr) => {
      return { ...acc, ...curr };
    },
    {} as Record<string, Leaf | Node>,
  );
};
