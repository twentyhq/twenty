import {
  MetadataReadability,
  type ObjectsPermissions,
  type RecordGqlOperationFilter,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { MAX_INHERITED_READABILITY_DEPTH } from 'src/engine/twenty-orm/constants/max-inherited-readability-depth.constant';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/twenty-orm/repository/resolve-required-record-share-access-levels.util';
import { type WorkspaceRelationShape } from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { type InheritedReadabilityParent } from 'src/engine/twenty-orm/types/inherited-readability-parent.type';
import {
  type RowAccessPolicy,
  type SqlCondition,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/twenty-orm/utils/combine-sql-conditions.util';
import {
  buildInheritedReadabilityCondition,
  type InheritedReadabilityParentCondition,
} from 'src/engine/twenty-orm/utils/build-inherited-readability-condition.util';
import { buildRecordShareCondition } from 'src/engine/twenty-orm/utils/build-record-share-condition.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { resolveInheritedReadabilityParents } from 'src/engine/twenty-orm/utils/resolve-inherited-readability-parents.util';

export type RowAccessPolicySubject = {
  objectsPermissions: ObjectsPermissions | undefined;
  principalIds: string[] | undefined;
  isOwningApplication: (objectMetadata: FlatObjectMetadata) => boolean;
  resolveRowLevelPermissionRecordFilter: (
    objectMetadata: FlatObjectMetadata,
  ) => RecordGqlOperationFilter | null;
};

export type RowAccessPolicyEnvironment = {
  isRecordSharingEnabled: boolean;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  recordShareTableExpression: string;
  resolveTableExpression: (objectMetadataId: string) => string;
};

type RowAccessPolicyContext = {
  subject: RowAccessPolicySubject;
  environment: RowAccessPolicyEnvironment;
};

type RowAccessPolicyTarget = {
  tableAlias: string;
  flatObjectMetadata: FlatObjectMetadata;
  operationType: OperationType;
  depth: number;
  joinParentRelationShape?: WorkspaceRelationShape;
};

export const buildRowAccessPolicy = ({
  subject,
  environment,
  ...target
}: RowAccessPolicyContext & RowAccessPolicyTarget): RowAccessPolicy => {
  const context = { subject, environment };

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

  const recordShareGate = buildRecordShareGate(context, target);

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

const buildRecordShareGate = (
  context: RowAccessPolicyContext,
  target: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const { isRecordSharingEnabled } = context.environment;
  const isOwningApplication = context.subject.isOwningApplication(
    target.flatObjectMetadata,
  );

  switch (target.flatObjectMetadata.readability) {
    case MetadataReadability.OPEN:
      return { kind: 'open' };
    case MetadataReadability.INHERITED:
      if (!isRecordSharingEnabled || isOwningApplication) {
        return { kind: 'open' };
      }

      return buildInheritedReadabilityGate(context, target);
    case MetadataReadability.SYSTEM:
      return { kind: 'denied' };
    case MetadataReadability.APPLICATION:
      return isRecordSharingEnabled && !isOwningApplication
        ? { kind: 'denied' }
        : { kind: 'open' };
    case MetadataReadability.PRIVATE:
      if (!isRecordSharingEnabled || isOwningApplication) {
        return { kind: 'open' };
      }

      return buildOwnRecordShareGate(context, target);
    default:
      return assertUnreachable(target.flatObjectMetadata.readability);
  }
};

const resolveRecordSharePrincipals = (
  { subject }: RowAccessPolicyContext,
  { operationType }: RowAccessPolicyTarget,
):
  | { principalIds: string[]; accessLevels: RecordShareAccessLevel[] }
  | undefined => {
  if (!isDefined(subject.principalIds)) {
    return undefined;
  }

  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (accessLevels.length === 0) {
    return undefined;
  }

  return { principalIds: subject.principalIds, accessLevels };
};

const buildOwnRecordShareGate = (
  context: RowAccessPolicyContext,
  target: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    condition: buildRecordShareCondition({
      tableAlias: target.tableAlias,
      recordShareTableExpression:
        context.environment.recordShareTableExpression,
      objectMetadataId: target.flatObjectMetadata.id,
      ...principals,
    }),
  };
};

const buildInheritedReadabilityGate = (
  context: RowAccessPolicyContext,
  target: RowAccessPolicyTarget,
): RowAccessPolicy => {
  const { tableAlias, flatObjectMetadata, depth, joinParentRelationShape } =
    target;

  if (depth > MAX_INHERITED_READABILITY_DEPTH) {
    return { kind: 'denied' };
  }

  const parents = resolveInheritedReadabilityParents({
    flatObjectMetadata,
    flatFieldMetadataMaps: context.environment.flatFieldMetadataMaps,
    flatObjectMetadataMaps: context.environment.flatObjectMetadataMaps,
  });

  if (
    isDefined(joinParentRelationShape) &&
    parents.some(
      (parent) =>
        parent.kind === 'column' &&
        parent.fieldMetadataId ===
          joinParentRelationShape.targetFieldMetadataId,
    )
  ) {
    return { kind: 'open' };
  }

  if (parents.length === 0) {
    return buildOwnRecordShareGate(context, target);
  }

  const principals = resolveRecordSharePrincipals(context, target);

  if (!isDefined(principals)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    condition: buildInheritedReadabilityCondition({
      tableAlias,
      objectMetadataId: flatObjectMetadata.id,
      parents: parents.map((parent) =>
        buildInheritedReadabilityParentCondition(context, target, parent),
      ),
      recordShareTableExpression:
        context.environment.recordShareTableExpression,
      ...principals,
    }),
  };
};

const buildInheritedReadabilityParentCondition = (
  context: RowAccessPolicyContext,
  { tableAlias, operationType, depth }: RowAccessPolicyTarget,
  parent: InheritedReadabilityParent,
): InheritedReadabilityParentCondition => {
  if (parent.kind === 'column') {
    const parentTableAlias = `${tableAlias}_${parent.joinColumnName}`;

    return {
      kind: 'column',
      joinColumnName: parent.joinColumnName,
      parentTableAlias,
      parentTableExpression: context.environment.resolveTableExpression(
        parent.parentFlatObjectMetadata.id,
      ),
      policy: buildRowAccessPolicy({
        ...context,
        tableAlias: parentTableAlias,
        flatObjectMetadata: parent.parentFlatObjectMetadata,
        operationType,
        depth: depth + 1,
      }),
    };
  }

  const childTableAlias = `${tableAlias}_${parent.childFlatObjectMetadata.nameSingular}`;

  return {
    kind: 'children',
    childTableAlias,
    childTableExpression: context.environment.resolveTableExpression(
      parent.childFlatObjectMetadata.id,
    ),
    childJoinColumnName: parent.childJoinColumnName,
    policy: buildRowAccessPolicy({
      ...context,
      tableAlias: childTableAlias,
      flatObjectMetadata: parent.childFlatObjectMetadata,
      operationType,
      depth: depth + 1,
    }),
  };
};
