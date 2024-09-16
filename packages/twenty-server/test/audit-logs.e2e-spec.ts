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
          const auditlogs = edges[0].node;

          expect(auditlogs).toHaveProperty('name');
          expect(auditlogs).toHaveProperty('properties');
          expect(auditlogs).toHaveProperty('context');
          expect(auditlogs).toHaveProperty('objectName');
          expect(auditlogs).toHaveProperty('objectMetadataId');
          expect(auditlogs).toHaveProperty('recordId');
          expect(auditlogs).toHaveProperty('id');
          expect(auditlogs).toHaveProperty('createdAt');
          expect(auditlogs).toHaveProperty('updatedAt');
          expect(auditlogs).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
