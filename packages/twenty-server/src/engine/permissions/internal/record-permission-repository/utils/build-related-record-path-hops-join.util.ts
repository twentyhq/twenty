/* @license Enterprise */

import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';
import { type RelatedRecordPathHop } from 'src/engine/permissions/internal/related-record-path/types/resolved-related-record-path.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRelatedRecordPathHopsJoin = ({
  workspaceId,
  hops,
  hopTableAliases,
  targetTableAlias,
}: {
  workspaceId: string;
  hops: RelatedRecordPathHop[];
  hopTableAliases: string[];
  targetTableAlias: string;
}): { fromExpressions: string[]; joinConditions: string[] } => {
  const nextTableAliases = [...hopTableAliases.slice(1), targetTableAlias];

  return {
    fromExpressions: hops.map(
      (hop, hopIndex) =>
        `${buildWorkspaceTableExpression({
          workspaceId,
          tableName: computeObjectTargetTable(hop.flatObjectMetadata),
        })} AS ${escapeIdentifier(hopTableAliases[hopIndex])}`,
    ),
    joinConditions: hops.map(
      (hop, hopIndex) =>
        `${escapeIdentifier(nextTableAliases[hopIndex])}.${escapeIdentifier(hop.targetColumnName)} = ${escapeIdentifier(hopTableAliases[hopIndex])}.${escapeIdentifier(hop.sourceColumnName)}`,
    ),
  };
};
