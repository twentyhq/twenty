import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

describe('Custom object renaming', () => {
  let listingObjectId = '';
  const uniqueSuffix = Date.now().toString().slice(-8);

  const STANDARD_OBJECT_RELATIONS = [
    'noteTarget',
    'attachment',
    'favorite',
    'taskTarget',
    'timelineActivity',
  ];

  const standardObjectRelationsMap = STANDARD_OBJECT_RELATIONS.reduce(
    (acc, relation) => ({
      ...acc,
      [relation]: {
        objectMetadataId: '',
        foreignKeyFieldMetadataId: '',
        relationFieldMetadataId: '',
      },
    }),
    {},
  );

  const standardObjectsGraphqlOperation = findManyObjectMetadataQueryFactory({
    gqlFields: `
    id
    nameSingular
  `,
    input: {
      filter: {
        isCustom: { isNot: true },
      },
      paging: { first: 1000 },
    },
  });

  const fieldsGraphqlOperation = findManyFieldsMetadataQueryFactory({
    gqlFields: `
        id
        name
        label
        type
        object {
          id
        }
      `,
    input: {
      filter: {},
      paging: { first: 1000 },
    },
  });

  // @ts-expect-error legacy noImplicitAny
  const fillStandardObjectRelationsMapObjectMetadataId = (standardObjects) => {
    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
      // @ts-expect-error legacy noImplicitAny
      standardObjectRelationsMap[relation].objectMetadataId =
        standardObjects.body.data.objects.edges.find(
          // @ts-expect-error legacy noImplicitAny
          (object) =>
            object.node.nameSingular === relation ||
            object.node.nameSingular === `target${relation}`,
        ).node.id;
    });
  };

  it('1. should create one custom object with standard relations', async () => {
    // Arrange
    const standardObjects = await makeMetadataAPIRequest(
      standardObjectsGraphqlOperation,
    );

    fillStandardObjectRelationsMapObjectMetadataId(standardObjects);

    const CUSTOM_OBJECT = {
      namePlural: `customObjects${uniqueSuffix}`,
      nameSingular: `customObject${uniqueSuffix}`,
      labelPlural: `Custom Objects ${uniqueSuffix}`,
      labelSingular: `Custom Object ${uniqueSuffix}`,
      description: 'Custom object description',
      icon: 'IconListNumbers',
      isLabelSyncedWithName: false,
    };

    // Act
    const { data } = await createOneObjectMetadata({
      expectToFail: false,
      input: CUSTOM_OBJECT,
      gqlFields: `
          id
          nameSingular
      `,
    });

    // Assert
    expect(data.createOneObject.nameSingular).toBe(CUSTOM_OBJECT.nameSingular);

    listingObjectId = data.createOneObject.id;

    const fields = await makeMetadataAPIRequest(fieldsGraphqlOperation);

    const relationFieldsMetadataForListing = fields.body.data.fields.edges
      .filter(
        // @ts-expect-error legacy noImplicitAny
        (field) =>
          (field.node.name === `${CUSTOM_OBJECT.nameSingular}` &&
            FieldMetadataType.RELATION) ||
          (field.node.name ===
            `target${capitalize(CUSTOM_OBJECT.nameSingular)}` &&
            FieldMetadataType.MORPH_RELATION),
      )
      // @ts-expect-error legacy noImplicitAny
      .map((field) => field.node);

    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
      // relation field
      const relationFieldMetadata = relationFieldsMetadataForListing.find(
        // @ts-expect-error legacy noImplicitAny
        (field) =>
          field.object.id ===
          // @ts-expect-error legacy noImplicitAny
          standardObjectRelationsMap[relation].objectMetadataId,
      );

      const relationFieldMetadataId = relationFieldMetadata?.id;

      expect(relationFieldMetadataId).not.toBeUndefined();

      // @ts-expect-error legacy noImplicitAny
      standardObjectRelationsMap[relation].relationFieldMetadataId =
        relationFieldMetadataId;
    });
  });

  it('2. should rename custom object', async () => {
    // Arrange
    const HOUSE_NAME_SINGULAR = `house${uniqueSuffix}`;
    const HOUSE_NAME_PLURAL = `houses${uniqueSuffix}`;
    const HOUSE_LABEL_SINGULAR = `House ${uniqueSuffix}`;
    const HOUSE_LABEL_PLURAL = `Houses ${uniqueSuffix}`;

    // Act
    const { data } = await updateOneObjectMetadata({
      expectToFail: false,
      gqlFields: `
        nameSingular
        labelSingular
        namePlural
        labelPlural
        `,
      input: {
        idToUpdate: listingObjectId,
        updatePayload: {
          nameSingular: HOUSE_NAME_SINGULAR,
          namePlural: HOUSE_NAME_PLURAL,
          labelSingular: HOUSE_LABEL_SINGULAR,
          labelPlural: HOUSE_LABEL_PLURAL,
        },
      },
    });

    // Assert
    expect(data.updateOneObject.nameSingular).toBe(HOUSE_NAME_SINGULAR);
    expect(data.updateOneObject.namePlural).toBe(HOUSE_NAME_PLURAL);
    expect(data.updateOneObject.labelSingular).toBe(HOUSE_LABEL_SINGULAR);
    expect(data.updateOneObject.labelPlural).toBe(HOUSE_LABEL_PLURAL);
  });

  it('3. should delete custom object', async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: listingObjectId,
        updatePayload: {
          isActive: false,
        },
      },
    });

    const { data } = await deleteOneObjectMetadata({
      input: {
        idToDelete: listingObjectId,
      },
    });

    expect(data.deleteOneObject.id).toBe(listingObjectId);
  });
});
