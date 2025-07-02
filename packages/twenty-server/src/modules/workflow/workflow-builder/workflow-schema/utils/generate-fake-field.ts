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
  value,
}: {
  type: FieldMetadataType;
  label: string;
  icon?: string;
  value?: string;
}): Leaf | Node => {
  const compositeType = compositeTypeDefinitions.get(type);

  if (compositeType) {
    return {
      isLeaf: false,
      type: type,
      icon: icon,
      label: label,
      value: compositeType.properties.reduce((acc, property) => {
        // @ts-expect-error legacy noImplicitAny
        acc[property.name] = {
          isLeaf: true,
          type: property.type,
          label: camelToTitleCase(property.name),
          value: value || generateFakeValue(property.type, 'FieldMetadataType'),
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
    value: value || generateFakeValue(type, 'FieldMetadataType'),
  };
};
