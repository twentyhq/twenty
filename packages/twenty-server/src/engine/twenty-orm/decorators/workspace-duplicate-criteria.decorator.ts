import { type WorkspaceEntityDuplicateCriteria } from 'src/engine/api/graphql/workspace-query-builder/types/workspace-entity-duplicate-criteria.type';
import { TypedReflect } from 'src/utils/typed-reflect';

export function WorkspaceDuplicateCriteria(
  duplicateCriteria: WorkspaceEntityDuplicateCriteria[],
): ClassDecorator {
  return (target) => {
    TypedReflect.defineMetadata(
      'workspace:duplicate-criteria-metadata-args',
      duplicateCriteria,
      target,
    );
  };
}
