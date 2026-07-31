import { Test, type TestingModule } from '@nestjs/testing';

import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

import { EmailingDomainException } from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

const field = (
  id: string,
  name: string,
  label: string,
  type: FieldMetadataType,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  universalIdentifier: `universal-${id}`,
  name,
  label,
  type,
  isSystem: false,
  isActive: true,
  ...overrides,
});

const personFields = [
  field('field-1', 'name', 'Name', FieldMetadataType.FULL_NAME),
  field('field-2', 'emails', 'Emails', FieldMetadataType.EMAILS),
  field('field-3', 'city', 'City', FieldMetadataType.TEXT),
  field('field-4', 'tier', 'Tier', FieldMetadataType.SELECT, {
    options: [
      { value: 'ENTERPRISE', label: 'Enterprise' },
      { value: 'STARTER', label: 'Starter' },
    ],
  }),
  field('field-5', 'signupDate', 'Signup date', FieldMetadataType.DATE_TIME),
  field('field-6', 'searchVector', 'Search vector', FieldMetadataType.TEXT, {
    isSystem: true,
  }),
  field('field-7', 'company', 'Company', FieldMetadataType.RELATION),
];

const buildFlatMaps = () => ({
  flatObjectMetadataMaps: {
    byUniversalIdentifier: {
      [STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person]: {
        id: 'person-object-id',
        nameSingular: 'person',
        fieldIds: personFields.map((personField) => personField.id),
      },
    },
  },
  flatFieldMetadataMaps: {
    byUniversalIdentifier: Object.fromEntries(
      personFields.map((personField) => [
        personField.universalIdentifier,
        personField,
      ]),
    ),
    universalIdentifierById: Object.fromEntries(
      personFields.map((personField) => [
        personField.id,
        personField.universalIdentifier,
      ]),
    ),
  },
});

describe('CampaignVariableService', () => {
  let service: CampaignVariableService;

  const workspaceId = 'workspace-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignVariableService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest
              .fn()
              .mockResolvedValue(buildFlatMaps()),
          },
        },
      ],
    }).compile();

    service = module.get(CampaignVariableService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should derive variables from person field metadata', async () => {
    const { definitions, knownVariableNames } =
      await service.getPersonCampaignVariables(workspaceId);

    expect(definitions.map((definition) => definition.name)).toEqual([
      'name.firstName',
      'name.lastName',
      'emails.primaryEmail',
      'city',
      'tier',
      'signupDate',
    ]);

    // Legacy aliases stay resolvable.
    expect(knownVariableNames.has('firstName')).toBe(true);
    expect(knownVariableNames.has('fullName')).toBe(true);
    expect(knownVariableNames.has('personId')).toBe(true);

    // System and relation fields are not personalization variables.
    expect(knownVariableNames.has('searchVector')).toBe(false);
    expect(knownVariableNames.has('company')).toBe(false);
  });

  it('should build values for a person, formatting by field type', async () => {
    const person = {
      id: 'person-1',
      name: { firstName: 'Ada', lastName: 'Lovelace' },
      emails: { primaryEmail: 'ada@example.com' },
      city: 'London',
      tier: 'ENTERPRISE',
      signupDate: '2026-03-04T10:30:00.000Z',
    } as unknown as PersonWorkspaceEntity;

    const variables = await service.buildVariablesForPerson(
      workspaceId,
      person,
    );

    expect(variables).toMatchObject({
      'name.firstName': 'Ada',
      'name.lastName': 'Lovelace',
      'emails.primaryEmail': 'ada@example.com',
      city: 'London',
      tier: 'Enterprise',
      signupDate: '2026-03-04',
      firstName: 'Ada',
      lastName: 'Lovelace',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      personId: 'person-1',
    });
  });

  it('should resolve every variable to an empty string without a person', async () => {
    const variables = await service.buildVariablesForPerson(workspaceId, null);

    expect(variables.city).toBe('');
    expect(variables.firstName).toBe('');
    expect(variables.fullName).toBe('');
  });

  it('should accept known variables and reject unknown ones', async () => {
    await expect(
      service.assertKnownVariables(workspaceId, ['city', 'name.firstName']),
    ).resolves.toBeUndefined();

    await expect(
      service.assertKnownVariables(workspaceId, ['city', 'firstNam']),
    ).rejects.toThrow(EmailingDomainException);

    await expect(
      service.assertKnownVariables(workspaceId, ['firstNam']),
    ).rejects.toThrow(/Unknown campaign variables: firstNam/);
  });
});
