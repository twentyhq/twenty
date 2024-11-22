import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { createOneObjectMetadataFactory } from 'test/integration/metadata/suites/utils/create-one-object-metadata-factory.util';
import { createOneRelationMetadataFactory } from 'test/integration/metadata/suites/utils/create-one-relation-metadata-factory.util';
import { deleteOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/utils/delete-one-object-metadata-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { objectsMetadataFactory } from 'test/integration/metadata/suites/utils/objects-metadata-factory.util';
import { updateOneObjectMetadataItemFactory } from 'test/integration/metadata/suites/utils/update-one-object-metadata-factory.util';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

let listingObjectId = '';

describe('Custom object renaming', () => {
  it('1. should create one custom object', async () => {
    const LISTING_NAME_SINGULAR = 'listing';
    const LISTING_OBJECT = {
      namePlural: 'listings',
      nameSingular: LISTING_NAME_SINGULAR,
      labelPlural: 'Listings',
      labelSingular: 'Listing',
      description: 'Listing object',
      icon: 'IconListNumbers',
      isLabelSyncedWithName: false,
    };
    const graphqlOperation = createOneObjectMetadataFactory({
      input: { object: LISTING_OBJECT },
      gqlFields: `
          id
          nameSingular
      `,
    });

    const response = await makeMetadataAPIRequest(graphqlOperation);

    expect(response.body.data.createOneObject.nameSingular).toBe(
      LISTING_NAME_SINGULAR,
    );

    console.log(
      '************setting listingObjectId',
      response.body.data.createOneObject,
      response.body.data.createOneObject.id,
    );
    listingObjectId = response.body.data.createOneObject.id;
  });

  it('5. should create custom relation', async () => {
    // Fetching person object
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
    const standardObjects = await makeMetadataAPIRequest(
      standardObjectsGraphqlOperation,
    );

    const personObjectId = standardObjects.body.data.objects.edges.find(
      (object) => object.node.nameSingular === 'person',
    ).node.id;

    if (!personObjectId) {
      throw new Error('Person object not found');
    }

    // Create relation from listing to person
    const createRelationGraphqlOperation = createOneRelationMetadataFactory({
      input: {
        relation: {
          fromDescription: '',
          fromIcon: 'IconRelationOneToMany',
          fromLabel: 'Owner',
          fromName: 'owner',
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
      `,
    });

    await makeMetadataAPIRequest(createRelationGraphqlOperation);

    // Update listing name
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
            nameSingular: 'house',
            namePlural: 'houses',
            labelSingular: 'House',
            labelPlural: 'Houses',
          },
        },
      });

    const updateListingNameResponse = await makeMetadataAPIRequest(
      updateListingNameGraphqlOperation,
    );

    expect(
      updateListingNameResponse.body.data.updateOneObject.nameSingular,
    ).toBe('house');
    expect(updateListingNameResponse.body.data.updateOneObject.namePlural).toBe(
      'houses',
    );
    expect(
      updateListingNameResponse.body.data.updateOneObject.labelSingular,
    ).toBe('House');
    expect(
      updateListingNameResponse.body.data.updateOneObject.labelPlural,
    ).toBe('Houses');
  });

  it('5b. should delete relation', async () => {
    const graphqlOperation = deleteOneObjectMetadataItemFactory({
      idToDelete: listingObjectId,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteCar = response.body.data.deleteOneObject;

    expect(deleteCar.id).toBe(listingObjectId);
  });

  it('5c. should delete object', async () => {
    const graphqlOperation = deleteOneObjectMetadataItemFactory({
      idToDelete: listingObjectId,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteCar = response.body.data.deleteOneObject;

    expect(deleteCar.id).toBe(listingObjectId);
  });

  // it('5b. should delete one person', async () => {
  //   const graphqlOperation = deleteOneOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     recordId: PERSON_3_ID,
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.deletePerson.deletedAt).toBeTruthy();
  // });

  // it('6. should not find many people anymore', async () => {
  //   const graphqlOperation = findManyOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     objectMetadataPluralName: 'people',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         in: [PERSON_1_ID, PERSON_2_ID],
  //       },
  //     },
  //   });

  //   const findPeopleResponse = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(findPeopleResponse.body.data.people.edges).toHaveLength(0);
  // });

  // it('6b. should not find one person anymore', async () => {
  //   const graphqlOperation = findOneOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         eq: PERSON_3_ID,
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.person).toBeNull();
  // });

  // it('7. should find many deleted people with deletedAt filter', async () => {
  //   const graphqlOperation = findManyOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     objectMetadataPluralName: 'people',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         in: [PERSON_1_ID, PERSON_2_ID],
  //       },
  //       not: {
  //         deletedAt: {
  //           is: 'NULL',
  //         },
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.people.edges).toHaveLength(2);
  // });

  // it('7b. should find one deleted person with deletedAt filter', async () => {
  //   const graphqlOperation = findOneOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         eq: PERSON_3_ID,
  //       },
  //       not: {
  //         deletedAt: {
  //           is: 'NULL',
  //         },
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.person.id).toEqual(PERSON_3_ID);
  // });

  // it('8. should destroy many people', async () => {
  //   const graphqlOperation = destroyManyOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     objectMetadataPluralName: 'people',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         in: [PERSON_1_ID, PERSON_2_ID],
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.destroyPeople).toHaveLength(2);
  // });

  // it('8b. should destroy one person', async () => {
  //   const graphqlOperation = destroyOneOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     recordId: PERSON_3_ID,
  //   });

  //   const destroyPeopleResponse = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(destroyPeopleResponse.body.data.destroyPerson).toBeTruthy();
  // });

  // it('9. should not find many people anymore', async () => {
  //   const graphqlOperation = findManyOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     objectMetadataPluralName: 'people',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         in: [PERSON_1_ID, PERSON_2_ID],
  //       },
  //       not: {
  //         deletedAt: {
  //           is: 'NULL',
  //         },
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.people.edges).toHaveLength(0);
  // });

  // it('9b. should not find one person anymore', async () => {
  //   const graphqlOperation = findOneOperationFactory({
  //     objectMetadataSingularName: 'person',
  //     gqlFields: PERSON_GQL_FIELDS,
  //     filter: {
  //       id: {
  //         eq: PERSON_3_ID,
  //       },
  //       not: {
  //         deletedAt: {
  //           is: 'NULL',
  //         },
  //       },
  //     },
  //   });

  //   const response = await makeGraphqlAPIRequest(graphqlOperation);

  //   expect(response.body.data.person).toBeNull();
  // });
});
