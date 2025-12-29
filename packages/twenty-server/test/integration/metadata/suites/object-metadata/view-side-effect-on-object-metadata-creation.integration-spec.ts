import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findCoreViewFields } from 'test/integration/metadata/suites/view-field/utils/find-core-view-fields.util';
import { findCoreViews } from 'test/integration/metadata/suites/view/utils/find-core-views.util';
import { isDefined } from 'twenty-shared/utils';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

describe('View side effect on object creation', () => {
  let createdObjectMetadataId: string | undefined = undefined;

  afterEach(async () => {
    if (!isDefined(createdObjectMetadataId)) {
      return;
    }
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: createdObjectMetadataId },
      expectToFail: false,
    });

    createdObjectMetadataId = undefined;
  });
  it('should create a view and view field for default custom objects standard fields on object metadata creation', async () => {
    const {
      labelPlural,
      description,
      labelSingular,
      namePlural,
      nameSingular,
    } = CUSTOM_OBJECT_DISHES;
    const createObjectInput: CreateOneObjectFactoryInput = {
      labelPlural,
      description,
      labelSingular,
      namePlural,
      nameSingular,
      icon: 'IconBuildingSkyscraper',
      isLabelSyncedWithName: false,
    };
    const objectCreationGqlFields = `
      id
      labelPlural
      description
      labelSingular
      namePlural
      nameSingular
      icon
      isLabelSyncedWithName
    `;

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: objectCreationGqlFields,
    });

    createdObjectMetadataId = createOneObject.id;

    const {
      data: { getCoreViews: createdViews },
    } = await findCoreViews({
      objectMetadataId: createdObjectMetadataId,
      expectToFail: false,
    });

    expect(createdViews).toBeDefined();
    expect(createdViews.length).toBe(1);
    const [firstView] = createdViews;

    expect(firstView).toMatchObject<Partial<FlatView>>({
      objectMetadataId: createdObjectMetadataId,
    });

    const {
      data: { getCoreViewFields: createdViewFields },
    } = await findCoreViewFields({
      viewId: firstView.id,
      expectToFail: false,
    });

    expect(createdViewFields.length).toBe(12);
  });
});
