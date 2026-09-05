import { RecordSharePrincipalType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { fromCreateSharingRuleInputToFlatSharingRuleOrThrow } from 'src/engine/metadata-modules/flat-sharing-rule/utils/from-create-sharing-rule-input-to-flat-sharing-rule-or-throw.util';
import { type BackfillSharingRuleInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';

const EVERYONE_BACKFILL_SHARING_RULE_NAME = 'Everyone';

export const fromBackfillSharingRuleInputToFlatSharingRuleOrThrow = ({
  backfillSharingRuleInput,
  objectMetadataId,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
  flatRoleMaps,
}: {
  backfillSharingRuleInput: BackfillSharingRuleInput;
  objectMetadataId: string;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatRoleMaps'
>): FlatSharingRule => {
  const { granteePrincipalType, granteeRoleId, accessLevel, name } =
    backfillSharingRuleInput;

  const granteeFlatRole =
    granteePrincipalType === RecordSharePrincipalType.ROLE &&
    isDefined(granteeRoleId)
      ? findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: granteeRoleId,
          flatEntityMaps: flatRoleMaps,
        })
      : undefined;

  return fromCreateSharingRuleInputToFlatSharingRuleOrThrow({
    createSharingRuleInput: {
      objectMetadataId,
      name:
        name ?? granteeFlatRole?.label ?? EVERYONE_BACKFILL_SHARING_RULE_NAME,
      granteePrincipalType,
      granteeRoleId,
      accessLevel,
    },
    workspaceId,
    flatApplication,
    flatObjectMetadataMaps,
    flatRoleMaps,
  });
};
