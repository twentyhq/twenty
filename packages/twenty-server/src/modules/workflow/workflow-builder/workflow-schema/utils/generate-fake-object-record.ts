import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  Leaf,
  Node,
  RecordOutputSchema,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { generateFakeField } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/generate-fake-field';
import { shouldGenerateFieldFakeValue } from 'src/modules/workflow/workflow-builder/workflow-schema/utils/should-generate-field-fake-value';

const MAXIMUM_DEPTH = 1;

const generateObjectRecordFields = ({
  objectMetadataEntity,
  depth = 0,
}: {
  objectMetadataEntity: ObjectMetadataEntity;
  depth?: number;
}) =>
  objectMetadataEntity.fields.reduce(
    (acc: Record<string, Leaf | Node>, field) => {
      if (!shouldGenerateFieldFakeValue(field)) {
        return acc;
      }

      if (field.type !== FieldMetadataType.RELATION) {
        acc[field.name] = generateFakeField({
          type: field.type,
          label: field.label,
          icon: field.icon,
        });

        return acc;
      }

      if (
        depth < MAXIMUM_DEPTH &&
        isDefined(field.relationTargetObjectMetadata)
      ) {
        acc[field.name] = {
          isLeaf: false,
          icon: field.icon,
          label: field.label,
          value: generateObjectRecordFields({
            objectMetadataEntity: field.relationTargetObjectMetadata,
            depth: depth + 1,
          }),
        };
      }

      return acc;
    },
    {},
  );

export const generateFakeObjectRecord = (
  objectMetadataEntity: ObjectMetadataEntity,
): RecordOutputSchema => ({
  object: {
    isLeaf: true,
    icon: objectMetadataEntity.icon,
    label: objectMetadataEntity.labelSingular,
    value: objectMetadataEntity.description,
    nameSingular: objectMetadataEntity.nameSingular,
    fieldIdName: 'id',
  },
  fields: generateObjectRecordFields({ objectMetadataEntity }),
  _outputSchemaType: 'RECORD',
});
