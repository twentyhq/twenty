import { FieldMetadataType, RelationType, ViewType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service';

const VIEW_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-0000000000v1';
const SELECT_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-0000000000f1';
const RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-0000-0000-0000000000f2';
const TEXT_FIELD_UNIVERSAL_IDENTIFIER = '00000000-0000-0000-0000-0000000000f3';

const selectField: UniversalFlatFieldMetadata = {
  universalIdentifier: SELECT_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.SELECT,
} as unknown as UniversalFlatFieldMetadata;

const manyToOneRelationField: UniversalFlatFieldMetadata = {
  universalIdentifier: RELATION_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.RELATION,
  universalSettings: { relationType: RelationType.MANY_TO_ONE },
} as unknown as UniversalFlatFieldMetadata;

const textField: UniversalFlatFieldMetadata = {
  universalIdentifier: TEXT_FIELD_UNIVERSAL_IDENTIFIER,
  type: FieldMetadataType.TEXT,
} as unknown as UniversalFlatFieldMetadata;

const mapsFrom = (entities: { universalIdentifier: string }[]) => {
  const maps = createEmptyFlatEntityMaps() as unknown as {
    byUniversalIdentifier: Record<string, unknown>;
  };

  for (const entity of entities) {
    maps.byUniversalIdentifier[entity.universalIdentifier] = entity;
  }

  return maps;
};

const buildUpdateArgs = ({
  existingView,
  update,
  fields,
}: {
  existingView: Partial<UniversalFlatView>;
  update: Record<string, unknown>;
  fields: UniversalFlatFieldMetadata[];
}) =>
  ({
    universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
    flatEntityUpdate: update,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: mapsFrom([
        {
          universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
          ...existingView,
        } as UniversalFlatView,
      ]),
      flatFieldMetadataMaps: mapsFrom(fields),
    },
  }) as unknown as Parameters<
    FlatViewValidatorService['validateFlatViewUpdate']
  >[0];

describe('FlatViewValidatorService', () => {
  let service: FlatViewValidatorService;

  beforeEach(() => {
    service = new FlatViewValidatorService();
  });

  describe('validateFlatViewUpdate - Kanban main group by field', () => {
    it('should allow a SELECT field when a view becomes Kanban', () => {
      const result = service.validateFlatViewUpdate(
        buildUpdateArgs({
          existingView: { type: ViewType.TABLE },
          update: {
            type: ViewType.KANBAN,
            mainGroupByFieldMetadataUniversalIdentifier:
              SELECT_FIELD_UNIVERSAL_IDENTIFIER,
          },
          fields: [selectField],
        }),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('should allow a MANY_TO_ONE relation field when a view becomes Kanban', () => {
      const result = service.validateFlatViewUpdate(
        buildUpdateArgs({
          existingView: { type: ViewType.TABLE },
          update: {
            type: ViewType.KANBAN,
            mainGroupByFieldMetadataUniversalIdentifier:
              RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          },
          fields: [manyToOneRelationField],
        }),
      );

      expect(result.errors).toHaveLength(0);
    });

    it('should reject a non-SELECT, non-relation field when a view becomes Kanban', () => {
      const result = service.validateFlatViewUpdate(
        buildUpdateArgs({
          existingView: { type: ViewType.TABLE },
          update: {
            type: ViewType.KANBAN,
            mainGroupByFieldMetadataUniversalIdentifier:
              TEXT_FIELD_UNIVERSAL_IDENTIFIER,
          },
          fields: [textField],
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe(ViewExceptionCode.INVALID_VIEW_DATA);
    });

    it('should allow switching the group by field to a MANY_TO_ONE relation on an existing Kanban view', () => {
      const result = service.validateFlatViewUpdate(
        buildUpdateArgs({
          existingView: {
            type: ViewType.KANBAN,
            mainGroupByFieldMetadataUniversalIdentifier:
              SELECT_FIELD_UNIVERSAL_IDENTIFIER,
          },
          update: {
            mainGroupByFieldMetadataUniversalIdentifier:
              RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          },
          fields: [selectField, manyToOneRelationField],
        }),
      );

      expect(result.errors).toHaveLength(0);
    });
  });
});
