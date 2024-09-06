import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { GraphQLSchema, printSchema } from 'graphql';

import { AppModule } from 'src/app.module';

describe('GraphQL Schema Debugging', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();

    console.log('Modules:', module);

    await app.init();

    const server = app.getHttpServer();
    // Assuming you have a way to access the schema
    // This is a simplified example
    const schema = app.get(GraphQLSchema);

    console.log(printSchema(schema));
  });

  afterAll(async () => {
    await app.close();
  });

  it('should print the schema', () => {
    expect(true).toBe(true);
  });
});
