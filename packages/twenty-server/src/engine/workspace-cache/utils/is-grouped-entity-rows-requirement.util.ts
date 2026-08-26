import {
  type GroupedEntityRowsRequirement,
  type WidenedEntityRowsRequirement,
} from 'src/engine/workspace-cache/types/workspace-cache-rows-requirement.type';

export const isGroupedEntityRowsRequirement = (
  entityRowsRequirement: WidenedEntityRowsRequirement,
): entityRowsRequirement is GroupedEntityRowsRequirement =>
  entityRowsRequirement !== true && !Array.isArray(entityRowsRequirement);
