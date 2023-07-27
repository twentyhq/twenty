import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import ApolloClient from 'apollo-boost';
import request from 'supertest';

import { AppModule } from 'src/app.module';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AbilityGuard } from 'src/guards/ability.guard';

export const client = new ApolloClient({
  uri: 'http://localhost:3000/graphql',
  onError: (e) => {
    console.log(e);
  },
});

describe('CompanyResolver (e2e)', () => {
  let app: INestApplication;

  const authGuardMock = { canActivate: (): any => true };
  const abilityGuardMock = { canActivate: (): any => true };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(authGuardMock)
      .overrideGuard(AbilityGuard)
      .useClass(abilityGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should create a company', () => {
    const createCompanyQuery = `
      mutation {
        createOneCompany(data: {name: "New Company", domainName: "new-company.com", address: "New Address"}) {
          id
          name
          domainName
          address
        }
      }
    `;

    return (
      request(app.getHttpServer())
        .post('/graphql')
        .send({ query: createCompanyQuery })
        // .expect(200)
        .expect((res) => {
          console.log('RES: ', res);
          const data = res.body.data.createOneCompany;
          expect(data).toHaveProperty('id');
          expect(data).toHaveProperty('name', 'New Company');
          expect(data).toHaveProperty('domainName', 'new-company.com');
          expect(data).toHaveProperty('address', 'New Address');
        })
    );
  });
});
