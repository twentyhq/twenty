import { isMetadataWritePermitted } from 'src/engine/twenty-orm/utils/is-metadata-write-permitted.util';
import { isDefined } from 'twenty-shared/utils';

import { buildNamedRecordGrantCondition } from 'src/engine/core-modules/record-share/utils/build-named-record-grant-condition.util';
import { buildRecordShareGate } from 'src/engine/core-modules/record-share/utils/build-record-share-gate.util';
import { isRecordGrantBeyondRoleAllowed } from 'src/engine/core-modules/record-share/utils/is-record-grant-beyond-role-allowed.util';
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
  // Inherited writes also need the parent's writability, or a child could become writable through a SYSTEM parent
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

  const namedRecordGrantCondition = isRecordGrantBeyondRoleAllowed({
    flatObjectMetadata: target.flatObjectMetadata,
    operationType: target.operationType,
    isRecordSharingEnabled: environment.isRecordSharingEnabled,
  })
    ? buildNamedRecordGrantCondition(context, target)
    : undefined;

  if (
    isDefined(subject.objectsPermissions) &&
    !isObjectOperationPermitted({
      objectMetadata: target.flatObjectMetadata,
      operationType: target.operationType,
      objectsPermissions: subject.objectsPermissions,
    })
  ) {
    return isDefined(namedRecordGrantCondition)
      ? { kind: 'gated', condition: namedRecordGrantCondition }
      : { kind: 'denied' };
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

  const rolePredicate = buildRolePredicate(context, target);
  const conditions = [
    rolePredicate,
    recordShareGate.kind === 'gated' ? recordShareGate.condition : undefined,
  ].filter(isDefined);

  if (conditions.length === 0) {
    return { kind: 'open' };
  }

  // The share gate already admits named grants, so only a role predicate
  // keeps one out and needs the grant as an alternative
  if (isDefined(rolePredicate) && isDefined(namedRecordGrantCondition)) {
    return {
      kind: 'gated',
      condition: combineSqlConditions(
        [combineSqlConditions(conditions), namedRecordGrantCondition],
        'OR',
      ),
    };
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
