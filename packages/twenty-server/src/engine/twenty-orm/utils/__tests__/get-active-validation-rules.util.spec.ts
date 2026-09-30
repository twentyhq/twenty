import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatValidationRuleMaps } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { getActiveValidationRules } from 'src/engine/twenty-orm/utils/get-active-validation-rules.util';

const RULE: FlatValidationRule = {
  id: 'rule-id',
  universalIdentifier: 'rule-universal-identifier',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  objectMetadataId: 'company-id',
  objectMetadataUniversalIdentifier: 'company-universal-identifier',
  errorFieldMetadataId: null,
  errorFieldMetadataUniversalIdentifier: null,
  name: 'Minimum employees',
  description: null,
  icon: null,
  expression: 'employees >= 10',
  bindings: { employees: 'employees-universal-identifier' },
  message: 'At least ten employees are required',
  isActive: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('getActiveValidationRules', () => {
  it('should isolate objects and omit disabled rules', () => {
    const flatValidationRuleMaps: FlatValidationRuleMaps =
      createEmptyFlatEntityMaps();

    flatValidationRuleMaps.byUniversalIdentifier = {
      active: RULE,
      disabled: { ...RULE, id: 'disabled-rule', isActive: false },
      other: { ...RULE, id: 'other-rule', objectMetadataId: 'person-id' },
    };

    expect(
      getActiveValidationRules({
        flatValidationRuleMaps,
        objectMetadataId: 'company-id',
      }),
    ).toEqual([RULE]);
    expect(
      getActiveValidationRules({
        flatValidationRuleMaps,
        objectMetadataId: 'opportunity-id',
      }),
    ).toEqual([]);
    expect(
      getActiveValidationRules({ objectMetadataId: 'company-id' }),
    ).toEqual([]);
  });

  it('should observe rule deactivation after the metadata cache is replaced', () => {
    const previousMaps: FlatValidationRuleMaps = createEmptyFlatEntityMaps();
    previousMaps.byUniversalIdentifier = { rule: RULE };

    expect(
      getActiveValidationRules({
        flatValidationRuleMaps: previousMaps,
        objectMetadataId: 'company-id',
      }),
    ).toEqual([RULE]);

    const refreshedMaps = {
      ...previousMaps,
      byUniversalIdentifier: { rule: { ...RULE, isActive: false } },
    };

    expect(
      getActiveValidationRules({
        flatValidationRuleMaps: refreshedMaps,
        objectMetadataId: 'company-id',
      }),
    ).toEqual([]);
  });
});
