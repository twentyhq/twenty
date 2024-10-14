import gql from 'graphql-tag';
import {
  createManyObjects,
  successfulApiRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const updateCompaniesQuery = gql`
  mutation UpdateCompanies(
    $data: CompanyUpdateInput
    $filter: CompanyFilterInput
  ) {
    updateCompanies(data: $data, filter: $filter) {
      id
      name
    }
  }
`;

const findCompaniesQuery = gql`
  query Companies($filter: CompanyFilterInput) {
    companies(filter: $filter) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

describe('updateCompaniesResolver (integration)', () => {
  it('should update companies and persist the changes', async () => {
    const companiesIds = await createManyObjects('Company', [
      { name: generateRecordName() },
      { name: generateRecordName() },
    ]);

    const filter = {
      id: {
        in: companiesIds,
      },
    };

    const newName = generateRecordName();
    const updateCompaniesQueryData = {
      query: updateCompaniesQuery,
      variables: {
        data: {
          name: newName,
        },
        filter,
      },
    };

    const updateCompaniesResponse = await successfulApiRequest(
      updateCompaniesQueryData,
    );

    expect(updateCompaniesResponse.body.data.updateCompanies).toHaveLength(
      companiesIds.length,
    );

    const findCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter,
      },
    };

    const findCompaniesResponse = await successfulApiRequest(
      findCompaniesQueryData,
    );

    const edges = findCompaniesResponse.body.data.companies.edges;

    expect(edges).toHaveLength(companiesIds.length);

    edges.forEach((edge) => {
      expect(edge.node.name).toEqual(newName);
      expect(companiesIds).toContain(edge.node.id);
    });
  });
});
