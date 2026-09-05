import {
  isDefined,
  trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties,
} from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { resolveSharingRuleGranteeRoleUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-sharing-rule/utils/resolve-sharing-rule-grantee-role-universal-identifier-or-throw.util';
import { type CreateSharingRuleInput } from 'src/engine/metadata-modules/sharing-rule/dtos/create-sharing-rule.input';
import {
  SharingRuleException,
  SharingRuleExceptionCode,
} from 'src/engine/metadata-modules/sharing-rule/exceptions/sharing-rule.exception';

export const fromCreateSharingRuleInputToFlatSharingRuleOrThrow = ({
  createSharingRuleInput,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
  flatRoleMaps,
}: {
  createSharingRuleInput: CreateSharingRuleInput;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatRoleMaps'
>): FlatSharingRule => {
  const { name } = trimAndRemoveDuplicatedWhitespacesFromObjectStringProperties(
    createSharingRuleInput,
    ['name'],
  );

  const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: createSharingRuleInput.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new SharingRuleException(
      'Object metadata not found',
      SharingRuleExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  const granteeRoleId = createSharingRuleInput.granteeRoleId ?? null;
  const now = new Date().toISOString();
  const id = v4();

  return {
    id,
    universalIdentifier: v4(),
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    objectMetadataId: flatObjectMetadata.id,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    name,
    description: createSharingRuleInput.description ?? null,
    granteePrincipalType: createSharingRuleInput.granteePrincipalType,
    granteePrincipalId: createSharingRuleInput.granteePrincipalId ?? null,
    granteeRoleId,
    granteeRoleUniversalIdentifier:
      resolveSharingRuleGranteeRoleUniversalIdentifierOrThrow({
        granteeRoleId,
        flatRoleMaps,
      }),
    accessLevel: createSharingRuleInput.accessLevel,
    isActive: createSharingRuleInput.isActive ?? true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    rowLevelPermissionPredicateIds: [],
    rowLevelPermissionPredicateUniversalIdentifiers: [],
    rowLevelPermissionPredicateGroupIds: [],
    rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  };
};
