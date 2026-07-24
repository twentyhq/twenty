import { FieldMetadataType, type ObjectRecord } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/twenty-orm/utils/is-record-matching-rls-row-level-permission-predicate.util';

const objectMetadataId = 'test-object-id';

const buildFlatFieldMetadataMaps = (
  fields: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: fields.reduce(
    (accumulator, field) => {
      accumulator[field.universalIdentifier] = field;

      return accumulator;
    },
    {} as Record<string, FlatFieldMetadata>,
  ),
  universalIdentifierById: fields.reduce(
    (accumulator, field) => {
      accumulator[field.id] = field.universalIdentifier;

      return accumulator;
    },
    {} as Record<string, string>,
  ),
  universalIdentifiersByApplicationId: {},
});

const fieldMetadata = [
  getFlatFieldMetadataMock({
    id: 'job-title-id',
    universalIdentifier: 'job-title-id',
    objectMetadataId,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
    label: 'jobTitle',
  }),
  getFlatFieldMetadataMock({
    id: 'name-id',
    universalIdentifier: 'name-id',
    objectMetadataId,
    type: FieldMetadataType.FULL_NAME,
    name: 'name',
    label: 'name',
  }),
  getFlatFieldMetadataMock({
    id: 'address-id',
    universalIdentifier: 'address-id',
    objectMetadataId,
    type: FieldMetadataType.ADDRESS,
    name: 'address',
    label: 'address',
  }),
  getFlatFieldMetadataMock({
    id: 'company-id',
    universalIdentifier: 'company-id',
    objectMetadataId,
    type: FieldMetadataType.RELATION,
    name: 'company',
    label: 'company',
    settings: {
      joinColumnName: 'companyId',
    },
  }),
  getFlatFieldMetadataMock({
    id: 'phones-id',
    universalIdentifier: 'phones-id',
    objectMetadataId,
    type: FieldMetadataType.PHONES,
    name: 'phones',
    label: 'phones',
  }),
];

export const flatObjectMetadata: FlatObjectMetadata = getFlatObjectMetadataMock({
  id: objectMetadataId,
  universalIdentifier: objectMetadataId,
  fieldIds: fieldMetadata.map((field) => field.id),
  fieldUniversalIdentifiers: fieldMetadata.map(
    (field) => field.universalIdentifier,
  ),
});

export const flatFieldMetadataMaps =
  buildFlatFieldMetadataMaps(fieldMetadata);

export const baseRecord: ObjectRecord = {
  jobTitle: 'Engineer',
  name: {
    firstName: 'Jane',
    lastName: 'Doe',
  },
  address: {
    addressStreet1: 'Main Street',
    addressCity: 'Paris',
  },
  companyId: 'company-1',
  deletedAt: null,
  id: 'record-1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} as ObjectRecord;

export const recordWithPhones: ObjectRecord = {
  ...baseRecord,
  phones: {
    primaryPhoneNumber: '555123456',
    primaryPhoneCallingCode: '+1',
    additionalPhones: [],
  },
} as ObjectRecord;

export const matchRLSRowLevelPermissionPredicate = ({
  record = baseRecord,
  filter,
}: {
  record?: ObjectRecord;
  filter: Record<string, unknown>;
}) =>
  isRecordMatchingRLSRowLevelPermissionPredicate({
    record,
    filter,
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });
