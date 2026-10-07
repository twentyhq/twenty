import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const COMPANY_OBJECT_ID = '00000000-aaaa-4aaa-8aaa-000000000001';
export const PERSON_OBJECT_ID = '00000000-bbbb-4bbb-8bbb-000000000002';
export const WORKSPACE_MEMBER_OBJECT_ID =
  '00000000-cccc-4ccc-8ccc-000000000003';

export const COMPANY_POSITION_FIELD_ID = '11111111-0000-4000-8000-000000000000';
export const COMPANY_ID_FIELD_ID = '11111111-0000-4000-8000-00000000000a';
export const COMPANY_EXTERNAL_ID_FIELD_ID =
  '11111111-0000-4000-8000-00000000000b';
export const COMPANY_CREATED_AT_FIELD_ID =
  '11111111-1111-4111-8111-000000000001';
export const COMPANY_NAME_FIELD_ID = '11111111-2222-4222-8222-000000000002';
export const COMPANY_ACCOUNT_OWNER_FIELD_ID =
  '11111111-3333-4333-8333-000000000003';
export const COMPANY_PEOPLE_FIELD_ID = '11111111-4444-4444-8444-000000000004';
export const COMPANY_NOTES_FIELD_ID = '11111111-5555-4555-8555-000000000005';
export const PERSON_CREATED_AT_FIELD_ID =
  '11111111-6666-4666-8666-000000000006';
export const WORKSPACE_MEMBER_NAME_FIELD_ID =
  '11111111-7777-4777-8777-000000000007';
export const WORKSPACE_MEMBER_NOTES_FIELD_ID =
  '11111111-8888-4888-8888-000000000008';
export const UNKNOWN_FIELD_ID = '11111111-9999-4999-8999-000000000009';

const buildFlatEntityMaps = <
  TFlatEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  flatEntities: TFlatEntity[],
): FlatEntityMaps<TFlatEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildField = ({
  id,
  objectMetadataId,
  type,
  label,
  name,
  relationType,
  relationTargetObjectMetadataId,
}: {
  id: string;
  objectMetadataId: string;
  type: FieldMetadataType;
  label: string;
  name?: string;
  relationType?: RelationType;
  relationTargetObjectMetadataId?: string;
}): FlatFieldMetadata =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    objectMetadataId,
    type,
    label,
    ...(isDefined(name) ? { name } : {}),
    ...(relationType
      ? {
          settings: { relationType, joinColumnName: `${label}Id` },
          relationTargetObjectMetadataId,
        }
      : {}),
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

export const dashboardFilterBindingFlatFieldMetadataMaps = buildFlatEntityMaps([
  buildField({
    id: COMPANY_ID_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.UUID,
    label: 'Id',
    name: 'id',
  }),
  buildField({
    id: COMPANY_EXTERNAL_ID_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.UUID,
    label: 'External id',
    name: 'externalId',
  }),
  buildField({
    id: COMPANY_POSITION_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.NUMBER,
    label: 'Position',
  }),
  buildField({
    id: COMPANY_CREATED_AT_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.DATE_TIME,
    label: 'Created at',
  }),
  buildField({
    id: COMPANY_NAME_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.TEXT,
    label: 'Name',
  }),
  buildField({
    id: COMPANY_ACCOUNT_OWNER_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.RELATION,
    label: 'Account owner',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
  }),
  buildField({
    id: COMPANY_PEOPLE_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.RELATION,
    label: 'People',
    relationType: RelationType.ONE_TO_MANY,
    relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  }),
  buildField({
    id: COMPANY_NOTES_FIELD_ID,
    objectMetadataId: COMPANY_OBJECT_ID,
    type: FieldMetadataType.RICH_TEXT,
    label: 'Notes',
  }),
  buildField({
    id: PERSON_CREATED_AT_FIELD_ID,
    objectMetadataId: PERSON_OBJECT_ID,
    type: FieldMetadataType.DATE_TIME,
    label: 'Created at',
  }),
  buildField({
    id: WORKSPACE_MEMBER_NAME_FIELD_ID,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
  }),
  buildField({
    id: WORKSPACE_MEMBER_NOTES_FIELD_ID,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    type: FieldMetadataType.RICH_TEXT,
    label: 'Notes',
  }),
]);

export const dashboardFilterBindingFlatObjectMetadataMaps = buildFlatEntityMaps(
  [COMPANY_OBJECT_ID, PERSON_OBJECT_ID, WORKSPACE_MEMBER_OBJECT_ID].map(
    (objectMetadataId) =>
      getFlatObjectMetadataMock({
        id: objectMetadataId,
        universalIdentifier: objectMetadataId,
        isActive: true,
      }),
  ),
);
