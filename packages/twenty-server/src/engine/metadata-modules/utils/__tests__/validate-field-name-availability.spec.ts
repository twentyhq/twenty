import { FieldMetadataType } from 'twenty-shared/types';
import { type EachTestingContext } from 'twenty-shared/testing';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { validateFieldNameAvailabilityOrThrow } from 'src/engine/metadata-modules/utils/validate-field-name-availability.utils';

const FIELD_LINKS_MOCK_NAME = 'fieldLinks';
const FIELD_CURRENCY_MOCK_NAME = 'fieldCurrency';
const FIELD_ADDRESS_MOCK_NAME = 'fieldAddress';
const FIELD_ACTOR_MOCK_NAME = 'fieldActor';
const FIELD_FULL_NAME_MOCK_NAME = 'fieldFullName';

const objectMetadataId = '20202020-0000-0000-0000-000000000001';
const workspaceId = '20202020-0000-0000-0000-000000000000';

const createFlatFieldMetadata = (
  id: string,
  name: string,
  type: FieldMetadataType,
): FlatFieldMetadata => {
  return getFlatFieldMetadataMock({
    id,
    name,
    type,
    objectMetadataId,
    universalIdentifier: id,
    workspaceId,
  });
};

const fieldLinksMock = createFlatFieldMetadata(
  'fieldLinksId',
  FIELD_LINKS_MOCK_NAME,
  FieldMetadataType.LINKS,
);
const fieldCurrencyMock = createFlatFieldMetadata(
  'fieldCurrencyId',
  FIELD_CURRENCY_MOCK_NAME,
  FieldMetadataType.CURRENCY,
);
const fieldFullNameMock = createFlatFieldMetadata(
  'fieldFullNameId',
  FIELD_FULL_NAME_MOCK_NAME,
  FieldMetadataType.FULL_NAME,
);
const fieldActorMock = createFlatFieldMetadata(
  'fieldActorId',
  FIELD_ACTOR_MOCK_NAME,
  FieldMetadataType.ACTOR,
);
const fieldAddressMock = createFlatFieldMetadata(
  'fieldAddressId',
  FIELD_ADDRESS_MOCK_NAME,
  FieldMetadataType.ADDRESS,
);

const FIELDS_MOCK = [
  fieldLinksMock,
  fieldCurrencyMock,
  fieldFullNameMock,
  fieldActorMock,
  fieldAddressMock,
];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> =
  FIELDS_MOCK.reduce(
    (acc, field) => ({
      ...acc,
      byId: {
        ...acc.byId,
        [field.id]: field,
      },
    }),
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
  );

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: objectMetadataId,
  workspaceId,
  nameSingular: 'objectName',
  namePlural: 'objectNames',
  labelSingular: 'Object Name',
  labelPlural: 'Object Names',
  description: 'Object description',
  icon: 'Icon123',
  isCustom: false,
  isRemote: false,
  isActive: true,
  isSystem: false,
  isAuditLogged: true,
  isSearchable: true,
  fieldMetadataIds: FIELDS_MOCK.map((f) => f.id),
  indexMetadataIds: [],
  viewIds: [],
  universalIdentifier: objectMetadataId,
  applicationId: null,
  labelIdentifierFieldMetadataId: null,
  imageIdentifierFieldMetadataId: null,
  shortcut: null,
  isLabelSyncedWithName: true,
  standardId: null,
  standardOverrides: null,
  targetTableName: 'DEPRECATED',
  duplicateCriteria: null,
});

type ValidateFieldNameAvailabilityTestContext = EachTestingContext<{
  input: string;
  shouldNotThrow?: true;
}>;

const validateFieldNameAvailabilityTestCases: ValidateFieldNameAvailabilityTestContext[] =
  [
    {
      title: 'does not throw if name is not reserved',
      context: {
        input: 'testName',
        shouldNotThrow: true,
      },
    },
    {
      title: 'throws error with LINKS suffixes',
      context: {
        input: `${FIELD_LINKS_MOCK_NAME}PrimaryLinkLabel`,
      },
    },
    {
      title: 'throws error with CURRENCY suffixes',
      context: {
        input: `${FIELD_CURRENCY_MOCK_NAME}AmountMicros`,
      },
    },
    {
      title: 'throws error with FULL_NAME suffixes',
      context: {
        input: `${FIELD_FULL_NAME_MOCK_NAME}FirstName`,
      },
    },
    {
      title: 'throws error with ACTOR suffixes',
      context: {
        input: `${FIELD_ACTOR_MOCK_NAME}Name`,
      },
    },
    {
      title: 'throws error with ADDRESS suffixes',
      context: {
        input: `${FIELD_ADDRESS_MOCK_NAME}AddressStreet1`,
      },
    },
  ];

describe('validateFieldNameAvailabilityOrThrow', () => {
  it.each(validateFieldNameAvailabilityTestCases)(
    '$title',
    ({ context: { input, shouldNotThrow } }) => {
      if (shouldNotThrow) {
        expect(() =>
          validateFieldNameAvailabilityOrThrow({
            name: input,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          }),
        ).not.toThrow();
      } else {
        expect(() =>
          validateFieldNameAvailabilityOrThrow({
            name: input,
            flatObjectMetadata,
            flatFieldMetadataMaps,
          }),
        ).toThrowErrorMatchingSnapshot();
      }
    },
  );
});
