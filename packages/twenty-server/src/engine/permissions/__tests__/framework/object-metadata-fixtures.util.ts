import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  OBJECT_ID,
  WORKSPACE_ID,
} from 'src/engine/permissions/__tests__/framework/permission-test-ids.constant';
import { ROLE_FILTERS } from 'src/engine/permissions/__tests__/framework/role-filters.constant';

const CREATED_BY_FIELD_ID = 'created-by-field-id';

export const FLAT_ENTITY_DEFAULTS = {
  applicationId: 'object-owner-application-id',
  applicationUniversalIdentifier: 'object-owner-application-id',
  workspaceId: WORKSPACE_ID,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

export const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  entities: TFlatEntity[],
) =>
  entities.reduce<FlatEntityMaps<TFlatEntity>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

export const FLAT_OBJECT_METADATA: FlatObjectMetadata = {
  ...getFlatObjectMetadataMock({
    id: OBJECT_ID,
    universalIdentifier: OBJECT_ID,
    nameSingular: 'thing',
    namePlural: 'things',
    fieldIds: [
      ...ROLE_FILTERS.map(({ fieldMetadataId }) => fieldMetadataId),
      CREATED_BY_FIELD_ID,
    ],
  }),
  ...FLAT_ENTITY_DEFAULTS,
  isSystem: false,
  disabledObjectPermissionActions: [],
};

const buildFieldMock = ({
  id,
  name,
  type = FieldMetadataType.TEXT,
}: {
  id: string;
  name: string;
  type?: FieldMetadataType;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: id,
    name,
    type,
    objectMetadataId: OBJECT_ID,
  });

export const FLAT_FIELD_METADATA_MAPS = buildFlatEntityMaps([
  ...ROLE_FILTERS.map(({ fieldMetadataId, fieldName }) =>
    buildFieldMock({ id: fieldMetadataId, name: fieldName }),
  ),
  buildFieldMock({
    id: CREATED_BY_FIELD_ID,
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
  }),
]);
