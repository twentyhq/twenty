import { findManyFieldsMetadataQueryFactory } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata-query-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadataQueryFactory } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-query-factory.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneRelationMetadataFactory } from 'test/integration/metadata/suites/utils/create-one-relation-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

const LISTING_NAME_SINGULAR = 'listing';

describe('Custom object renaming', () => {
  let listingObjectId = '';

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
    const { data } = await createOneObjectMetadata({
      input: LISTING_OBJECT,
      gqlFields: `
          id
          nameSingular
      `,
    });

    // Assert
    expect(data.createOneObject.nameSingular).toBe(LISTING_NAME_SINGULAR);

    listingObjectId = data.createOneObject.id;

    const fields = await makeMetadataAPIRequest(fieldsGraphqlOperation);

    const relationFieldsMetadataForListing = fields.body.data.fields.edges
      .filter(
        (field) =>
          field.node.name === `${LISTING_NAME_SINGULAR}` &&
          field.node.type === FieldMetadataType.RELATION,
      )
      .map((field) => field.node);

    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
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
        relationMetadata: {
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
    relationFieldMetadataOnPersonId =
      relationResponse.body.data.createOneRelationMetadata.fromFieldMetadataId;
  });

  it('3. should rename custom object', async () => {
    // Arrange
    const HOUSE_NAME_SINGULAR = 'house';
    const HOUSE_NAME_PLURAL = 'houses';
    const HOUSE_LABEL_SINGULAR = 'House';
    const HOUSE_LABEL_PLURAL = 'Houses';

    // Act
    const { data } = await updateOneObjectMetadata({
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

    const fieldsResponse = await makeMetadataAPIRequest(fieldsGraphqlOperation);

    const fieldsMetadata = fieldsResponse.body.data.fields.edges.map(
      (field) => field.node,
    );

    // standard relations have been updated
    STANDARD_OBJECT_RELATIONS.forEach((relation) => {
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

  it('4. should delete custom object', async () => {
    const { data } = await deleteOneObjectMetadata({
      input: {
        idToDelete: listingObjectId,
      },
    });

    expect(data.deleteOneObject.id).toBe(listingObjectId);
  });
});
