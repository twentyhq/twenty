import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { fromObjectMetadataEntityToObjectMetadataDto } from 'src/engine/metadata-modules/object-metadata/utils/from-object-metadata-entity-to-object-metadata-dto.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';

const buildEntity = (
  partial: Partial<ObjectMetadataEntity>,
): ObjectMetadataEntity =>
  ({
    id: 'object-id',
    universalIdentifier: 'object-universal-identifier',
    applicationId: 'application-id',
    nameSingular: 'task',
    namePlural: 'tasks',
    labelSingular: 'Task',
    labelPlural: 'Tasks',
    isActive: true,
    overrides: null,
    ...partial,
  }) as ObjectMetadataEntity;

describe('fromObjectMetadataEntityToObjectMetadataDto', () => {
  it('reads isActive from the workspace entry over the column', () => {
    expect(
      fromObjectMetadataEntityToObjectMetadataDto(
        buildEntity({
          isActive: true,
          overrides: { [CUSTOM]: { isActive: false } },
        }),
      ).isActive,
    ).toBe(false);
    expect(
      fromObjectMetadataEntityToObjectMetadataDto(
        buildEntity({
          isActive: false,
          overrides: { [CUSTOM]: { isActive: true } },
        }),
      ).isActive,
    ).toBe(true);
  });

  it('falls back to the column without an entry', () => {
    expect(
      fromObjectMetadataEntityToObjectMetadataDto(
        buildEntity({
          isActive: false,
          overrides: { [CUSTOM]: { icon: 'X' } },
        }),
      ).isActive,
    ).toBe(false);
  });
});
