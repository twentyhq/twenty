import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type ObjectPage = {
  data: {
    objects: {
      edges: {
        cursor: string;
        node: {
          id: string;
          fields: {
            edges: {
              cursor: string;
              node: { id: string; objectMetadataId: string; isUnique: boolean };
            }[];
            pageInfo: {
              hasNextPage: boolean;
              hasPreviousPage: boolean;
            };
          };
        };
      }[];
      pageInfo: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        startCursor: string | null;
        endCursor: string | null;
      };
    };
  } | null;
  errors?: { message: string }[];
};

const OBJECTS_WITH_FIELDS_QUERY = gql`
  query ObjectsWithFields($objectPaging: CursorPaging!) {
    objects(filter: { isActive: { is: true } }, paging: $objectPaging) {
      edges {
        cursor
        node {
          id
          fields(paging: { first: 1 }, filter: { isActive: { is: true } }) {
            edges {
              cursor
              node {
                id
                objectMetadataId
                isUnique
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

describe('metadata list pagination', () => {
  const queryObjects = async (paging: Record<string, unknown>) => {
    const response = await makeMetadataAPIRequest({
      query: OBJECTS_WITH_FIELDS_QUERY,
      variables: { objectPaging: paging },
    });

    return response.body as ObjectPage;
  };

  it('paginates top-level metadata forward and backward with opaque cursors', async () => {
    const firstPage = await queryObjects({ first: 1 });

    expect(firstPage.errors).toBeUndefined();
    expect(firstPage.data?.objects.edges).toHaveLength(1);
    expect(firstPage.data?.objects.pageInfo).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
    });

    const firstPageEndCursor = firstPage.data?.objects.pageInfo.endCursor;

    expect(firstPageEndCursor).toBeTruthy();

    const secondPage = await queryObjects({
      first: 1,
      after: firstPageEndCursor,
    });

    expect(secondPage.errors).toBeUndefined();
    expect(secondPage.data?.objects.edges).toHaveLength(1);
    expect(secondPage.data?.objects.pageInfo.hasPreviousPage).toBe(true);
    expect(secondPage.data?.objects.edges[0].node.id).not.toBe(
      firstPage.data?.objects.edges[0].node.id,
    );

    const secondPageStartCursor = secondPage.data?.objects.pageInfo.startCursor;
    const backPage = await queryObjects({
      last: 1,
      before: secondPageStartCursor,
    });

    expect(backPage.errors).toBeUndefined();
    expect(backPage.data?.objects.edges[0].node.id).toBe(
      firstPage.data?.objects.edges[0].node.id,
    );
    expect(backPage.data?.objects.pageInfo.hasNextPage).toBe(true);
  });

  it('paginates nested fields independently for every parent', async () => {
    const page = await queryObjects({ first: 2 });

    expect(page.errors).toBeUndefined();
    expect(page.data?.objects.edges).toHaveLength(2);

    for (const { node: objectMetadata } of page.data?.objects.edges ?? []) {
      expect(objectMetadata.fields.edges).toHaveLength(1);
      expect(objectMetadata.fields.edges[0].node.objectMetadataId).toBe(
        objectMetadata.id,
      );
      expect(objectMetadata.fields.edges[0].cursor).toBeTruthy();
      expect(objectMetadata.fields.pageInfo.hasPreviousPage).toBe(false);
    }
  });

  it('hydrates isUnique in top-level and nested field connections', async () => {
    const fieldsResponse = await makeMetadataAPIRequest({
      query: gql`
        query UniqueFields {
          fields(filter: { isActive: { is: true } }, paging: { first: 1000 }) {
            edges {
              node {
                id
                objectMetadataId
                isUnique
              }
            }
          }
        }
      `,
    });
    const uniqueField = fieldsResponse.body.data.fields.edges
      .map(
        ({ node }: { node: Record<string, unknown> }) =>
          node as {
            id: string;
            objectMetadataId: string;
            isUnique: boolean;
          },
      )
      .find(({ isUnique }: { isUnique: boolean }) => isUnique);

    expect(fieldsResponse.body.errors).toBeUndefined();
    expect(uniqueField).toBeDefined();

    const objectResponse = await makeMetadataAPIRequest({
      query: gql`
        query NestedUniqueField($fieldId: UUID!, $objectId: UUID!) {
          field(id: $fieldId) {
            id
            isUnique
          }
          object(id: $objectId) {
            fields(filter: { id: { eq: $fieldId } }, paging: { first: 1 }) {
              edges {
                node {
                  id
                  isUnique
                }
              }
            }
            indexMetadatas(paging: { first: 1 }) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      `,
      variables: {
        fieldId: uniqueField?.id,
        objectId: uniqueField?.objectMetadataId,
      },
    });

    expect(objectResponse.body.errors).toBeUndefined();
    expect(objectResponse.body.data.field).toEqual({
      id: uniqueField?.id,
      isUnique: true,
    });
    expect(objectResponse.body.data.object.fields.edges[0].node).toEqual({
      id: uniqueField?.id,
      isUnique: true,
    });
    expect(
      objectResponse.body.data.object.indexMetadatas.edges[0].node.id,
    ).toBeTruthy();
  });

  it('rejects malformed cursor IDs and invalid UUID operators as user input', async () => {
    const malformedCursor = Buffer.from(
      JSON.stringify({ id: 'not-a-uuid' }),
    ).toString('base64');
    const malformedCursorResponse = await queryObjects({
      first: 1,
      after: malformedCursor,
    });

    expect(malformedCursorResponse.data).toBeNull();
    expect(malformedCursorResponse.errors?.[0].message).toContain(
      'Invalid cursor',
    );

    const invalidFilterResponse = await makeMetadataAPIRequest({
      query: gql`
        query InvalidUuidFilter {
          objects(filter: { id: { is: true } }, paging: { first: 1 }) {
            edges {
              node {
                id
              }
            }
          }
        }
      `,
    });

    expect(invalidFilterResponse.body.data).toBeUndefined();
    expect(invalidFilterResponse.body.errors[0].message).toContain(
      'Field "is" is not defined by type "UUIDFilterComparison"',
    );
  });
});
