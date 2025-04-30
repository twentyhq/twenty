import { FieldMetadataType } from 'twenty-shared/types';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import {
  Leaf,
  Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

export const generateFakeField = ({
  type,
  label,
  icon,
}: {
  type: FieldMetadataType;
  label: string;
  icon?: string;
}): Leaf | Node => {
  const compositeType = compositeTypeDefinitions.get(type);

  if (compositeType) {
    return {
      isLeaf: false,
      icon: icon,
      label: label,
      value: compositeType.properties.reduce((acc, property) => {
        acc[property.name] = {
          isLeaf: true,
          type: property.type,
          label: camelToTitleCase(property.name),
          value: generateFakeValue(property.type, 'FieldMetadataType'),
        };

        return acc;
      }, {}),
    };
  }

  return {
    isLeaf: true,
    type: type,
    icon: icon,
    label: label,
    value: generateFakeValue(type, 'FieldMetadataType'),
  };
};
