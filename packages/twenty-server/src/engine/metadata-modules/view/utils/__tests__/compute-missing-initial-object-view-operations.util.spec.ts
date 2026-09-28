import { getViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { type AggregateOperations, ViewKey } from 'twenty-shared/types';

import { computeMissingInitialObjectViewOperations } from 'src/engine/metadata-modules/view/utils/compute-missing-initial-object-view-operations.util';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

const WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000001';
const PET_OBJECT_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000002';
const PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000003';
const NAME_FIELD_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000004';
const AGE_FIELD_UNIVERSAL_IDENTIFIER = '5f4a1c1e-0000-4000-8000-000000000005';
const NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000006';
const AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '5f4a1c1e-0000-4000-8000-000000000007';

const INITIAL_VIEW_UNIVERSAL_IDENTIFIER =
  getInitialObjectViewUniversalIdentifier({
    viewApplicationUniversalIdentifier:
      WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    objectUniversalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
  });

type ObjectFixture = {
  universalIdentifier: string;
  labelPlural: string;
  isRemote: boolean;
  isSystem: boolean;
  viewUniversalIdentifiers: string[];
};

type ViewFixture = {
  universalIdentifier: string;
  key: ViewKey | null;
  deletedAt: string | null;
  viewFieldUniversalIdentifiers: string[];
};

type ViewFieldFixture = {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  viewUniversalIdentifier: string;
  viewFieldGroupUniversalIdentifier: string | null;
  isVisible: boolean;
  size: number;
  position: number;
  aggregateOperation: AggregateOperations | null;
  isActive: boolean;
  isSystemSideEffect: boolean;
  universalOverrides: null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  applicationUniversalIdentifier: string;
};

const PET_OBJECT: ObjectFixture = {
  universalIdentifier: PET_OBJECT_UNIVERSAL_IDENTIFIER,
  labelPlural: 'Pets',
  isRemote: false,
  isSystem: false,
  viewUniversalIdentifiers: [PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER],
};

const PET_OBJECT_WITH_INITIAL_VIEW: ObjectFixture = {
  ...PET_OBJECT,
  viewUniversalIdentifiers: [
    PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
    INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
  ],
};

const PET_INDEX_VIEW: ViewFixture = {
  universalIdentifier: PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  key: ViewKey.INDEX,
  deletedAt: null,
  viewFieldUniversalIdentifiers: [
    NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  ],
};

const buildIndexViewFieldFixture = ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  position,
}: {
  universalIdentifier: string;
  fieldMetadataUniversalIdentifier: string;
  position: number;
}): ViewFieldFixture => ({
  universalIdentifier,
  fieldMetadataUniversalIdentifier,
  viewUniversalIdentifier: PET_INDEX_VIEW_UNIVERSAL_IDENTIFIER,
  viewFieldGroupUniversalIdentifier: null,
  isVisible: true,
  size: 180,
  position,
  aggregateOperation: null,
  isActive: true,
  isSystemSideEffect: true,
  universalOverrides: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  applicationUniversalIdentifier: 'some-standard-application',
});

const buildMaps = ({
  objects,
  views,
  viewFields,
}: {
  objects: ObjectFixture[];
  views: ViewFixture[];
  viewFields: ViewFieldFixture[];
}) => ({
  flatObjectMetadatas: objects,
  flatViewMaps: {
    byUniversalIdentifier: Object.fromEntries(
      views.map((view) => [view.universalIdentifier, view]),
    ),
  },
  flatViewFieldMaps: {
    byUniversalIdentifier: Object.fromEntries(
      viewFields.map((viewField) => [viewField.universalIdentifier, viewField]),
    ),
  },
});

const NAME_INDEX_VIEW_FIELD = buildIndexViewFieldFixture({
  universalIdentifier: NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  position: 0,
});

const AGE_INDEX_VIEW_FIELD = buildIndexViewFieldFixture({
  universalIdentifier: AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  fieldMetadataUniversalIdentifier: AGE_FIELD_UNIVERSAL_IDENTIFIER,
  position: 1,
});

