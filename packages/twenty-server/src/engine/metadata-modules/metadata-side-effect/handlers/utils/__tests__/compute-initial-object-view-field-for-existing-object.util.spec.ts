import { getSystemViewFieldUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getInitialObjectViewUniversalIdentifier } from 'src/engine/metadata-modules/view/utils/get-initial-object-view-universal-identifier.util';

import { computeInitialObjectViewFieldForExistingObject } from '../compute-initial-object-view-field-for-existing-object.util';

type ComputeInitialObjectViewFieldArgs = Parameters<
  typeof computeInitialObjectViewFieldForExistingObject
>[0];

type FlatViewFixture = NonNullable<
  ComputeInitialObjectViewFieldArgs['flatViewMaps']['byUniversalIdentifier'][string]
>;

type FlatViewFieldFixture = NonNullable<
  ComputeInitialObjectViewFieldArgs['flatViewFieldMaps']['byUniversalIdentifier'][string]
> & { universalIdentifier: string };

const installedApplicationUniversalIdentifier =
  'a1a2a3a4-a5a6-4000-8000-000000000001';
const workspaceCustomApplicationUniversalIdentifier =
  'a1a2a3a4-a5a6-4000-8000-000000000002';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const labelIdentifierFieldMetadataUniversalIdentifier =
  'c1c2c3c4-c5c6-4000-8000-000000000001';
const firstFieldUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000002';
const secondFieldUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000003';
const customViewUniversalIdentifier = 'd1d2d3d4-d5d6-4000-8000-000000000001';

const initialViewUniversalIdentifier = getInitialObjectViewUniversalIdentifier({
  viewApplicationUniversalIdentifier:
    workspaceCustomApplicationUniversalIdentifier,
  objectUniversalIdentifier,
});

const buildSourceFlatFieldMetadata = ({
  universalIdentifier,
  name,
  applicationUniversalIdentifier = installedApplicationUniversalIdentifier,
}: {
  universalIdentifier: string;
  name: string;
  applicationUniversalIdentifier?: string;
}) =>
  getFlatFieldMetadataMock({
    universalIdentifier,
    objectMetadataId: 'object-metadata-id',
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
    applicationUniversalIdentifier,
    name,
    label: name,
    type: FieldMetadataType.TEXT,
  });

const firstFlatFieldMetadata = buildSourceFlatFieldMetadata({
  universalIdentifier: firstFieldUniversalIdentifier,
  name: 'firstField',
});
const secondFlatFieldMetadata = buildSourceFlatFieldMetadata({
  universalIdentifier: secondFieldUniversalIdentifier,
  name: 'secondField',
});

const buildFlatView = (
  overrides: Partial<FlatViewFixture> = {},
): FlatViewFixture => ({
  universalIdentifier: initialViewUniversalIdentifier,
  applicationUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
  deletedAt: null,
  viewFieldUniversalIdentifiers: [],
  ...overrides,
});

const buildFlatViewField = ({
  universalIdentifier,
  position,
  overrides = {},
}: {
  universalIdentifier: string;
  position: number;
  overrides?: Partial<FlatViewFieldFixture>;
}): FlatViewFieldFixture => ({
  universalIdentifier,
  applicationUniversalIdentifier: workspaceCustomApplicationUniversalIdentifier,
  universalOverrides: null,
  isActive: true,
  position,
  deletedAt: null,
  ...overrides,
});

const buildArgs = ({
  flatViews = [buildFlatView()],
  flatViewFields = [],
  flatFieldMetadatasToCreate = [firstFlatFieldMetadata],
}: {
  flatViews?: FlatViewFixture[];
  flatViewFields?: FlatViewFieldFixture[];
  flatFieldMetadatasToCreate?: (typeof firstFlatFieldMetadata)[];
} = {}): Omit<ComputeInitialObjectViewFieldArgs, 'sourceFlatFieldMetadata'> => {
  const allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName =
    {
      fieldMetadata: {
        flatEntityToCreate: Object.fromEntries(
          flatFieldMetadatasToCreate.map((flatFieldMetadata) => [
            flatFieldMetadata.universalIdentifier,
            flatFieldMetadata,
          ]),
        ),
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    };

  return {
    flatObjectMetadata: {
      universalIdentifier: objectUniversalIdentifier,
      labelIdentifierFieldMetadataUniversalIdentifier,
      viewUniversalIdentifiers: flatViews.map(
        (flatView) => flatView.universalIdentifier,
      ),
    },
    allFlatEntityOperationRecordByMetadataName,
    flatViewMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatViews.map((flatView) => [flatView.universalIdentifier, flatView]),
      ),
    },
    flatViewFieldMaps: {
      byUniversalIdentifier: Object.fromEntries(
        flatViewFields.map((flatViewField) => [
          flatViewField.universalIdentifier,
          flatViewField,
        ]),
      ),
    },
  };
};

