import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowCommonException,
  WorkflowCommonExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-common.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
        throw new WorkflowCommonException(
          `Object metadata not found for object name ${formFieldMetadata?.settings?.objectName}`,
          WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
        );
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        throw new WorkflowCommonException(
          `Object metadata not found for object name ${formFieldMetadata?.settings?.objectName}`,
          WorkflowCommonExceptionCode.OBJECT_METADATA_NOT_FOUND,
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
          selectedFieldId: formFieldMetadata.settings?.selectedFieldId,
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
