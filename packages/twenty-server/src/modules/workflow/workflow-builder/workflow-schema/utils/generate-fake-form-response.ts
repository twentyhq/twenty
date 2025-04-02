import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  Leaf,
  Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { generateFakeObjectRecord } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-object-record';
import { FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';

export const generateFakeFormResponse = async ({
  formMetadata,
  objectMetadataRepository,
}: {
  formMetadata: FormFieldMetadata[];
  objectMetadataRepository: Repository<ObjectMetadataEntity>;
}): Promise<Record<string, Leaf | Node>> => {
  const result = await Promise.all(
    formMetadata.map(async (formFieldMetadata) => {
      if (formFieldMetadata.type === 'RECORD') {
        if (!formFieldMetadata?.settings?.objectName) {
          return undefined;
        }

        const objectMetadata = await objectMetadataRepository.findOneOrFail({
          where: {
            nameSingular: formFieldMetadata?.settings?.objectName,
          },
        });

        return {
          [formFieldMetadata.name]: {
            isLeaf: false,
            label: formFieldMetadata.label,
            value: generateFakeObjectRecord(objectMetadata),
          },
        };
      } else {
        return {
          [formFieldMetadata.name]: generateFakeField({
            type: formFieldMetadata.type,
            label: formFieldMetadata.label,
          }),
        };
      }
    }),
  );

  return result.filter(isDefined).reduce((acc, curr) => {
    return { ...acc, ...curr };
  }, {});
};
