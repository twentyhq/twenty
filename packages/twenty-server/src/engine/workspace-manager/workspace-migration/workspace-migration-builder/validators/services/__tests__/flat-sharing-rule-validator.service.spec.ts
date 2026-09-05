import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';

import { FlatSharingRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-sharing-rule-validator.service';

const APPLICATION_UNIVERSAL_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const RULE_UNIVERSAL_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const OBJECT_UNIVERSAL_IDENTIFIER = '33333333-3333-4333-8333-333333333333';
const ROLE_UNIVERSAL_IDENTIFIER = '44444444-4444-4444-8444-444444444444';
const MISSING_UNIVERSAL_IDENTIFIER = '55555555-5555-4555-8555-555555555555';
const WORKSPACE_MEMBER_ID = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-09-04T00:00:00.000Z';

const buildMaps = (universalIdentifiers: string[]) => ({
  byUniversalIdentifier: Object.fromEntries(
    universalIdentifiers.map((universalIdentifier) => [
      universalIdentifier,
      { universalIdentifier },
    ]),
  ),
});

const buildCreationArgs = (
  overrides: Partial<{
    name: string;
    objectMetadataUniversalIdentifier: string;
    granteePrincipalType: RecordSharePrincipalType;
    granteeRoleUniversalIdentifier: string | null;
    granteePrincipalId: string | null;
    accessLevel: RecordShareAccessLevel;
  }> = {},
) =>
  ({
    flatEntityToValidate: {
      universalIdentifier: RULE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
      name: 'Sales reads deals',
      description: null,
      granteePrincipalType: RecordSharePrincipalType.EVERYONE,
      granteeRoleUniversalIdentifier: null,
      granteePrincipalId: null,
      accessLevel: RecordShareAccessLevel.READ,
      isActive: true,
      rowLevelPermissionPredicateUniversalIdentifiers: [],
      rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
      ...overrides,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatSharingRuleMaps: buildMaps([]),
      flatObjectMetadataMaps: buildMaps([OBJECT_UNIVERSAL_IDENTIFIER]),
      flatRoleMaps: buildMaps([ROLE_UNIVERSAL_IDENTIFIER]),
    },
  }) as unknown as Parameters<
    FlatSharingRuleValidatorService['validateFlatSharingRuleCreation']
  >[0];

describe('FlatSharingRuleValidatorService', () => {
  const service = new FlatSharingRuleValidatorService();

  it('accepts a rule granting everyone read access', () => {
    expect(
      service.validateFlatSharingRuleCreation(buildCreationArgs()).errors,
    ).toEqual([]);
  });

  it('accepts a rule granting an existing role', () => {
    expect(
      service.validateFlatSharingRuleCreation(
        buildCreationArgs({
          granteePrincipalType: RecordSharePrincipalType.ROLE,
          granteeRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
          accessLevel: RecordShareAccessLevel.READ_WRITE,
        }),
      ).errors,
    ).toEqual([]);
  });

  it.each([
    ['an empty name', { name: '' }, 'Sharing rule name is required'],
    [
      'an unknown object',
      { objectMetadataUniversalIdentifier: MISSING_UNIVERSAL_IDENTIFIER },
      'Sharing rule references an object that does not exist',
    ],
    [
      'the FULL access level',
      { accessLevel: RecordShareAccessLevel.FULL },
      'Sharing rule access level must be READ or READ_WRITE',
    ],
    [
      'a grantee on an everyone rule',
      { granteePrincipalId: WORKSPACE_MEMBER_ID },
      'A sharing rule granting everyone must not name a grantee',
    ],
    [
      'a workspace member rule without a member',
      { granteePrincipalType: RecordSharePrincipalType.WORKSPACE_MEMBER },
      'A sharing rule granting a workspace member must name that member and no role',
    ],
    [
      'a role rule without a role',
      { granteePrincipalType: RecordSharePrincipalType.ROLE },
      'A sharing rule granting a role must name that role and no workspace member',
    ],
    [
      'a role rule naming a member too',
      {
        granteePrincipalType: RecordSharePrincipalType.ROLE,
        granteeRoleUniversalIdentifier: ROLE_UNIVERSAL_IDENTIFIER,
        granteePrincipalId: WORKSPACE_MEMBER_ID,
      },
      'A sharing rule granting a role must name that role and no workspace member',
    ],
    [
      'a role rule naming an unknown role',
      {
        granteePrincipalType: RecordSharePrincipalType.ROLE,
        granteeRoleUniversalIdentifier: MISSING_UNIVERSAL_IDENTIFIER,
      },
      'Sharing rule references a role that does not exist',
    ],
  ])('refuses %s', (_label, overrides, message) => {
    const result = service.validateFlatSharingRuleCreation(
      buildCreationArgs(overrides),
    );

    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ message })]),
    );
  });

  it('refuses deleting a rule that does not exist', () => {
    const result = service.validateFlatSharingRuleDeletion(buildCreationArgs());

    expect(result.errors).toEqual([
      expect.objectContaining({ message: 'Sharing rule not found' }),
    ]);
  });
});
