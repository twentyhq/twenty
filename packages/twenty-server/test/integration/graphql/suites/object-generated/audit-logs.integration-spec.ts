import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('auditLogsResolver (e2e)', () => {
  it('should find many auditLogs', () => {
    const queryData = {
      query: `
        query auditLogs {
          auditLogs {
            edges {
              node {
                name
                properties
                context
                objectName
                objectMetadataId
                recordId
                id
                createdAt
                updatedAt
                deletedAt
                workspaceMemberId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.auditLogs;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const auditLogs = edges[0].node;

          expect(auditLogs).toHaveProperty('name');
          expect(auditLogs).toHaveProperty('properties');
          expect(auditLogs).toHaveProperty('context');
          expect(auditLogs).toHaveProperty('objectName');
          expect(auditLogs).toHaveProperty('objectMetadataId');
          expect(auditLogs).toHaveProperty('recordId');
          expect(auditLogs).toHaveProperty('id');
          expect(auditLogs).toHaveProperty('createdAt');
          expect(auditLogs).toHaveProperty('updatedAt');
          expect(auditLogs).toHaveProperty('deletedAt');
          expect(auditLogs).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
