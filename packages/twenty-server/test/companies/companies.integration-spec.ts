import {
  createCompaniesMutation,
  createCompanyMutation,
  deleteCompaniesMutation,
  deleteCompanyMutation,
  destroyCompaniesMutation,
  destroyCompanyMutation,
  findAllCompaniesQuery,
  findCompaniesWithFilterQuery,
  findCompanyQuery,
  findCompanyWithFilterQuery,
  findCompanyWithPeopleRelationQuery,
  findPersonWithCompanyRelationQuery,
  updateCompaniesMutation,
  updatePersonMutation,
} from 'test/companies/companies.integration-constants';
import {
  createManyObjects,
  createOneObject,
  expectSuccessfullGraphqlAPIRequest,
  makeGraphqlAPIRequest,
} from 'test/utils/api-requests';
import { generateRecordName } from 'test/utils/generate-record-name';

describe('companies resolvers (integration)', () => {
  describe('createCompaniesResolver (integration)', () => {
    it('should create and return companies', async () => {
      const companyName1 = generateRecordName();
      const companyName2 = generateRecordName();

      const queryData = {
        query: createCompaniesMutation,
        variables: {
          data: [
            {
              name: companyName1,
            },
            {
              name: companyName2,
            },
          ],
        },
      };

      const createdCompanies =
        await expectSuccessfullGraphqlAPIRequest(queryData);

      expect(createdCompanies.body.data.createCompanies).toHaveLength(2);

      createdCompanies.body.data.createCompanies.forEach((company) => {
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
  });

  describe('createCompanyResolver (integration)', () => {
    it('should create and return a company', () => {
      const companyName = generateRecordName();
      const queryData = {
        query: createCompanyMutation,
        variables: {
          data: {
            name: companyName,
          },
        },
      };

      return expectSuccessfullGraphqlAPIRequest(queryData).expect((res) => {
        const createdCompany = res.body.data.createCompany;

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
    });
  });

  describe('deleteCompaniesResolver (integration)', () => {
    it('should delete companies and hide them from simple queries', async () => {
      const companiesIds = await createManyObjects('Company', [
        { name: generateRecordName() },
        { name: generateRecordName() },
      ]);

      const filter = {
        id: {
          in: companiesIds,
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

      expect(deleteCompanies).toHaveLength(companiesIds.length);

      deleteCompanies.forEach((company) => {
        expect(company.deletedAt).toBeTruthy();
      });

      const findCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter,
        },
      };

      const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest(
        findCompaniesQueryData,
      );

      expect(findCompaniesResponse.body.data.companies.edges).toHaveLength(0);

      const findDeletedCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter: {
            id: {
              in: companiesIds,
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

      expect(
        findDeletedCompaniesResponse.body.data.companies.edges,
      ).toHaveLength(companiesIds.length);
    });
  });

  describe('deleteCompanyResolver (integration)', () => {
    it('should delete a company and hide it from simple queries', async () => {
      const companyName = generateRecordName();
      const createdCompanyId = await createOneObject('Company', {
        name: companyName,
      });

      const deleteCompanyQueryData = {
        query: deleteCompanyMutation,
        variables: {
          companyId: createdCompanyId,
        },
      };

      const deleteCompanyResponse = await expectSuccessfullGraphqlAPIRequest(
        deleteCompanyQueryData,
      );

      expect(
        deleteCompanyResponse.body.data.deleteCompany.deletedAt,
      ).toBeTruthy();

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

      const findCompanyResponse =
        await makeGraphqlAPIRequest(findCompanyQueryData);

      expect(findCompanyResponse.body.data.company).toBeNull();

      const findCompaniesResponse = await expectSuccessfullGraphqlAPIRequest({
        query: findCompaniesWithFilterQuery,
      });

      expect(
        findCompaniesResponse.body.data.companies.edges.filter(
          (c) => c.node.id === createdCompanyId,
        ),
      ).toHaveLength(0);

      const findDeletedCompanyQueryData = {
        query: findCompanyQuery,
        variables: {
          filter: {
            id: {
              eq: createdCompanyId,
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
        createdCompanyId,
      );
    });
  });

  describe('destroyCompaniesResolver (integration)', () => {
    it('should destroy companies and hide them from simple queries', async () => {
      const companiesIds = await createManyObjects('Company', [
        { name: generateRecordName() },
        { name: generateRecordName() },
      ]);

      const filter = {
        id: {
          in: companiesIds,
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

      expect(
        findCompaniesResponse.body.data.companies.edges.filter((c) =>
          companiesIds.includes(c.node.id),
        ),
      ).toHaveLength(0);

      const findDeletedCompaniesQueryData = {
        query: findCompaniesWithFilterQuery,
        variables: {
          filter: {
            id: {
              in: companiesIds,
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
      const companyName = generateRecordName();
      const createdCompanyId = await createOneObject('Company', {
        name: companyName,
      });

      const destroyCompanyQueryData = {
        query: destroyCompanyMutation,
        variables: {
          companyId: createdCompanyId,
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
              eq: createdCompanyId,
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
          (c) => c.node.id === createdCompanyId,
        ),
      ).toHaveLength(0);

      const findDeletedCompanyQueryData = {
        query: findCompanyQuery,
        variables: {
          filter: {
            id: {
              eq: createdCompanyId,
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

  describe('companiesResolver (integration)', () => {
    it('should find many companies', () => {
      return expectSuccessfullGraphqlAPIRequest({
        query: findAllCompaniesQuery,
      }).expect((res) => {
        const data = res.body.data.companies;

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
    });
  });

  describe('findOneCompanyResolver (integration)', () => {
    it('should find one company', async () => {
      const companyName = generateRecordName();
      const createdCompanyId = await createOneObject('Company', {
        name: companyName,
      });
      const findOneCompanyQueryData = {
        query: findCompanyWithFilterQuery,
        variables: {
          filter: {
            id: {
              eq: createdCompanyId,
            },
          },
        },
      };

      expectSuccessfullGraphqlAPIRequest(findOneCompanyQueryData).expect(
        (res) => {
          const company = res.body.data.company;

          expect(company).toHaveProperty('name');
          expect(company.name).toEqual(companyName);

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
