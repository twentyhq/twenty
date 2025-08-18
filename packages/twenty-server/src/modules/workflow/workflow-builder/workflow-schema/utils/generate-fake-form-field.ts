import { type FieldMetadataType } from 'twenty-shared/types';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import {
  type Leaf,
  type Node,
} from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';
import { camelToTitleCase } from 'src/utils/camel-to-title-case';

type GenerateFakeFormFieldArgs = {
  type: FieldMetadataType;
  label: string;
  value: string;
};

export const generateFakeFormField = ({
  type,
  label,
  value,
}: GenerateFakeFormFieldArgs): Leaf | Node => {
  const compositeType = compositeTypeDefinitions.get(type);

  if (compositeType) {
    return {
      isLeaf: false,
      type: type,
      label: label,
      value: compositeType.properties.reduce((acc, property) => {
        // @ts-expect-error legacy noImplicitAny
        acc[property.name] = {
          isLeaf: true,
          type: property.type,
          label: camelToTitleCase(property.name),
          value,
        };

        return acc;
      }, {}),
    };
  }

  return {
    isLeaf: true,
    type: type,
    label: label,
    value,
  };
};
