import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import {
  type Leaf,
  type Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeFormField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-form-field';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

type GenerateFakeFormResponseArgs = {
  formFieldMetadataItems: FormFieldMetadata[];
  objectMetadataMaps: ObjectMetadataMaps;
};

export const generateFakeFormResponse = ({
  formFieldMetadataItems,
  objectMetadataMaps,
}: GenerateFakeFormResponseArgs): Record<string, Leaf | Node> => {
  const result = formFieldMetadataItems.map((formFieldMetadata) => {
    if (formFieldMetadata.type === 'RECORD') {
      if (!formFieldMetadata?.settings?.objectName) {
        return undefined;
      }

      const objectMetadataItemWithFieldsMaps =
        getObjectMetadataMapItemByNameSingular(
          objectMetadataMaps,
          formFieldMetadata?.settings?.objectName,
        );

      if (!isDefined(objectMetadataItemWithFieldsMaps)) {
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
              objectMetadataItemWithFieldsMaps,
              objectMetadataMaps,
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
