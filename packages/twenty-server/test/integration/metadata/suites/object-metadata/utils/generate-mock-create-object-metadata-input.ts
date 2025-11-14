import { type CreateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

// TODO would tend to use faker
export const getMockCreateObjectInput = (
  overrides?: Partial<
    Omit<CreateOneObjectInput, 'workspaceId' | 'dataSourceId'>
  >,
) => ({
  namePlural: 'listingas',
  nameSingular: 'listinga',
  labelPlural: 'Listings',
  labelSingular: 'Listing',
  description: 'Listing object',
  icon: 'IconListNumbers',
  isLabelSyncedWithName: false,
  ...overrides,
});
