import { INestApplication } from '@nestjs/common';
import {
    GraphQLSchemaHost
} from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { GraphQLObjectType, GraphQLSchema } from 'graphql';

describe('IMAGE Field GraphQL Schema (Contract Test)', () => {
  let app: INestApplication;
  let schema: GraphQLSchema;

  beforeAll(async () => {
    // This test verifies that the IMAGE composite type generates the correct GraphQL schema
    // It MUST FAIL until the imageCompositeType is registered and schema generation works
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Import the actual workspace schema factory module
      // imports: [WorkspaceSchemaModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get the generated GraphQL schema
    const schemaHost = app.get(GraphQLSchemaHost);
    schema = schemaHost.schema;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('ImageField type', () => {
    it('should exist in the GraphQL schema', () => {
      const imageFieldType = schema.getType('ImageField');
      
      expect(imageFieldType).toBeDefined();
      expect(imageFieldType).toBeInstanceOf(GraphQLObjectType);
    });

    it('should have attachmentIds field with correct type', () => {
      const imageFieldType = schema.getType('ImageField') as GraphQLObjectType;
      const fields = imageFieldType?.getFields();
      
      expect(fields?.attachmentIds).toBeDefined();
      expect(fields?.attachmentIds.type.toString()).toContain('[UUID!]!');
    });
  });

  describe('ImageFieldInput type', () => {
    it('should exist in the GraphQL schema', () => {
      const imageFieldInputType = schema.getType('ImageFieldInput');
      
      expect(imageFieldInputType).toBeDefined();
    });

    it('should have attachmentIds field for mutations', () => {
      const imageFieldInputType = schema.getType('ImageFieldInput') as any;
      const fields = imageFieldInputType?.getFields?.();
      
      expect(fields?.attachmentIds).toBeDefined();
    });
  });

  describe('ImageFieldFilterInput type', () => {
    it('should exist in the GraphQL schema', () => {
      const imageFieldFilterInputType = schema.getType('ImageFieldFilterInput');
      
      expect(imageFieldFilterInputType).toBeDefined();
    });

    it('should have filter operations', () => {
      const imageFieldFilterInputType = schema.getType('ImageFieldFilterInput') as any;
      const fields = imageFieldFilterInputType?.getFields?.();
      
      // Verify common filter operations exist
      expect(fields?.isEmpty).toBeDefined();
      expect(fields?.isNotEmpty).toBeDefined();
    });
  });

  describe('GraphQL introspection', () => {
    it('should include ImageField in schema introspection', async () => {
      // Query the schema to verify ImageField is discoverable
      const introspectionQuery = `
        {
          __type(name: "ImageField") {
            name
            kind
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `;

      // This would need actual GraphQL execution context
      // For now, verify type exists in schema
      const imageFieldType = schema.getType('ImageField');
      expect(imageFieldType).toBeDefined();
    });
  });
});

