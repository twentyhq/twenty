import { CUSTOM_OBJECT_DISHES } from 'test/integration/metadata/suites/object-metadata/constants/custom-object-dishes.constants';
import { type CreateOneObjectFactoryInput } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { findViewFields } from 'test/integration/metadata/suites/view-field/utils/find-view-fields.util';
import { findViews } from 'test/integration/metadata/suites/view/utils/find-views.util';
import { ViewType } from 'twenty-shared/types';
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

  const createDishesObject = async () => {
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

    const {
      data: { createOneObject },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: createObjectInput,
      gqlFields: objectCreationGqlFields,
    });

    return createOneObject;
  };

  const findIndexView = async (objectMetadataId: string) => {
    const {
      data: { getViews },
    } = await findViews({ objectMetadataId, expectToFail: false });

    return getViews.find((view) => view.key === 'INDEX');
  };

  it('should engine-provision the INDEX view and its view fields on object metadata creation', async () => {
    const createOneObject = await createDishesObject();

    createdObjectMetadataId = createOneObject.id;

    const {
      data: { getViews: createdViews },
    } = await findViews({
      objectMetadataId: createdObjectMetadataId,
      expectToFail: false,
    });

    expect(createdViews).toBeDefined();
    expect(createdViews.length).toBe(2);

    const indexView = createdViews.find((view) => view.key === 'INDEX');

    if (!isDefined(indexView)) {
      throw new Error('expected an INDEX view to be provisioned');
    }

    expect(indexView).toMatchObject<Partial<FlatView>>({
      objectMetadataId: createdObjectMetadataId,
      type: ViewType.TABLE,
    });

    const {
      data: { getViewFields: indexViewFields },
    } = await findViewFields({
      viewId: indexView.id,
      expectToFail: false,
    });

    expect(indexViewFields.length).toBe(5);
  });

  it('should keep the same INDEX view when the object is renamed (lossless, deterministic identifier)', async () => {
    const createOneObject = await createDishesObject();

    createdObjectMetadataId = createOneObject.id;

    const indexViewBeforeRename = await findIndexView(createdObjectMetadataId);

    if (!isDefined(indexViewBeforeRename)) {
      throw new Error('expected an INDEX view to be provisioned');
    }

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: createdObjectMetadataId,
        updatePayload: {
          labelPlural: 'Renamed dishes',
          labelSingular: 'Renamed dish',
        },
      },
    });

    const indexViewAfterRename = await findIndexView(createdObjectMetadataId);

    if (!isDefined(indexViewAfterRename)) {
      throw new Error('expected the INDEX view to survive the rename');
    }

    // Same primary key: the engine did not recreate or duplicate the view, and
    // the derived (name-free) identifier survives the object rename.
    expect(indexViewAfterRename.id).toBe(indexViewBeforeRename.id);

    const {
      data: { getViewFields: indexViewFieldsAfterRename },
    } = await findViewFields({
      viewId: indexViewAfterRename.id,
      expectToFail: false,
    });

    expect(indexViewFieldsAfterRename.length).toBe(5);
  });

  it('should cascade-delete the INDEX view and its view fields when the object is deleted', async () => {
    const createOneObject = await createDishesObject();
    const objectMetadataId = createOneObject.id;

    const indexView = await findIndexView(objectMetadataId);

    expect(isDefined(indexView)).toBe(true);

    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: objectMetadataId,
        updatePayload: { isActive: false },
      },
    });

    await deleteOneObjectMetadata({
      input: { idToDelete: objectMetadataId },
      expectToFail: false,
    });

    const {
      data: { getViews: viewsAfterDelete },
    } = await findViews({ objectMetadataId, expectToFail: false });

    expect(viewsAfterDelete.length).toBe(0);
  });
});
