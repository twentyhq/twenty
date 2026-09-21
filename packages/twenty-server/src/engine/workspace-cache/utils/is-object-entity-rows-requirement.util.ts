import {
  type ObjectEntityRowsRequirement,
  type WidenedEntityRowsRequirement,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

export const isObjectEntityRowsRequirement = (
  entityRowsRequirement: WidenedEntityRowsRequirement,
): entityRowsRequirement is ObjectEntityRowsRequirement =>
  entityRowsRequirement !== true && !Array.isArray(entityRowsRequirement);
