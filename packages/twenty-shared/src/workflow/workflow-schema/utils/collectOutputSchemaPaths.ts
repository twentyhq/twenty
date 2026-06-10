import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';

export const collectOutputSchemaPaths = (
  schema: BaseOutputSchemaV2,
  prefix: string[] = [],
): string[] => {
  const paths: string[] = [];

  for (const [key, field] of Object.entries(schema)) {
    const currentPath = [...prefix, key];

    paths.push(currentPath.join('.'));

    if (!field.isLeaf) {
      paths.push(...collectOutputSchemaPaths(field.value, currentPath));
    }
  }

  return paths;
};
