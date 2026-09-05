import { type FlatSharingRule } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule.type';
import { type SharingRuleDTO } from 'src/engine/metadata-modules/sharing-rule/dtos/sharing-rule.dto';

export const fromFlatSharingRuleToSharingRuleDto = (
  flatSharingRule: FlatSharingRule,
): SharingRuleDTO => ({
  id: flatSharingRule.id,
  universalIdentifier: flatSharingRule.universalIdentifier,
  applicationId: flatSharingRule.applicationId,
  objectMetadataId: flatSharingRule.objectMetadataId,
  name: flatSharingRule.name,
  description: flatSharingRule.description,
  granteePrincipalType: flatSharingRule.granteePrincipalType,
  granteePrincipalId: flatSharingRule.granteePrincipalId,
  granteeRoleId: flatSharingRule.granteeRoleId,
  accessLevel: flatSharingRule.accessLevel,
  isActive: flatSharingRule.isActive,
  createdAt: new Date(flatSharingRule.createdAt),
  updatedAt: new Date(flatSharingRule.updatedAt),
});