describe('computeMissingInitialObjectViewOperations', () => {
  it('seeds one view and copies the INDEX layout for an object without an initial view', () => {
    const { viewsToCreate, viewFieldsToCreate } =
      computeMissingInitialObjectViewOperations({
        ...buildMaps({
          objects: [PET_OBJECT],
          views: [PET_INDEX_VIEW],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        initialViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(1);
    expect(viewsToCreate[0]).toMatchObject({
      universalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
      name: 'All Pets',
      key: null,
      isSystemSideEffect: false,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    expect(viewFieldsToCreate).toHaveLength(2);
    expect(viewFieldsToCreate.map((viewField) => viewField.position)).toEqual([
      0, 1,
    ]);
    expect(viewFieldsToCreate[0]).toMatchObject({
      fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      viewUniversalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
      isSystemSideEffect: false,
      applicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      universalIdentifier: getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
        fieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    });
    expect(
      viewFieldsToCreate.every(
        (viewField) =>
          viewField.universalIdentifier !==
            NAME_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER &&
          viewField.universalIdentifier !==
            AGE_INDEX_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
      ),
    ).toBe(true);
  });

  it('produces nothing when the initial view already exists, live or soft-deleted', () => {
    const buildExistingInitialView = (
      deletedAt: string | null,
    ): ViewFixture => ({
      universalIdentifier: INITIAL_VIEW_UNIVERSAL_IDENTIFIER,
      key: null,
      deletedAt,
      viewFieldUniversalIdentifiers: [],
    });

    for (const deletedAt of [null, '2024-01-01T00:00:00.000Z']) {
      const { viewsToCreate, viewFieldsToCreate } =
        computeMissingInitialObjectViewOperations({
          ...buildMaps({
            objects: [PET_OBJECT_WITH_INITIAL_VIEW],
            views: [PET_INDEX_VIEW, buildExistingInitialView(deletedAt)],
            viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
          }),
          initialViewApplicationUniversalIdentifier:
            WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
        });

      expect(viewsToCreate).toHaveLength(0);
      expect(viewFieldsToCreate).toHaveLength(0);
    }
  });

  it('seeds nothing for an object whose standard view already plays that role', () => {
    const { viewsToCreate, viewFieldsToCreate } =
      computeMissingInitialObjectViewOperations({
        ...buildMaps({
          objects: [
            {
              ...PET_OBJECT,
              universalIdentifier:
                STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity,
              labelPlural: 'Opportunities',
            },
          ],
          views: [PET_INDEX_VIEW],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        initialViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(0);
    expect(viewFieldsToCreate).toHaveLength(0);
  });

  it('skips objects without a live INDEX view, remote objects and system objects', () => {
    const remoteObject: ObjectFixture = {
      universalIdentifier: '5f4a1c1e-0000-4000-8000-000000000008',
      labelPlural: 'Remotes',
      isRemote: true,
      isSystem: false,
      viewUniversalIdentifiers: [],
    };
    const objectWithoutIndexView: ObjectFixture = {
      universalIdentifier: '5f4a1c1e-0000-4000-8000-000000000009',
      labelPlural: 'Orphans',
      isRemote: false,
      isSystem: false,
      viewUniversalIdentifiers: [],
    };
    const systemObject: ObjectFixture = {
      ...PET_OBJECT,
      universalIdentifier: '5f4a1c1e-0000-4000-8000-000000000010',
      labelPlural: 'Systems',
      isSystem: true,
    };

    const { viewsToCreate, viewFieldsToCreate } =
      computeMissingInitialObjectViewOperations({
        ...buildMaps({
          objects: [remoteObject, objectWithoutIndexView, systemObject],
          views: [PET_INDEX_VIEW],
          viewFields: [NAME_INDEX_VIEW_FIELD, AGE_INDEX_VIEW_FIELD],
        }),
        initialViewApplicationUniversalIdentifier:
          WORKSPACE_CUSTOM_APPLICATION_UNIVERSAL_IDENTIFIER,
      });

    expect(viewsToCreate).toHaveLength(0);
    expect(viewFieldsToCreate).toHaveLength(0);
  });
});
