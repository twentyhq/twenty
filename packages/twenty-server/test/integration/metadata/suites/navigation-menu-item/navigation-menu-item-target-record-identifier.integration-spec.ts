import { createNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/create-navigation-menu-item.util';
import { deleteNavigationMenuItem } from 'test/integration/metadata/suites/navigation-menu-item/utils/delete-navigation-menu-item.util';
import { findNavigationMenuItems } from 'test/integration/metadata/suites/navigation-menu-item/utils/find-navigation-menu-items.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { NavigationMenuItemType } from 'twenty-shared/types';

const SEED_PERSON_ID = '20202020-b305-41e7-8c72-ba44072a4c58';

const TARGET_RECORD_IDENTIFIER_GQL_FIELDS = `
  id
  type
  targetRecordId
  targetObjectMetadataId
  position
  targetRecordIdentifier {
    id
    labelIdentifier
    imageIdentifier
  }
`;

describe('NavigationMenuItem targetRecordIdentifier resolution', () => {
  let createdNavigationMenuItemId: string;
  let personObjectMetadataId: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: {
        filter: {},
        paging: { first: 1000 },
      },
      gqlFields: `
        id
        nameSingular
      `,
    });

    jestExpectToBeDefined(objects);

    const personObjectMetadata = objects.find(
      (object: { nameSingular: string }) => object.nameSingular === 'person',
    );

    jestExpectToBeDefined(personObjectMetadata);

    personObjectMetadataId = personObjectMetadata.id;
  });

  afterEach(async () => {
    if (createdNavigationMenuItemId) {
      await deleteNavigationMenuItem({
        expectToFail: false,
        input: { id: createdNavigationMenuItemId },
      });
      createdNavigationMenuItemId = undefined as unknown as string;
    }
  });

  it('should resolve targetRecordIdentifier on create mutation', async () => {
    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.RECORD,
        targetRecordId: SEED_PERSON_ID,
        targetObjectMetadataId: personObjectMetadataId,
      },
      gqlFields: TARGET_RECORD_IDENTIFIER_GQL_FIELDS,
    });

    createdNavigationMenuItemId = data?.createNavigationMenuItem?.id;

    const identifier =
      data.createNavigationMenuItem.targetRecordIdentifier;

    expect(identifier).toBeDefined();
    expect(identifier!.id).toBe(SEED_PERSON_ID);
    expect(identifier!.labelIdentifier).toEqual(expect.any(String));
  });

  it('should resolve targetRecordIdentifier on findMany query', async () => {
    const { data: createData } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.RECORD,
        targetRecordId: SEED_PERSON_ID,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    createdNavigationMenuItemId = createData?.createNavigationMenuItem?.id;

    const { data } = await findNavigationMenuItems({
      input: undefined,
      expectToFail: false,
      gqlFields: TARGET_RECORD_IDENTIFIER_GQL_FIELDS,
    });

    jestExpectToBeDefined(data?.navigationMenuItems);

    const item = data.navigationMenuItems.find(
      (navItem: { id: string }) => navItem.id === createdNavigationMenuItemId,
    );

    jestExpectToBeDefined(item);

    expect(item.targetRecordIdentifier).toBeDefined();
    expect(item.targetRecordIdentifier!.id).toBe(SEED_PERSON_ID);
    expect(item.targetRecordIdentifier!.labelIdentifier).toEqual(
      expect.any(String),
    );
  });

  it('should return null targetRecordIdentifier for non-RECORD types', async () => {
    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        type: NavigationMenuItemType.FOLDER,
        name: 'Test Folder',
      },
      gqlFields: TARGET_RECORD_IDENTIFIER_GQL_FIELDS,
    });

    createdNavigationMenuItemId = data?.createNavigationMenuItem?.id;

    expect(data.createNavigationMenuItem.targetRecordIdentifier).toBeNull();
  });

  it('should accept client-provided id on creation', async () => {
    const clientId = '11111111-1111-1111-1111-111111111111';

    const { data } = await createNavigationMenuItem({
      expectToFail: false,
      input: {
        id: clientId,
        type: NavigationMenuItemType.RECORD,
        targetRecordId: SEED_PERSON_ID,
        targetObjectMetadataId: personObjectMetadataId,
      },
    });

    createdNavigationMenuItemId = data?.createNavigationMenuItem?.id;

    expect(data.createNavigationMenuItem.id).toBe(clientId);
  });
});
