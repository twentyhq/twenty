import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { isAllowedFlatViewKanbanMainGroupByField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-allowed-flat-view-kanban-main-group-by-field.util';

const buildField = (
  field: Partial<UniversalFlatFieldMetadata>,
): UniversalFlatFieldMetadata => field as UniversalFlatFieldMetadata;

describe('isAllowedFlatViewKanbanMainGroupByField', () => {
  it('should allow a SELECT field', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({
          type: FieldMetadataType.SELECT,
        }),
      }),
    ).toBe(true);
  });

  it('should allow a MANY_TO_ONE relation field', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.MANY_TO_ONE },
        }),
      }),
    ).toBe(true);
  });

  it('should reject a ONE_TO_MANY relation field', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({
          type: FieldMetadataType.RELATION,
          universalSettings: { relationType: RelationType.ONE_TO_MANY },
        }),
      }),
    ).toBe(false);
  });

  it('should reject a relation field with no relation type set', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({
          type: FieldMetadataType.RELATION,
          universalSettings: {},
        }),
      }),
    ).toBe(false);
  });

  it('should reject a plain scalar field', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({ type: FieldMetadataType.TEXT }),
      }),
    ).toBe(false);
  });

  it('should reject a MULTI_SELECT field', () => {
    expect(
      isAllowedFlatViewKanbanMainGroupByField({
        mainGroupByFieldMetadata: buildField({
          type: FieldMetadataType.MULTI_SELECT,
        }),
      }),
    ).toBe(false);
  });
});
