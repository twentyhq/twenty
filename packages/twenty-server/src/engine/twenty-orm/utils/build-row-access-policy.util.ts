import { isMetadataWritePermitted } from 'src/engine/twenty-orm/utils/is-metadata-write-permitted.util';
import { isDefined } from 'twenty-shared/utils';

import { buildNamedRecordGrantExpression } from 'src/engine/core-modules/record-share/utils/build-named-record-grant-expression.util';
import { buildRecordShareGate } from 'src/engine/core-modules/record-share/utils/build-record-share-gate.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import {
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
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

  const namedRecordGrant = resolveObjectSharing({
    flatObjectMetadata: target.flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  }).operationTypesGrantedBeyondRole.includes(target.operationType)
    ? buildNamedRecordGrantExpression(context, target)
    : undefined;

  if (
    isDefined(subject.objectsPermissions) &&
    !isObjectOperationPermitted({
      objectMetadata: target.flatObjectMetadata,
      operationType: target.operationType,
      objectsPermissions: subject.objectsPermissions,
    })
  ) {
    return isDefined(namedRecordGrant)
      ? { kind: 'gated', expression: namedRecordGrant }
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

  const roleFilter = buildRoleFilterExpression(context, target);
  const operands = [
    roleFilter,
    recordShareGate.kind === 'gated' ? recordShareGate.expression : undefined,
  ].filter(isDefined);

  if (operands.length === 0) {
    return { kind: 'open' };
  }

  // The share gate already admits named grants, so only a role filter keeps
  // one out and needs the grant as an alternative
  if (isDefined(roleFilter) && isDefined(namedRecordGrant)) {
    return {
      kind: 'gated',
      expression: {
        kind: 'or',
        operands: [{ kind: 'and', operands }, namedRecordGrant],
      },
    };
  }

  return { kind: 'gated', expression: { kind: 'and', operands } };
};

const buildRoleFilterExpression = (
  { subject, environment }: RowAccessPolicyContext,
  { tableAlias, flatObjectMetadata }: RowAccessPolicyTarget,
): RowAccessExpression | undefined => {
  const recordFilter =
    subject.resolveRowLevelPermissionRecordFilter(flatObjectMetadata);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  const condition = renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
  });

  // A filter whose predicates all cancel out restricts nothing
  if (condition === null) {
    return undefined;
  }

  return {
    kind: 'roleFilter',
    tableAlias,
    flatObjectMetadata,
    recordFilter,
    condition,
  };
};
