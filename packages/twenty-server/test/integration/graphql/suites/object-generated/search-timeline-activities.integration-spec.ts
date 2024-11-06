import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchTimelineActivitiesResolver (e2e)', () => {
  it('should find many searchTimelineActivities', () => {
    const queryData = {
      query: `
        query searchTimelineActivities {
          searchTimelineActivities {
            edges {
              node {
                happensAt
                name
                properties
                linkedRecordCachedName
                linkedRecordId
                linkedObjectMetadataId
                id
                createdAt
                updatedAt
                deletedAt
                workspaceMemberId
                personId
                companyId
                opportunityId
                noteId
                taskId
                workflowId
                workflowVersionId
                workflowRunId
                rocketId
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
        const data = res.body.data.searchTimelineActivities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchTimelineActivities = edges[0].node;

          expect(searchTimelineActivities).toHaveProperty('happensAt');
          expect(searchTimelineActivities).toHaveProperty('name');
          expect(searchTimelineActivities).toHaveProperty('properties');
          expect(searchTimelineActivities).toHaveProperty(
            'linkedRecordCachedName',
          );
          expect(searchTimelineActivities).toHaveProperty('linkedRecordId');
          expect(searchTimelineActivities).toHaveProperty(
            'linkedObjectMetadataId',
          );
          expect(searchTimelineActivities).toHaveProperty('id');
          expect(searchTimelineActivities).toHaveProperty('createdAt');
          expect(searchTimelineActivities).toHaveProperty('updatedAt');
          expect(searchTimelineActivities).toHaveProperty('deletedAt');
          expect(searchTimelineActivities).toHaveProperty('workspaceMemberId');
          expect(searchTimelineActivities).toHaveProperty('personId');
          expect(searchTimelineActivities).toHaveProperty('companyId');
          expect(searchTimelineActivities).toHaveProperty('opportunityId');
          expect(searchTimelineActivities).toHaveProperty('noteId');
          expect(searchTimelineActivities).toHaveProperty('taskId');
          expect(searchTimelineActivities).toHaveProperty('workflowId');
          expect(searchTimelineActivities).toHaveProperty('workflowVersionId');
          expect(searchTimelineActivities).toHaveProperty('workflowRunId');
          expect(searchTimelineActivities).toHaveProperty('rocketId');
        }
      });
  });
});
