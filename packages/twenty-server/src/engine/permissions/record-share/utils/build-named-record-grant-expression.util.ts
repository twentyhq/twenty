/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { buildPrivateRecordCreatorExpression } from 'src/engine/permissions/private-record/utils/build-private-record-creator-expression.util';
import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import { resolveNamedPrincipalIds } from 'src/engine/permissions/principal/utils/resolve-named-principal-ids.util';
import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';
import {
  type RowAccessExpression,
  type RowAccessPolicyContext,
  type RowAccessPolicyTarget,
} from 'src/engine/permissions/combine/types/row-access-policy.type';

type NamedRecordGrantContext = Pick<
  RowAccessPolicyContext,
  'subject' | 'environment'
> &
  Pick<
    RowAccessPolicyTarget,
    'tableAlias' | 'flatObjectMetadata' | 'operationType'
  >;

const buildNamedRecordShareGrant = ({
  subject,
  tableAlias,
  flatObjectMetadata,
  accessLevels,
}: Pick<
  NamedRecordGrantContext,
  'subject' | 'tableAlias' | 'flatObjectMetadata'
> & {
  accessLevels: RecordShareAccessLevel[];
}): RowAccessExpression | undefined => {
  const principalIds = resolveNamedPrincipalIds(subject);

  if (!isNonEmptyArray(principalIds)) {
    return undefined;
  }

  return {
    kind: 'recordShared',
    isUncorrelated: true,
    tableAlias,
    objectMetadataId: flatObjectMetadata.id,
    principalIds,
    accessLevels,
  };
};

const buildPrivateRecordCreatorGrant = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
}: Omit<NamedRecordGrantContext, 'operationType'>):
  | RowAccessExpression
  | undefined => {
  const { isShareRequired } = resolveObjectSharing({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
  });

  if (isShareRequired || !isPrivateRecordEnabled(environment.featureFlagsMap)) {
    return undefined;
  }

  const creator = buildPrivateRecordCreatorExpression({
    workspaceMemberId: subject.workspaceMemberId,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
    tableAlias,
    flatObjectMetadata,
  });

  if (!isDefined(creator)) {
    return undefined;
  }

  return {
    kind: 'and',
    operands: [
      {
        kind: 'recordPrivacy',
        isPrivate: true,
        tableAlias,
        objectMetadataId: flatObjectMetadata.id,
      },
      creator,
    ],
  };
};

export const buildNamedRecordGrantExpression = ({
  subject,
  environment,
  tableAlias,
  flatObjectMetadata,
  operationType,
}: NamedRecordGrantContext): RowAccessExpression | undefined => {
  const accessLevels = resolveRequiredRecordShareAccessLevels(operationType);

  if (!isNonEmptyArray(accessLevels)) {
    return undefined;
  }

  const operands = [
    buildNamedRecordShareGrant({
      subject,
      tableAlias,
      flatObjectMetadata,
      accessLevels,
    }),
    buildPrivateRecordCreatorGrant({
      subject,
      environment,
      tableAlias,
      flatObjectMetadata,
    }),
  ].filter(isDefined);

  if (operands.length <= 1) {
    return operands[0];
  }

  return { kind: 'or', operands };
};
