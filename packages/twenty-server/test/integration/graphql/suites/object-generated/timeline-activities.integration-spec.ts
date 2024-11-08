import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('timelineActivitiesResolver (e2e)', () => {
  it('should find many timelineActivities', () => {
    const queryData = {
      query: `
        query timelineActivities {
          timelineActivities {
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
        const data = res.body.data.timelineActivities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const timelineActivities = edges[0].node;

          expect(timelineActivities).toHaveProperty('happensAt');
          expect(timelineActivities).toHaveProperty('name');
          expect(timelineActivities).toHaveProperty('properties');
          expect(timelineActivities).toHaveProperty('linkedRecordCachedName');
          expect(timelineActivities).toHaveProperty('linkedRecordId');
          expect(timelineActivities).toHaveProperty('linkedObjectMetadataId');
          expect(timelineActivities).toHaveProperty('id');
          expect(timelineActivities).toHaveProperty('createdAt');
          expect(timelineActivities).toHaveProperty('updatedAt');
          expect(timelineActivities).toHaveProperty('deletedAt');
          expect(timelineActivities).toHaveProperty('workspaceMemberId');
          expect(timelineActivities).toHaveProperty('personId');
          expect(timelineActivities).toHaveProperty('companyId');
          expect(timelineActivities).toHaveProperty('opportunityId');
          expect(timelineActivities).toHaveProperty('noteId');
          expect(timelineActivities).toHaveProperty('taskId');
          expect(timelineActivities).toHaveProperty('workflowId');
          expect(timelineActivities).toHaveProperty('workflowVersionId');
          expect(timelineActivities).toHaveProperty('workflowRunId');
          expect(timelineActivities).toHaveProperty('rocketId');
        }
      });
  });
});
