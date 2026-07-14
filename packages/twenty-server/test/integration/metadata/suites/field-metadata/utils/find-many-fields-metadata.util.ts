import gql from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';
import { warnIfErrorButNotExpectedToFail } from 'test/integration/metadata/utils/warn-if-error-but-not-expected-to-fail.util';
import { warnIfNoErrorButExpectedToFail } from 'test/integration/metadata/utils/warn-if-no-error-but-expected-to-fail.util';

type UuidComparison = { eq?: string; in?: string[] };

export type FindManyFieldsMetadataFactoryInput = {
  filter: {
    id?: UuidComparison;
    objectMetadataId?: UuidComparison;
  };
  paging: { first?: number };
};

type FieldNode = { id: string; objectMetadataId: string };

// The top-level `fields` query was removed together with the field-metadata
// nestjs-query auto-resolver. Fields are now read through `objects { fieldsList }`
// and the id / objectMetadataId filtering that used to be a server-side
// FieldFilter is applied here, keeping the `{ node }` edge-shaped, loosely-typed
// result the existing suites rely on.
const matchesFilter = (
  field: FieldNode,
  filter: FindManyFieldsMetadataFactoryInput['filter'],
): boolean => {
  const { id, objectMetadataId } = filter;

  if (id?.eq !== undefined && field.id !== id.eq) {
    return false;
  }

  if (id?.in !== undefined && !id.in.includes(field.id)) {
    return false;
  }

  if (
    objectMetadataId?.eq !== undefined &&
    field.objectMetadataId !== objectMetadataId.eq
  ) {
    return false;
  }

  return true;
};

export const findManyFieldsMetadata = async ({
  input,
  gqlFields = 'id',
  expectToFail,
  token,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => {
  const graphqlOperation = {
    query: gql`
      query FieldsMetadata($paging: CursorPaging!) {
        objects(paging: $paging) {
          edges {
            node {
              fieldsList {
                id
                objectMetadataId
                ${gqlFields}
              }
            }
          }
        }
      }
    `,
    variables: {
      paging: { first: 1000 },
    },
  };

  const response = await makeMetadataAPIRequest(graphqlOperation, token);

  if (expectToFail === true) {
    warnIfNoErrorButExpectedToFail({
      response,
      errorMessage: 'Field Metadata retrieval should have failed but did not',
    });
  }

  if (expectToFail === false) {
    warnIfErrorButNotExpectedToFail({
      errorMessage: 'Field metadata retrieval should not have failed',
      response,
    });
  }

  const edges: { node: { fieldsList?: FieldNode[] } }[] =
    response.body.data?.objects?.edges ?? [];

  const allFields = edges.flatMap((edge) => edge.node.fieldsList ?? []);

  const filteredFields = allFields
    .filter((field) => matchesFilter(field, input.filter))
    .slice(0, input.paging.first ?? allFields.length);

  return {
    errors: response.body.errors,
    // Kept loosely typed (like the previous top-level `fields` query helper) so
    // callers can select and read arbitrary field shapes off each `{ node }`.
    // oxlint-disable-next-line typescript/no-explicit-any
    fields: filteredFields.map((node) => ({ node })) as any,
  };
};
