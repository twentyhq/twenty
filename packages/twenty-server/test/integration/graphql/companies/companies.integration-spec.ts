import {
  createCompaniesMutation,
  createCompanyMutation,
  deleteCompaniesMutation,
  deleteCompanyMutation,
  destroyCompaniesMutation,
  destroyCompanyMutation,
  findCompaniesQuery,
  findCompanyQuery,
  findCompanyWithPeopleRelationQuery,
  findPersonWithCompanyRelationQuery,
  updateCompaniesMutation,
  updatePersonMutation,
} from 'test/integration/graphql/companies/companies.integration-queries';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import { makeGraphqlAPIRequest } from 'test/integration/utils/make-graphql-api-request';

const COMPANY_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const COMPANY_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const COMPANY_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

describe('companies resolvers (integration)', () => {
  it('1. should create and return companies', async () => {
    const companyName1 = generateRecordName(COMPANY_1_ID);
    const companyName2 = generateRecordName(COMPANY_2_ID);

    const graphqlOperation = {
      query: createCompaniesMutation,
      variables: {
        data: [
          {
            id: COMPANY_1_ID,
            name: companyName1,
          },
          {
            id: COMPANY_2_ID,
            name: companyName2,
          },
        ],
      },
    };

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createCompanies).toHaveLength(2);

    response.body.data.createCompanies.forEach((company) => {
      expect(company).toHaveProperty('name');
      expect([companyName1, companyName2]).toContain(company.name);

      expect(company).toHaveProperty('employees');
      expect(company).toHaveProperty('idealCustomerProfile');
      expect(company).toHaveProperty('position');
      expect(company).toHaveProperty('id');
      expect(company).toHaveProperty('createdAt');
      expect(company).toHaveProperty('updatedAt');
      expect(company).toHaveProperty('deletedAt');
      expect(company).toHaveProperty('accountOwnerId');
      expect(company).toHaveProperty('tagline');
      expect(company).toHaveProperty('workPolicy');
      expect(company).toHaveProperty('visaSponsorship');
    });
  });

  describe('1b. should create and return one company', async () => {
    const companyName = generateRecordName(COMPANY_3_ID);

    const graphqlOperation = {
      query: createCompanyMutation,
      variables: {
        data: {
          id: COMPANY_3_ID,
          name: companyName,
        },
      },
    };

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdCompany = response.body.data.createCompany;

    expect(createdCompany).toHaveProperty('name');
    expect(createdCompany.name).toEqual(companyName);

    expect(createdCompany).toHaveProperty('employees');
    expect(createdCompany).toHaveProperty('idealCustomerProfile');
    expect(createdCompany).toHaveProperty('position');
    expect(createdCompany).toHaveProperty('id');
    expect(createdCompany).toHaveProperty('createdAt');
    expect(createdCompany).toHaveProperty('updatedAt');
    expect(createdCompany).toHaveProperty('deletedAt');
    expect(createdCompany).toHaveProperty('accountOwnerId');
    expect(createdCompany).toHaveProperty('tagline');
    expect(createdCompany).toHaveProperty('workPolicy');
    expect(createdCompany).toHaveProperty('visaSponsorship');
  });

  it('2. should find many companies', async () => {
    const findCompaniesQueryData = {
      query: findCompaniesQuery,
    };

    const result = await makeGraphqlAPIRequest(findCompaniesQueryData);

    const data = result.body.data.companies;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    const edges = data.edges;

    if (edges.length > 0) {
      const companies = edges[0].node;

      expect(companies).toHaveProperty('name');
      expect(companies).toHaveProperty('employees');
      expect(companies).toHaveProperty('idealCustomerProfile');
      expect(companies).toHaveProperty('position');
      expect(companies).toHaveProperty('id');
      expect(companies).toHaveProperty('createdAt');
      expect(companies).toHaveProperty('updatedAt');
      expect(companies).toHaveProperty('deletedAt');
      expect(companies).toHaveProperty('accountOwnerId');
      expect(companies).toHaveProperty('tagline');
      expect(companies).toHaveProperty('workPolicy');
      expect(companies).toHaveProperty('visaSponsorship');
    }
  });

  it('2b. should find one company', async () => {
    const findOneCompanyQueryData = {
      query: findCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: COMPANY_3_ID,
          },
        },
      },
    };

    expectSuccessfullGraphqlAPIRequest(findOneCompanyQueryData).expect(
      (res) => {
        const company = res.body.data.company;

        expect(company).toHaveProperty('name');

        expect(company).toHaveProperty('employees');
        expect(company).toHaveProperty('idealCustomerProfile');
        expect(company).toHaveProperty('position');
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('createdAt');
        expect(company).toHaveProperty('updatedAt');
        expect(company).toHaveProperty('deletedAt');
        expect(company).toHaveProperty('accountOwnerId');
        expect(company).toHaveProperty('tagline');
        expect(company).toHaveProperty('workPolicy');
        expect(company).toHaveProperty('visaSponsorship');
      },
    );
  });

  it('3. should delete many companies', async () => {
    const filter = {
      id: {
        in: [COMPANY_1_ID, COMPANY_2_ID],
      },
    };

    const deleteCompaniesQueryData = {
      query: deleteCompaniesMutation,
      variables: {
        filter,
      },
    };

    const deleteCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
      deleteCompaniesQueryData,
    );

    const deleteCompanies = deleteCompaniesResponse.body.data.deleteCompanies;

    expect(deleteCompanies).toHaveLength(2);

    deleteCompanies.forEach((company) => {
      expect(company.deletedAt).toBeTruthy();
    });
  });

  it('3b. should delete one company', async () => {
    const deleteCompanyQueryData = {
      query: deleteCompanyMutation,
      variables: {
        companyId: COMPANY_3_ID,
      },
    };

    const deleteCompanyResponse = await expectSuccessfullGraphqlAPIRequest(
      deleteCompanyQueryData,
    );

    expect(
      deleteCompanyResponse.body.data.deleteCompany.deletedAt,
    ).toBeTruthy();
  });

  it('4. should not find many companies anymore', async () => {
    const filter = {
      id: {
        in: [COMPANY_1_ID, COMPANY_2_ID],
      },
    };

    const findCompaniesQueryData = {
      query: findCompaniesQuery,
      variables: {
        filter,
      },
    };

    const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
      findCompaniesQueryData,
    );

    expect(findCompaniesResponse.body.data.companies.edges).toHaveLength(0);
  });

  it('4b. should not find one company anymore', async () => {
    const findCompanyQueryData = {
      query: findCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: COMPANY_3_ID,
          },
        },
      },
    };
    const findCompanyResponse =
      await makeGraphqlAPIRequest(findCompanyQueryData);

    expect(findCompanyResponse.body.data.company).toBeNull();

    expect(
      findCompaniesResponse.body.data.companies.edges.filter(
        (c) => c.node.id === COMPANY_3_ID,
      ),
    ).toHaveLength(0);
  });

  it('5. should find many deleted companies with deletedAt filter', async () => {
    const findDeletedCompaniesQueryData = {
      query: findCompaniesWithFilterQuery,
      variables: {
        filter: {
          id: {
            in: [COMPANY_1_ID, COMPANY_2_ID],
          },
          not: {
            deletedAt: {
              is: 'NULL',
            },
          },
        },
      },
    };

    const findDeletedCompaniesResponse =
      await expectSuccessfullGraphqlAPIRequest(findDeletedCompaniesQueryData);

    expect(findDeletedCompaniesResponse.body.data.companies.edges).toHaveLength(
      2,
    );
  });

  it('should find the deleted company with deletedAt filter', async () => {
    const findDeletedCompanyQueryData = {
      query: findCompanyQuery,
      variables: {
        filter: {
          id: {
            eq: COMPANY_3_ID,
          },
          not: {
            deletedAt: {
              is: 'NULL',
            },
          },
        },
      },
    };

    const findDeletedCompanyResponse = await makeGraphqlAPIRequest(
      findDeletedCompanyQueryData,
    );

    expect(findDeletedCompanyResponse.body.data.company.id).toEqual(
      COMPANY_3_ID,
    );
  });

  describe('destroyCompaniesResolver (integration)', () => {
    it('should destroy companies and hide them from simple queries', async () => {
      const filter = {
        id: {
          in: [COMPANY_1_ID, COMPANY_2_ID],
        },
      };

      const destroyCompaniesQueryData = {
        query: destroyCompaniesMutation,
        variables: {
          filter,
        },
      };

      const destroyCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
        destroyCompaniesQueryData,
      );

      expect(destroyCompaniesResponse.body.data.destroyCompanies).toHaveLength(
        2,
      );

      const findCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter,
        },
      };

      const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
        findCompaniesQueryData,
      );

      expect(
        findCompaniesResponse.body.data.companies.edges.filter((c) =>
          [COMPANY_1_ID, COMPANY_2_ID].includes(c.node.id),
        ),
      ).toHaveLength(0);

      const findDeletedCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter: {
            id: {
              in: [COMPANY_1_ID, COMPANY_2_ID],
            },
            not: {
              deletedAt: {
                is: 'NULL',
              },
            },
          },
        },
      };

      const findDeletedCompaniesResponse = await makeGraphqlAPIRequest(
        findDeletedCompaniesQueryData,
      );

      expect(
        findDeletedCompaniesResponse.body.data.companies.edges,
      ).toHaveLength(0);
    });
  });

  describe('destroyCompanyResolver (integration)', () => {
    it('should destroy a company and hide it from simple queries', async () => {
      const destroyCompanyQueryData = {
        query: destroyCompanyMutation,
        variables: {
          companyId: COMPANY_3_ID,
        },
      };

      const destroyCompanyResponse = await expectSuccessfullGraphqlAPIRequest(
        destroyCompanyQueryData,
      );

      expect(destroyCompanyResponse.body.data.destroyCompany).toBeTruthy();

      const findCompanyQueryData = {
        query: findCompanyQuery,
        variables: {
          filter: {
            id: {
              eq: COMPANY_3_ID,
            },
          },
        },
      };

      const findCompanyResponse =
        await makeGraphqlAPIRequest(findCompanyQueryData);

      expect(findCompanyResponse.body.data.company).toBeNull();

      const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest({
        query: findCompaniesWithFilterQuery,
      });

      expect(
        findCompaniesResponse.body.data.companies.edges.filter(
          (c) => c.node.id === COMPANY_3_ID,
        ),
      ).toHaveLength(0);

      const findDeletedCompanyQueryData = {
        query: findCompanyQuery,
        variables: {
          filter: {
            id: {
              eq: COMPANY_3_ID,
            },
            not: {
              deletedAt: {
                is: 'NULL',
              },
            },
          },
        },
      };

      const findDeletedCompanyResponse = await makeGraphqlAPIRequest(
        findDeletedCompanyQueryData,
      );

      expect(findDeletedCompanyResponse.body.data.company).toBeNull();
    });
  });

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

      await expectSuccessfullGraphqlAPIRequest({
        query: updatePersonMutation,
        variables: {
          personId,
          data: {
            companyId,
          },
        },
      });

      const findCompanyResponse = await expectSuccessfullGraphqlAPIRequest({
        query: findCompanyWithPeopleRelationQuery,
        variables: {
          filter: {
            id: { eq: companyId },
          },
        },
      });

      const findPersonResponse = await expectSuccessfullGraphqlAPIRequest({
        query: findPersonWithCompanyRelationQuery,
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
        query: updateCompaniesMutation,
        variables: {
          data: {
            name: newName,
          },
          filter,
        },
      };

      const updateCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
        updateCompaniesQueryData,
      );

      expect(updateCompaniesResponse.body.data.updateCompanies).toHaveLength(
        companiesIds.length,
      );

      const findCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter,
        },
      };

      const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
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

  describe('updateCompanyResolver (integration)', () => {
    it('should update and persist the company update', async () => {
      const companyName = generateRecordName();
      const createdCompanyId = await createOneObject('Company', {
        name: companyName,
      });
      const updateCompanyQueryData = {
        query: updateCompaniesMutation,
        variables: {
          companyId: createdCompanyId,
          data: {
            name: companyName,
          },
        },
      };

      expectSuccessfullGraphqlAPIRequest(updateCompanyQueryData).expect(
        (res) => {
          const updatedCompany = res.body.data.updateCompany;

          expect(updatedCompany).toHaveProperty('name');
          expect(updatedCompany.name).toEqual(companyName);
        },
      );

      const findCompanyQueryData = {
        query: findCompanyQuery,
        variables: {
          filter: {
            id: {
              eq: createdCompanyId,
            },
          },
        },
      };

      expectSuccessfullGraphqlAPIRequest(findCompanyQueryData).expect((res) => {
        const company = res.body.data.company;

        expect(company).toHaveProperty('name');
        expect(company.name).toEqual(companyName);
      });
    });
  });
});
