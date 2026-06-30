import { isObject } from '@sniptt/guards';

import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';

export const collectOutputSchemaPaths = (
  schema: BaseOutputSchemaV2,
  prefix: string[] = [],
): string[] => {
  const paths: string[] = [];

  if (!isObject(schema)) {
    return paths;
  }

  for (const [key, field] of Object.entries(schema)) {
    if (!isObject(field)) {
      continue;
    }

    const currentPath = [...prefix, key];

    paths.push(currentPath.join('.'));

    if (!field.isLeaf && isObject(field.value)) {
      paths.push(...collectOutputSchemaPaths(field.value, currentPath));
    }
  }

  return paths;
};
