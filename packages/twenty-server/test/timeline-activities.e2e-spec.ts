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
                workspaceMemberId
                personId
                companyId
                opportunityId
                noteId
                taskId
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
          const timelineactivities = edges[0].node;

          expect(timelineactivities).toHaveProperty('happensAt');
          expect(timelineactivities).toHaveProperty('name');
          expect(timelineactivities).toHaveProperty('properties');
          expect(timelineactivities).toHaveProperty('linkedRecordCachedName');
          expect(timelineactivities).toHaveProperty('linkedRecordId');
          expect(timelineactivities).toHaveProperty('linkedObjectMetadataId');
          expect(timelineactivities).toHaveProperty('id');
          expect(timelineactivities).toHaveProperty('createdAt');
          expect(timelineactivities).toHaveProperty('updatedAt');
          expect(timelineactivities).toHaveProperty('workspaceMemberId');
          expect(timelineactivities).toHaveProperty('personId');
          expect(timelineactivities).toHaveProperty('companyId');
          expect(timelineactivities).toHaveProperty('opportunityId');
          expect(timelineactivities).toHaveProperty('noteId');
          expect(timelineactivities).toHaveProperty('taskId');
        }
      });
  });
});
