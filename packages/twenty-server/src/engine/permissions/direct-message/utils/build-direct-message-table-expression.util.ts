import { doNotTranslate } from 'twenty-shared/i18n';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildDirectMessageTableExpression = ({
  workspaceId,
  flatObjectMetadata,
}: {
  workspaceId: string;
  flatObjectMetadata: FlatObjectMetadata;
}): string =>
  doNotTranslate(
    `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(flatObjectMetadata))}`,
  );
