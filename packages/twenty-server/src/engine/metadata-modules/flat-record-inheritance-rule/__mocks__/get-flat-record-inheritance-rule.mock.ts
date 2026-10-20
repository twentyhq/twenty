/* @license Enterprise */

import { type FlatRecordInheritanceRule } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule.type';
import { type FlatRecordInheritanceRuleMaps } from 'src/engine/metadata-modules/flat-record-inheritance-rule/types/flat-record-inheritance-rule-maps.type';

export const getFlatRecordInheritanceRuleMock = (
  overrides: Pick<
    FlatRecordInheritanceRule,
    'id' | 'objectMetadataId' | 'parentObjectMetadataId' | 'fieldMetadataId'
  > &
    Partial<FlatRecordInheritanceRule>,
): FlatRecordInheritanceRule => ({
  universalIdentifier: overrides.id,
  workspaceId: 'workspace-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  objectMetadataUniversalIdentifier: `${overrides.objectMetadataId}-universal-identifier`,
  parentObjectMetadataUniversalIdentifier: `${overrides.parentObjectMetadataId}-universal-identifier`,
  fieldMetadataUniversalIdentifier: `${overrides.fieldMetadataId}-universal-identifier`,
  junctionFieldMetadataId: null,
  junctionFieldMetadataUniversalIdentifier: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

export const getFlatRecordInheritanceRuleMapsMock = (
  flatRecordInheritanceRules: FlatRecordInheritanceRule[],
): FlatRecordInheritanceRuleMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    flatRecordInheritanceRules.map((rule) => [rule.universalIdentifier, rule]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatRecordInheritanceRules.map((rule) => [
      rule.id,
      rule.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});
