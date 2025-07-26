import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import {
  Leaf,
  Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

export const generateFakeFormResponse = async ({
  formMetadata,
  objectMetadataMaps,
}: {
  formMetadata: FormFieldMetadata[];
  objectMetadataMaps: ObjectMetadataMaps;
}): Promise<Record<string, Leaf | Node>> => {
  const result = await Promise.all(
    formMetadata.map(async (formFieldMetadata) => {
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
          [formFieldMetadata.name]: generateFakeField({
            type: formFieldMetadata.type,
            label: formFieldMetadata.label,
            value: formFieldMetadata.placeholder,
          }),
        };
      }
    }),
  );

  return result.filter(isDefined).reduce(
    (acc, curr) => {
      return { ...acc, ...curr };
    },
    {} as Record<string, Leaf | Node>,
  );
};
