import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { ViewExceptionCode } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';
import { validateFlatViewToggleMineFilterField } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-toggle-mine-filter-field.util';

const buildFlatView = (
  toggleMineFilterFieldMetadataUniversalIdentifier: string | null,
) =>
  ({
    objectMetadataUniversalIdentifier: 'object',
    toggleMineFilterFieldMetadataUniversalIdentifier,
  }) as UniversalFlatView;

const validate = (
  flatView: UniversalFlatView,
  fields: UniversalFlatFieldMetadata[],
) =>
  validateFlatViewToggleMineFilterField({
    flatView,
    flatFieldMetadataMaps: {
      byUniversalIdentifier: Object.fromEntries(
        fields.map((field) => [field.universalIdentifier, field]),
      ),
    },
  });

const actorField = {
  universalIdentifier: 'toggle-mine-filter-field',
  objectMetadataUniversalIdentifier: 'object',
  type: FieldMetadataType.ACTOR,
} as UniversalFlatFieldMetadata;

const buildRelationField = ({
  relationType,
  relationTargetObjectMetadataUniversalIdentifier,
}: {
  relationType: RelationType;
  relationTargetObjectMetadataUniversalIdentifier: string;
}) =>
  ({
    universalIdentifier: 'toggle-mine-filter-field',
    objectMetadataUniversalIdentifier: 'object',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataUniversalIdentifier,
    universalSettings: { relationType },
  }) as unknown as UniversalFlatFieldMetadata;

describe('validateFlatViewToggleMineFilterField', () => {
  it('accepts a view without a toggle mine filter field', () => {
    expect(validate(buildFlatView(null), [])).toEqual([]);
  });

  it('accepts an actor field', () => {
    expect(
      validate(buildFlatView('toggle-mine-filter-field'), [actorField]),
    ).toEqual([]);
  });

  it('accepts a many-to-one relation to workspace members', () => {
    const relationField = buildRelationField({
      relationType: RelationType.MANY_TO_ONE,
      relationTargetObjectMetadataUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember,
    });

    expect(
      validate(buildFlatView('toggle-mine-filter-field'), [relationField]),
    ).toEqual([]);
  });

  it('rejects an unknown field', () => {
    expect(validate(buildFlatView('toggle-mine-filter-field'), [])).toEqual([
      expect.objectContaining({ code: ViewExceptionCode.INVALID_VIEW_DATA }),
    ]);
  });

  it('rejects a field of another object', () => {
    const otherObjectActorField = {
      ...actorField,
      objectMetadataUniversalIdentifier: 'other-object',
    } as UniversalFlatFieldMetadata;

    expect(
      validate(buildFlatView('toggle-mine-filter-field'), [
        otherObjectActorField,
      ]),
    ).toEqual([
      expect.objectContaining({ code: ViewExceptionCode.INVALID_VIEW_DATA }),
    ]);
  });

  it.each([
    [
      'a relation to another object',
      buildRelationField({
        relationType: RelationType.MANY_TO_ONE,
        relationTargetObjectMetadataUniversalIdentifier: 'company',
      }),
    ],
    [
      'a one-to-many relation to workspace members',
      buildRelationField({
        relationType: RelationType.ONE_TO_MANY,
        relationTargetObjectMetadataUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember,
      }),
    ],
    [
      'a text field',
      {
        ...actorField,
        type: FieldMetadataType.TEXT,
      } as UniversalFlatFieldMetadata,
    ],
  ])('rejects %s', (_description, field) => {
    expect(
      validate(buildFlatView('toggle-mine-filter-field'), [field]),
    ).toEqual([
      expect.objectContaining({ code: ViewExceptionCode.INVALID_VIEW_DATA }),
    ]);
  });
});
