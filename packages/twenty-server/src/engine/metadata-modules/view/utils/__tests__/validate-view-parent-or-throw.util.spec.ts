import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type FlatViewMaps } from 'src/engine/metadata-modules/flat-view/types/flat-view-maps.type';
import { ViewException } from 'src/engine/metadata-modules/view/exceptions/view.exception';
import { validateViewParentOrThrow } from 'src/engine/metadata-modules/view/utils/validate-view-parent-or-throw.util';

const OBJECT_METADATA_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const OTHER_OBJECT_METADATA_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

const buildFlatView = ({
  id,
  parentViewId = null,
  objectMetadataId = OBJECT_METADATA_ID,
  deletedAt = null,
}: {
  id: string;
  parentViewId?: string | null;
  objectMetadataId?: string;
  deletedAt?: string | null;
}) =>
  ({
    id,
    universalIdentifier: `universal-${id}`,
    parentViewId,
    objectMetadataId,
    deletedAt,
  }) as FlatView;

const buildFlatViewMaps = (flatViews: FlatView[]): FlatViewMaps => ({
  byUniversalIdentifier: Object.fromEntries(
    flatViews.map((flatView) => [flatView.universalIdentifier, flatView]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatViews.map((flatView) => [flatView.id, flatView.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('validateViewParentOrThrow', () => {
  it('should accept a view with no parent', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: null,
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([]),
      }),
    ).not.toThrow();
  });

  it('should accept a root view as parent', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'root-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([
          buildFlatView({ id: 'root-view' }),
          buildFlatView({ id: 'view-1' }),
        ]),
      }),
    ).not.toThrow();
  });

  it('should reject a view pointing at itself', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'view-1',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([buildFlatView({ id: 'view-1' })]),
      }),
    ).toThrow(ViewException);
  });

  it('should reject a missing parent', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'unknown-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([buildFlatView({ id: 'view-1' })]),
      }),
    ).toThrow(ViewException);
  });

  it('should reject a deleted parent', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'root-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([
          buildFlatView({ id: 'root-view', deletedAt: '2026-01-01' }),
          buildFlatView({ id: 'view-1' }),
        ]),
      }),
    ).toThrow(ViewException);
  });

  it('should reject a parent on another object', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'root-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([
          buildFlatView({
            id: 'root-view',
            objectMetadataId: OTHER_OBJECT_METADATA_ID,
          }),
          buildFlatView({ id: 'view-1' }),
        ]),
      }),
    ).toThrow(ViewException);
  });

  it('should reject nesting a stack inside another stack', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'child-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([
          buildFlatView({ id: 'root-view' }),
          buildFlatView({ id: 'child-view', parentViewId: 'root-view' }),
          buildFlatView({ id: 'view-1' }),
        ]),
      }),
    ).toThrow(ViewException);
  });

  it('should reject moving a view that already holds a stack', () => {
    expect(() =>
      validateViewParentOrThrow({
        viewId: 'view-1',
        parentViewId: 'root-view',
        objectMetadataId: OBJECT_METADATA_ID,
        flatViewMaps: buildFlatViewMaps([
          buildFlatView({ id: 'root-view' }),
          buildFlatView({ id: 'view-1' }),
          buildFlatView({ id: 'view-1-child', parentViewId: 'view-1' }),
        ]),
      }),
    ).toThrow(ViewException);
  });
});
