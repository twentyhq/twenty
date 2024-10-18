import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchAuditLogsResolver (e2e)', () => {
  it('should find many searchAuditLogs', () => {
    const queryData = {
      query: `
        query searchAuditLogs {
          searchAuditLogs {
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
        const data = res.body.data.searchAuditLogs;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchAuditLogs = edges[0].node;

          expect(searchAuditLogs).toHaveProperty('name');
          expect(searchAuditLogs).toHaveProperty('properties');
          expect(searchAuditLogs).toHaveProperty('context');
          expect(searchAuditLogs).toHaveProperty('objectName');
          expect(searchAuditLogs).toHaveProperty('objectMetadataId');
          expect(searchAuditLogs).toHaveProperty('recordId');
          expect(searchAuditLogs).toHaveProperty('id');
          expect(searchAuditLogs).toHaveProperty('createdAt');
          expect(searchAuditLogs).toHaveProperty('updatedAt');
          expect(searchAuditLogs).toHaveProperty('deletedAt');
          expect(searchAuditLogs).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
