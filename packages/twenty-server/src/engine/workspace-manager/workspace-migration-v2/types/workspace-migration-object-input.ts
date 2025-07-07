import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationObjectFieldInput } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-field-input';

const objectMetadataEntityPropertiesToCompare = [
  'description',
  'icon',
  'id',
  'isActive',
  'isLabelSyncedWithName',
  'labelPlural',
  'labelSingular',
  'namePlural',
  'nameSingular',
  'standardOverrides',
  'targetTableName', // not sure
  'targetRelationFields', // not sure
] as const satisfies (keyof ObjectMetadataEntity)[];
type ObjectMetadataEntityPropertiesToCompare =
  (typeof objectMetadataEntityPropertiesToCompare)[number];

// const objectMetadataEntityEditableProperties = [
//   'description',
//   'icon',
//   'id',
//   'isActive',
//   'isLabelSyncedWithName',
//   'labelPlural',
//   'labelSingular',
//   'namePlural',
//   'nameSingular',
//   'standardOverrides',
//   'targetTableName', // not sure
//   'targetRelationFields',
// ] as const satisfies (keyof ObjectMetadataEntity)[];

// Maybe we don't want a pick but the whole objectMetadata entity and use the const to scope the diff only
export type WorkspaceMigrationObjectInput = Pick<
  ObjectMetadataEntity,
  ObjectMetadataEntityPropertiesToCompare
> & {
  uniqueIdentifier: string;
  fieldInputs: WorkspaceMigrationObjectFieldInput[];
};
