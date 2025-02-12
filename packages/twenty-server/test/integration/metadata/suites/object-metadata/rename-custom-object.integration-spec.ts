import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata-factory.util';
import { deleteOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata-factory.util';
import { objectsMetadataFactory } from 'test/integration/metadata/suites/object-metadata/utils/objects-metadata-factory.util';
import { updateOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata-factory.util';
import { createOneRelationMetadataFactory } from 'test/integration/metadata/suites/utils/create-one-relation-metadata-factory.util';
import { deleteOneRelationMetadataItemFactory } from 'test/integration/metadata/suites/utils/delete-one-relation-metadata-factory.util';
import { fieldsMetadataFactory } from 'test/integration/metadata/suites/utils/fields-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
const LISTING_NAME_SINGULAR = 'listing';

describe('Custom object renaming', () => {
  let listingObjectId = '';
  let customRelationId = '';

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

  const standardObjectsGraphqlOperation = objectsMetadataFactory({
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

  const fieldsGraphqlOperation = fieldsMetadataFactory({
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

  const fillStandardObjectRelationsMapObjectMetadataId = (standardObjects) => {
    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
      standardObjectRelationsMap[relation].objectMetadataId =
        standardObjects.body.data.objects.edges.find(
          (object) => object.node.nameSingular === relation,
        ).node.id;
    });
  };

  it('1. should create one custom object with standard relations', async () => {
    // Arrange
    const standardObjects = await makeMetadataAPIRequest(
      standardObjectsGraphqlOperation,
    );

    fillStandardObjectRelationsMapObjectMetadataId(standardObjects);

    const LISTING_OBJECT = {
      namePlural: 'listings',
      nameSingular: LISTING_NAME_SINGULAR,
      labelPlural: 'Listings',
      labelSingular: 'Listing',
      description: 'Listing object',
      icon: 'IconListNumbers',
      isLabelSyncedWithName: false,
    };

    // Act
    const graphqlOperation = createOneObjectMetadataFactory({
      input: { object: LISTING_OBJECT },
      gqlFields: `
          id
          nameSingular
      `,
    });

    const response = await makeMetadataAPIRequest(graphqlOperation);

    // Assert
    expect(response.body.data.createOneObject.nameSingular).toBe(
      LISTING_NAME_SINGULAR,
    );

    listingObjectId = response.body.data.createOneObject.id;

    const fields = await makeMetadataAPIRequest(fieldsGraphqlOperation);

    const foreignKeyFieldsMetadataForListing = fields.body.data.fields.edges
      .filter((field) => field.node.name === `${LISTING_NAME_SINGULAR}Id`)
      .map((field) => field.node);

    const relationFieldsMetadataForListing = fields.body.data.fields.edges
      .filter(
        (field) =>
          field.node.name === `${LISTING_NAME_SINGULAR}` &&
          field.node.type === FieldMetadataType.RELATION,
      )
      .map((field) => field.node);

    expect(foreignKeyFieldsMetadataForListing.length).toBe(5);

    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
      // foreignKey field
      const foreignKeyFieldMetadataId = foreignKeyFieldsMetadataForListing.find(
        (field) =>
          field.object.id ===
          standardObjectRelationsMap[relation].objectMetadataId,
      ).id;

      expect(foreignKeyFieldMetadataId).not.toBeUndefined();

      standardObjectRelationsMap[relation].foreignKeyFieldMetadataId =
        foreignKeyFieldMetadataId;

      // relation field
      const relationFieldMetadataId = relationFieldsMetadataForListing.find(
        (field) =>
          field.object.id ===
          standardObjectRelationsMap[relation].objectMetadataId,
      ).id;

      expect(relationFieldMetadataId).not.toBeUndefined();

      standardObjectRelationsMap[relation].relationFieldMetadataId =
        relationFieldMetadataId;
    });
  });

  let relationFieldMetadataOnPersonId = '';
  const RELATION_FROM_NAME = 'guest';

  it('2. should create a custom relation with the custom object', async () => {
    // Arrange
    const standardObjects = await makeMetadataAPIRequest(
      standardObjectsGraphqlOperation,
    );
    const personObjectId = standardObjects.body.data.objects.edges.find(
      (object) => object.node.nameSingular === 'person',
    ).node.id;

    // Act
    const createRelationGraphqlOperation = createOneRelationMetadataFactory({
      input: {
        relation: {
          fromDescription: '',
          fromIcon: 'IconRelationOneToMany',
          fromLabel: 'Guest',
          fromName: RELATION_FROM_NAME,
          fromObjectMetadataId: listingObjectId,
          relationType: RelationMetadataType.ONE_TO_MANY,
          toDescription: undefined,
          toIcon: 'IconListNumbers',
          toLabel: 'Property',
          toName: 'property',
          toObjectMetadataId: personObjectId,
        },
      },
      gqlFields: `
        id
        fromFieldMetadataId
      `,
    });

    const relationResponse = await makeMetadataAPIRequest(
      createRelationGraphqlOperation,
    );

    // Assert
    customRelationId = relationResponse.body.data.createOneRelation.id;

    relationFieldMetadataOnPersonId =
      relationResponse.body.data.createOneRelation.fromFieldMetadataId;
  });

  it('3. should rename custom object', async () => {
    // Arrange
    const HOUSE_NAME_SINGULAR = 'house';
    const HOUSE_NAME_PLURAL = 'houses';
    const HOUSE_LABEL_SINGULAR = 'House';
    const HOUSE_LABEL_PLURAL = 'Houses';
    const updateListingNameGraphqlOperation =
      updateOneObjectMetadataItemFactory({
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

    // Act
    const updateListingNameResponse = await makeMetadataAPIRequest(
      updateListingNameGraphqlOperation,
    );

    // Assert
    expect(
      updateListingNameResponse.body.data.updateOneObject.nameSingular,
    ).toBe(HOUSE_NAME_SINGULAR);
    expect(updateListingNameResponse.body.data.updateOneObject.namePlural).toBe(
      HOUSE_NAME_PLURAL,
    );
    expect(
      updateListingNameResponse.body.data.updateOneObject.labelSingular,
    ).toBe(HOUSE_LABEL_SINGULAR);
    expect(
      updateListingNameResponse.body.data.updateOneObject.labelPlural,
    ).toBe(HOUSE_LABEL_PLURAL);

    const fieldsResponse = await makeMetadataAPIRequest(fieldsGraphqlOperation);

    const fieldsMetadata = fieldsResponse.body.data.fields.edges.map(
      (field) => field.node,
    );

    expect(
      fieldsMetadata.find(
        (field) => field.name === `${LISTING_NAME_SINGULAR}Id`,
      ),
    ).toBeUndefined();

    // standard relations have been updated
    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
      // foreignKey field
      const foreignKeyFieldMetadataId =
        standardObjectRelationsMap[relation].foreignKeyFieldMetadataId;

      const updatedForeignKeyFieldMetadata = fieldsMetadata.find(
        (field) => field.id === foreignKeyFieldMetadataId,
      );

      expect(updatedForeignKeyFieldMetadata.name).toBe(
        `${HOUSE_NAME_SINGULAR}Id`,
      );
      expect(updatedForeignKeyFieldMetadata.label).toBe(
        'House ID (foreign key)',
      );

      // relation field
      const relationFieldMetadataId =
        standardObjectRelationsMap[relation].relationFieldMetadataId;

      const updatedRelationFieldMetadataId = fieldsMetadata.find(
        (field) => field.id === relationFieldMetadataId,
      );

      expect(updatedRelationFieldMetadataId.name).toBe(HOUSE_NAME_SINGULAR);
      expect(updatedRelationFieldMetadataId.label).toBe(HOUSE_LABEL_SINGULAR);
    });

    // custom relation are unchanged
    const updatedRelationFieldMetadata = fieldsMetadata.find(
      (field) => field.id === relationFieldMetadataOnPersonId,
    );

    expect(updatedRelationFieldMetadata.name).toBe(RELATION_FROM_NAME);
  });

  it('4. should delete custom relation', async () => {
    const graphqlOperation = deleteOneRelationMetadataItemFactory({
      idToDelete: customRelationId,
    });

    const response = await makeMetadataAPIRequest(graphqlOperation);

    const deleteRelationResponse = response.body.data.deleteOneRelation;

    expect(deleteRelationResponse.id).toBe(customRelationId);
  });

  it('5. should delete custom object', async () => {
    const graphqlOperation = deleteOneObjectMetadataItemFactory({
      idToDelete: listingObjectId,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteListingResponse = response.body.data.deleteOneObject;

    expect(deleteListingResponse.id).toBe(listingObjectId);
  });
});
