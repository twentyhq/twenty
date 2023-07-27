import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';

import { createApp } from './utils/create-app';

describe('CompanyResolver (e2e)', () => {
  let app: INestApplication;
  let companyId: string | undefined;

  const authGuardMock = { canActivate: (): any => true };

  beforeEach(async () => {
    [app] = await createApp({
      moduleBuilderHook: (moduleBuilder) =>
        moduleBuilder.overrideGuard(JwtAuthGuard).useValue(authGuardMock),
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a company', () => {
    const queryData = {
      query: `
        mutation CreateOneCompany($data: CompanyCreateInput!) {
          createOneCompany(data: $data) {
            id
            name
            domainName
            address
          }
        }
      `,
      variables: {
        data: {
          name: 'New Company',
          domainName: 'new-company.com',
          address: 'New Address',
        },
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        const data = res.body.data.createOneCompany;

        companyId = data.id;

        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name', 'New Company');
        expect(data).toHaveProperty('domainName', 'new-company.com');
        expect(data).toHaveProperty('address', 'New Address');
      });
  });

  it('should find many companies', () => {
    const queryData = {
      query: `
        query FindManyCompany {
          findManyCompany {
            id
            name
            domainName
            address
          }
        }
      `,
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        const data = res.body.data.findManyCompany;
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThan(0);

        const company = data.find((c) => c.id === companyId);
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name', 'New Company');
        expect(company).toHaveProperty('domainName', 'new-company.com');
        expect(company).toHaveProperty('address', 'New Address');
      });
  });

  it('should find unique company', () => {
    const queryData = {
      query: `
        query FindUniqueCompany($id: String!) {
          findUniqueCompany(id: $id) {
            id
            name
            domainName
            address
          }
        }
      `,
      variables: {
        id: companyId,
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        const data = res.body.data.findUniqueCompany;

        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name', 'New Company');
        expect(data).toHaveProperty('domainName', 'new-company.com');
        expect(data).toHaveProperty('address', 'New Address');
      });
  });

  it('should update a company', () => {
    const queryData = {
      query: `
        mutation UpdateOneCompany($where: CompanyWhereUniqueInput!, $data: CompanyUpdateInput!) {
          updateOneCompany(data: $data, where: $where) {
            id
            name
            domainName
            address
          }
        }
      `,
      variables: {
        where: {
          id: companyId,
        },
        data: {
          name: 'Updated Company',
          domainName: 'updated-company.com',
          address: 'Updated Address',
        },
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        const data = res.body.data.updateOneCompany;

        expect(data).toHaveProperty('id');
        expect(data).toHaveProperty('name', 'Updated Company');
        expect(data).toHaveProperty('domainName', 'updated-company.com');
        expect(data).toHaveProperty('address', 'Updated Address');
      });
  });

  it('should delete a company', () => {
    const queryData = {
      query: `
        mutation DeleteManyCompany($ids: [String!]) {
          deleteManyCompany(where: {id: {in: $ids}}) {
            count
          }
        }
      `,
      variables: {
        ids: [companyId],
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send(queryData)
      .expect(200)
      .expect((res) => {
        const data = res.body.data.deleteManyCompany;

        companyId = undefined;

        expect(data).toHaveProperty('count', 1);
      });
  });
});
