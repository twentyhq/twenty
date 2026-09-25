import { isMetadataWritePermitted } from 'src/engine/twenty-orm/utils/is-metadata-write-permitted.util';
import { isDefined } from 'twenty-shared/utils';

import { buildRecordShareGate } from 'src/engine/core-modules/record-share/utils/build-record-share-gate.util';
import {
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/twenty-orm/utils/combine-sql-conditions.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

export const buildRowAccessPolicy = ({
  subject,
  environment,
  ...target
}: RowAccessPolicyContext & RowAccessPolicyTarget): RowAccessPolicy => {
  if (subject.isSystemContext) {
    return { kind: 'open' };
  }

  const context = { subject, environment };
  // Inherited write access must respect the parent's writability as well as
  // its grants; otherwise a child can become writable through a SYSTEM parent.
  if (
    target.operationType !== 'select' &&
    !isMetadataWritePermitted({
      writability: target.flatObjectMetadata.writability,
      isSystemContext: false,
      isOwningApplication: subject.isOwningApplication(
        target.flatObjectMetadata,
      ),
    })
  ) {
    return { kind: 'denied' };
  }

  if (
    isDefined(subject.objectsPermissions) &&
    !isObjectOperationPermitted({
      objectMetadata: target.flatObjectMetadata,
      operationType: target.operationType,
      objectsPermissions: subject.objectsPermissions,
    })
  ) {
    return { kind: 'denied' };
  }

  const recordShareGate = buildRecordShareGate({
    context,
    target,
    buildParentPolicy: (parentTarget) =>
      buildRowAccessPolicy({ ...context, ...parentTarget }),
  });

  if (recordShareGate.kind === 'denied') {
    return { kind: 'denied' };
  }

  const conditions = [
    buildRolePredicate(context, target),
    recordShareGate.kind === 'gated' ? recordShareGate.condition : undefined,
  ].filter(isDefined);

  if (conditions.length === 0) {
    return { kind: 'open' };
  }

  return { kind: 'gated', condition: combineSqlConditions(conditions) };
};

const buildRolePredicate = (
  { subject, environment }: RowAccessPolicyContext,
  { tableAlias, flatObjectMetadata }: RowAccessPolicyTarget,
): SqlCondition | undefined => {
  const recordFilter =
    subject.resolveRowLevelPermissionRecordFilter(flatObjectMetadata);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  return (
    renderRowLevelPermissionFilterToSql({
      recordFilter,
      tableAlias,
      objectMetadata: flatObjectMetadata,
      flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    }) ?? undefined
  );
};
