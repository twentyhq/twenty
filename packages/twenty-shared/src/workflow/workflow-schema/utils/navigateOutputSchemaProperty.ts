import { isDefined } from '@/utils';
import {
  type BaseOutputSchemaV2,
  type Leaf,
  type Node,
} from '@/workflow/workflow-schema/types/base-output-schema.type';

export const navigateOutputSchemaProperty = ({
  schema,
  propertyPath,
}: {
  schema: BaseOutputSchemaV2;
  propertyPath: string[];
}): Leaf | Node | undefined => {
  if (propertyPath.length === 0) {
    return undefined;
  }

  let currentSchema: BaseOutputSchemaV2 = schema;
  let currentField: Leaf | Node | undefined;

  for (const pathSegment of propertyPath) {
    currentField = currentSchema[pathSegment];

    if (!isDefined(currentField)) {
      return undefined;
    }

    if (currentField.isLeaf) {
      const isLastSegment =
        pathSegment === propertyPath[propertyPath.length - 1];
      return isLastSegment ? currentField : undefined;
    }

    currentSchema = currentField.value;
  }

  return currentField;
};
