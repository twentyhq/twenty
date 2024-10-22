import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

const FAVORITE_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const FAVORITE_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const FAVORITE_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';
const INITIAL_FAVORITE_POSITION_1 = 1111111;
const INITIAL_FAVORITE_POSITION_2 = 2222222;
const INITIAL_FAVORITE_POSITION_3 = 3333333;
const NEW_FAVORITE_POSITION_1 = 4444444;
const NEW_FAVORITE_POSITION_2 = 5555555;
const FAVORITE_GQL_FIELDS = `
    id
    position
    createdAt
    updatedAt
    deletedAt
    companyId
    personId
`;

describe('favorites resolvers (integration)', () => {
  it('1. should create and return favorites', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      data: [
        {
          id: FAVORITE_1_ID,
          position: INITIAL_FAVORITE_POSITION_1,
        },
        {
          id: FAVORITE_2_ID,
          position: INITIAL_FAVORITE_POSITION_2,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createFavorites).toHaveLength(2);

    response.body.data.createFavorites.forEach((favorite) => {
      expect(favorite).toHaveProperty('position');
      expect([
        INITIAL_FAVORITE_POSITION_1,
        INITIAL_FAVORITE_POSITION_2,
      ]).toContain(favorite.position);

      expect(favorite).toHaveProperty('id');
      expect(favorite).toHaveProperty('createdAt');
      expect(favorite).toHaveProperty('updatedAt');
      expect(favorite).toHaveProperty('deletedAt');
      expect(favorite).toHaveProperty('companyId');
      expect(favorite).toHaveProperty('personId');
    });
  });

  it('1b. should create and return one favorite', async () => {
    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      data: {
        id: FAVORITE_3_ID,
        position: INITIAL_FAVORITE_POSITION_3,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdFavorite = response.body.data.createFavorite;

    expect(createdFavorite).toHaveProperty('position');
    expect(createdFavorite.position).toEqual(INITIAL_FAVORITE_POSITION_3);

    expect(createdFavorite).toHaveProperty('id');
    expect(createdFavorite).toHaveProperty('createdAt');
    expect(createdFavorite).toHaveProperty('updatedAt');
    expect(createdFavorite).toHaveProperty('deletedAt');
    expect(createdFavorite).toHaveProperty('companyId');
    expect(createdFavorite).toHaveProperty('personId');
  });

  it('2. should find many favorites', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.favorites;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const favorite = edges[0].node;

      expect(favorite).toHaveProperty('position');
      expect(favorite).toHaveProperty('id');
      expect(favorite).toHaveProperty('createdAt');
      expect(favorite).toHaveProperty('updatedAt');
      expect(favorite).toHaveProperty('deletedAt');
      expect(favorite).toHaveProperty('companyId');
      expect(favorite).toHaveProperty('personId');
    }
  });

  it('2b. should find one favorite', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          eq: FAVORITE_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const favorite = response.body.data.favorite;

    expect(favorite).toHaveProperty('position');

    expect(favorite).toHaveProperty('id');
    expect(favorite).toHaveProperty('createdAt');
    expect(favorite).toHaveProperty('updatedAt');
    expect(favorite).toHaveProperty('deletedAt');
    expect(favorite).toHaveProperty('companyId');
    expect(favorite).toHaveProperty('personId');
  });

  it('3. should update many favorites', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      data: {
        position: NEW_FAVORITE_POSITION_1,
      },
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedFavorites = response.body.data.updateFavorites;

    expect(updatedFavorites).toHaveLength(2);

    updatedFavorites.forEach((favorite) => {
      expect(favorite.position).toEqual(NEW_FAVORITE_POSITION_1);
    });
  });

  it('3b. should update one favorite', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      data: {
        position: NEW_FAVORITE_POSITION_2,
      },
      recordId: FAVORITE_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedFavorite = response.body.data.updateFavorite;

    expect(updatedFavorite.position).toEqual(NEW_FAVORITE_POSITION_2);
  });

  it('4. should find many favorites with updated position', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        position: {
          eq: NEW_FAVORITE_POSITION_1,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorites.edges).toHaveLength(2);
  });

  it('4b. should find one favorite with updated position', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        position: {
          eq: NEW_FAVORITE_POSITION_2,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorite.position).toEqual(
      NEW_FAVORITE_POSITION_2,
    );
  });

  it('5. should delete many favorites', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deleteFavorites = response.body.data.deleteFavorites;

    expect(deleteFavorites).toHaveLength(2);

    deleteFavorites.forEach((favorite) => {
      expect(favorite.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one favorite', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      recordId: FAVORITE_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteFavorite.deletedAt).toBeTruthy();
  });

  it('6. should not find many favorites anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
      },
    });

    const findFavoritesResponse = await makeGraphqlAPIRequest(graphqlOperation);

    expect(findFavoritesResponse.body.data.favorites.edges).toHaveLength(0);
  });

  it('6b. should not find one favorite anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          eq: FAVORITE_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorite).toBeNull();
  });

  it('7. should find many deleted favorites with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorites.edges).toHaveLength(2);
  });

  it('7b. should find one deleted favorite with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          eq: FAVORITE_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorite.id).toEqual(FAVORITE_3_ID);
  });

  it('8. should destroy many favorites', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyFavorites).toHaveLength(2);
  });

  it('8b. should destroy one favorite', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      recordId: FAVORITE_3_ID,
    });

    const destroyFavoriteResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyFavoriteResponse.body.data.destroyFavorite).toBeTruthy();
  });

  it('9. should not find many favorites anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'favorite',
      objectMetadataPluralName: 'favorites',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          in: [FAVORITE_1_ID, FAVORITE_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorites.edges).toHaveLength(0);
  });

  it('9b. should not find one favorite anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'favorite',
      gqlFields: FAVORITE_GQL_FIELDS,
      filter: {
        id: {
          eq: FAVORITE_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.favorite).toBeNull();
  });
});
