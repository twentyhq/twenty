import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

// GraphQL introspection query to get all type names
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      types {
        name
        kind
      }
      queryType {
        fields {
          name
        }
      }
      mutationType {
        fields {
          name
        }
      }
    }
  }
`;

// Metadata types that should ONLY appear on /metadata, not on /graphql
const METADATA_ONLY_TYPE_NAMES = [
  'ObjectMetadataDTO',
  'FieldMetadataDTO',
  'IndexMetadataDTO',
  'CreateOneObjectInput',
  'UpdateOneObjectInput',
  'DeleteOneObjectInput',
  'CreateOneFieldMetadataInput',
  'UpdateOneFieldMetadataInput',
  'ViewDTO',
  'ViewFieldDTO',
  'ViewFilterDTO',
  'ViewSortDTO',
  'ViewGroupDTO',
  'ViewFilterGroupDTO',
  'RoleDTO',
  'WebhookDTO',
  'PageLayoutDTO',
  'PageLayoutTabDTO',
  'PageLayoutWidgetDTO',
  'SkillDTO',
  'LogicFunctionDTO',
  'AgentDTO',
  'AgentChatDTO',
  'FrontComponentDTO',
  'CommandMenuItemDTO',
  'NavigationMenuItemDTO',
];

// Metadata mutation/query names that should NOT appear on /graphql
const METADATA_ONLY_OPERATIONS = [
  'createOneObject',
  'updateOneObject',
  'deleteOneObject',
  'createOneField',
  'updateOneField',
  'deleteOneField',
  'createOneView',
  'deleteOneView',
  'createOneRole',
  'deleteOneRole',
  'createOneWebhook',
  'deleteOneWebhook',
];

describe('Schema Isolation (integration)', () => {
  describe('/metadata endpoint', () => {
    it('should expose metadata types via introspection', () => {
      return client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({ query: INTROSPECTION_QUERY })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.__schema).toBeDefined();

          const typeNames = res.body.data.__schema.types.map(
            (t: { name: string }) => t.name,
          );

          // Metadata types should be present
          for (const metadataType of [
            'ObjectMetadataDTO',
            'FieldMetadataDTO',
          ]) {
            expect(typeNames).toContain(metadataType);
          }
        });
    });

    it('should have query and mutation types defined', () => {
      return client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({ query: INTROSPECTION_QUERY })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();

          const { queryType, mutationType } = res.body.data.__schema;

          expect(queryType).toBeDefined();
          expect(queryType.fields.length).toBeGreaterThan(0);
          expect(mutationType).toBeDefined();
          expect(mutationType.fields.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/graphql endpoint', () => {
    it('should not expose metadata-specific types via introspection', () => {
      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({ query: INTROSPECTION_QUERY })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.data.__schema).toBeDefined();

          const typeNames = res.body.data.__schema.types.map(
            (t: { name: string }) => t.name,
          );

          // No metadata types should appear
          for (const metadataType of METADATA_ONLY_TYPE_NAMES) {
            expect(typeNames).not.toContain(metadataType);
          }
        });
    });

    it('should not expose metadata-specific mutations via introspection', () => {
      return client
        .post('/graphql')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send({ query: INTROSPECTION_QUERY })
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();

          const { mutationType } = res.body.data.__schema;

          if (mutationType) {
            const mutationNames = mutationType.fields.map(
              (f: { name: string }) => f.name,
            );

            for (const metadataOp of METADATA_ONLY_OPERATIONS) {
              expect(mutationNames).not.toContain(metadataOp);
            }
          }
        });
    });
  });
});
