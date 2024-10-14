import gql from 'graphql-tag';
import { createOneObject, successfulApiRequest } from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

const updatePersonQuery = gql`
  mutation UpdatePerson($personId: ID!, $data: PersonUpdateInput!) {
    updatePerson(id: $personId, data: $data) {
      id
    }
  }
`;

const findCompanyQuery = gql`
  query Company($filter: CompanyFilterInput) {
    company(filter: $filter) {
      people {
        edges {
          node {
            id
            name {
              firstName
            }
            companyId
          }
        }
      }
    }
  }
`;

const findPersonQuery = gql`
  query Person($filter: PersonFilterInput) {
    person(filter: $filter) {
      company {
        id
        name
      }
    }
  }
`;

describe('personCompanyRelationResolver (integration)', () => {
  it('should create a company and a person and then update the person with companyId and query the company with person data', async () => {
    const companyName = generateRecordName();
    const companyId = await createOneObject('Company', {
      name: companyName,
    });

    const personName = generateRecordName();
    const personId = await createOneObject('Person', {
      name: {
        firstName: personName,
      },
    });

    await successfulApiRequest({
      query: updatePersonQuery,
      variables: {
        personId,
        data: {
          companyId,
        },
      },
    });

    const findCompanyResponse = await successfulApiRequest({
      query: findCompanyQuery,
      variables: {
        filter: {
          id: { eq: companyId },
        },
      },
    });

    const findPersonResponse = await successfulApiRequest({
      query: findPersonQuery,
      variables: {
        filter: {
          id: { eq: personId },
        },
      },
    });

    expect(findCompanyResponse.body.data.company).toEqual(
      expect.objectContaining({
        people: {
          edges: [
            {
              node: {
                id: personId,
                companyId,
                name: {
                  firstName: personName,
                },
              },
            },
          ],
        },
      }),
    );

    expect(findPersonResponse.body.data.person).toEqual(
      expect.objectContaining({
        company: {
          id: companyId,
          name: companyName,
        },
      }),
    );
  });
});