describe('computeInitialObjectViewFieldForExistingObject', () => {
  it('should emit a visible engine-owned view field attributed to the application of the field', () => {
    const result = computeInitialObjectViewFieldForExistingObject({
      sourceFlatFieldMetadata: firstFlatFieldMetadata,
      ...buildArgs(),
    });

    expect(result).toMatchObject({
      universalIdentifier: getSystemViewFieldUniversalIdentifier({
        fieldMetadataApplicationUniversalIdentifier:
          installedApplicationUniversalIdentifier,
        viewUniversalIdentifier: initialViewUniversalIdentifier,
        fieldMetadataUniversalIdentifier: firstFieldUniversalIdentifier,
      }),
      applicationUniversalIdentifier: installedApplicationUniversalIdentifier,
      viewUniversalIdentifier: initialViewUniversalIdentifier,
      fieldMetadataUniversalIdentifier: firstFieldUniversalIdentifier,
      isVisible: true,
      isSystemSideEffect: true,
      position: 0,
    });
  });

  it('should append after the active view fields of the initial view', () => {
    const result = computeInitialObjectViewFieldForExistingObject({
      sourceFlatFieldMetadata: firstFlatFieldMetadata,
      ...buildArgs({
        flatViews: [
          buildFlatView({
            viewFieldUniversalIdentifiers: ['active', 'inactive', 'deleted'],
          }),
        ],
        flatViewFields: [
          buildFlatViewField({ universalIdentifier: 'active', position: 4 }),
          buildFlatViewField({
            universalIdentifier: 'inactive',
            position: 8,
            overrides: { isActive: false },
          }),
          buildFlatViewField({
            universalIdentifier: 'deleted',
            position: 9,
            overrides: { deletedAt: '2026-01-01T00:00:00.000Z' },
          }),
        ],
      }),
    });

    expect(result?.position).toBe(5);
  });

  it('should append after a column the user moved to the end', () => {
    const result = computeInitialObjectViewFieldForExistingObject({
      sourceFlatFieldMetadata: firstFlatFieldMetadata,
      ...buildArgs({
        flatViews: [
          buildFlatView({ viewFieldUniversalIdentifiers: ['moved', 'other'] }),
        ],
        flatViewFields: [
          buildFlatViewField({
            universalIdentifier: 'moved',
            position: 3,
            overrides: {
              universalOverrides: {
                [workspaceCustomApplicationUniversalIdentifier]: {
                  position: 20,
                },
              },
            },
          }),
          buildFlatViewField({ universalIdentifier: 'other', position: 7 }),
        ],
      }),
    });

    expect(result?.position).toBe(21);
  });

  it('should give each field of one batch a distinct position', () => {
    const args = buildArgs({
      flatFieldMetadatasToCreate: [
        firstFlatFieldMetadata,
        secondFlatFieldMetadata,
      ],
    });

    const positions = [firstFlatFieldMetadata, secondFlatFieldMetadata].map(
      (sourceFlatFieldMetadata) =>
        computeInitialObjectViewFieldForExistingObject({
          sourceFlatFieldMetadata,
          ...args,
        })?.position,
    );

    expect([...positions].sort()).toEqual([0, 1]);
  });

  it('should return undefined when the object has no live initial view', () => {
    const flatViewsWithoutLiveInitialView = [
      [],
      [buildFlatView({ deletedAt: '2026-01-01T00:00:00.000Z' })],
      [buildFlatView({ universalIdentifier: customViewUniversalIdentifier })],
    ];

    for (const flatViews of flatViewsWithoutLiveInitialView) {
      expect(
        computeInitialObjectViewFieldForExistingObject({
          sourceFlatFieldMetadata: firstFlatFieldMetadata,
          ...buildArgs({ flatViews }),
        }),
      ).toBeUndefined();
    }
  });

  it('should return undefined for a field of the application owning the initial view', () => {
    const userFlatFieldMetadata = buildSourceFlatFieldMetadata({
      universalIdentifier: firstFieldUniversalIdentifier,
      name: 'userField',
      applicationUniversalIdentifier:
        workspaceCustomApplicationUniversalIdentifier,
    });

    expect(
      computeInitialObjectViewFieldForExistingObject({
        sourceFlatFieldMetadata: userFlatFieldMetadata,
        ...buildArgs({ flatFieldMetadatasToCreate: [userFlatFieldMetadata] }),
      }),
    ).toBeUndefined();
  });

  it('should return undefined for the label identifier field', () => {
    const labelIdentifierFlatFieldMetadata = buildSourceFlatFieldMetadata({
      universalIdentifier: labelIdentifierFieldMetadataUniversalIdentifier,
      name: 'name',
    });

    expect(
      computeInitialObjectViewFieldForExistingObject({
        sourceFlatFieldMetadata: labelIdentifierFlatFieldMetadata,
        ...buildArgs({
          flatFieldMetadatasToCreate: [labelIdentifierFlatFieldMetadata],
        }),
      }),
    ).toBeUndefined();
  });
});
