import { type CastRecordTypeOrmDatePropertiesToString } from 'src/engine/metadata-modules/flat-entity/types/cast-record-typeorm-date-properties-to-string.type';
import { type ExtractEntityOneToManyEntityRelationProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-one-to-many-entity-relation-properties.type';
import { type ExtractEntityRelatedEntityProperties } from 'src/engine/metadata-modules/flat-entity/types/extract-entity-related-entity-properties.type';
import { FromMetadataEntityToMetadataName } from 'src/engine/metadata-modules/flat-entity/types/from-metadata-entity-to-metadata-name.type';
import { type MetadataManyToOneJoinColumn } from 'src/engine/metadata-modules/flat-entity/types/metadata-many-to-one-join-column.type';
import { UniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/universal-flat-field-metadata.type';
import { type SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type RemoveSuffix } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/remove-suffix.type';
import { AllMetadataName } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

export type UniversalFlatEntityFrom<
  TEntity extends SyncableEntity,
  TMetadataName extends
    AllMetadataName = FromMetadataEntityToMetadataName<TEntity>,
> = Omit<
  TEntity,
  // TODO remove once also removed from FrontComponentEntity
  | '__metadataName'
  | 'applicationId'
  | 'workspaceId'
  | ExtractEntityRelatedEntityProperties<TEntity>
  | Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity>
  | keyof CastRecordTypeOrmDatePropertiesToString<TEntity>
> &
  CastRecordTypeOrmDatePropertiesToString<TEntity> & {
    [P in ExtractEntityOneToManyEntityRelationProperties<
      TEntity,
      SyncableEntity
    > &
      string as `${RemoveSuffix<P, 's'>}UniversalIdentifiers`]: string[];
  } & {
    [P in Extract<MetadataManyToOneJoinColumn<TMetadataName>, keyof TEntity> &
      string as `${RemoveSuffix<P, 'Id'>}UniversalIdentifier`]: TEntity[P];
  } & {
    applicationUniversalIdentifier: string;
  };

const universalFlatFieldMetadata: UniversalFlatFieldMetadata<FieldMetadataType.RELATION> = {
  // Base properties (from FieldMetadataEntity, excluding relations and applicationId)
  id: '550e8400-e29b-41d4-a716-446655440000',
  universalIdentifier: '550e8400-e29b-41d4-a716-446655440001',
  standardId: '550e8400-e29b-41d4-a716-446655440003',
  type: FieldMetadataType.RELATION,
  name: 'firstName',
  label: 'First Name',
  defaultValue: null,
  description: 'The first name of the person',
  icon: 'IconUser',
  standardOverrides: null,
  options: null,
  settings: {
    relationType: RelationType.ONE_TO_MANY,
  },
  isCustom: false,
  isActive: true,
  isSystem: false,
  isUIReadOnly: false,
  isNullable: true,
  isUnique: false,
  isLabelSyncedWithName: true,
  morphId: null,

  // Date properties cast to string
  createdAt: '2024-01-15T10:30:00.000Z',
  updatedAt: '2024-01-15T10:30:00.000Z',

  // ManyToOne relation universal identifiers (from FieldMetadataEntity relations)
  applicationUniversalIdentifier: '5800681c-088e-4e2b-9fc3-bcf6e8ec2051',
  relationTargetFieldMetadataUniversalIdentifier:
    '550e8400-e29b-41d4-a716-446655440012',
  relationTargetObjectMetadataUniversalIdentifier:
    '550e8400-e29b-41d4-a716-446655440013',

  // Join column universal identifiers (foreignKey -> universalIdentifier)
  objectMetadataUniversalIdentifier: '550e8400-e29b-41d4-a716-446655440010',

  // OneToMany relation universal identifiers (array of related entity identifiers)
  viewFieldUniversalIdentifiers: [
    '550e8400-e29b-41d4-a716-446655440020',
    '550e8400-e29b-41d4-a716-446655440021',
  ],
  viewFilterUniversalIdentifiers: ['550e8400-e29b-41d4-a716-446655440030'],
  kanbanAggregateOperationViewUniversalIdentifiers: [],
  calendarViewUniversalIdentifiers: [],
  mainGroupByFieldMetadataViewUniversalIdentifiers: [],
};

const tmp2 = {} as UniversalFlatFieldMetadata;
tmp2.relationTargetFieldMetadataUniversalIdentifier;
