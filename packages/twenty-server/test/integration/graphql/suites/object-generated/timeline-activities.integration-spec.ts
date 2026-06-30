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
                targetPersonId
                targetCompanyId
                targetOpportunityId
                targetNoteId
                targetTaskId
                targetWorkflowId
                targetWorkflowVersionId
                targetWorkflowRunId
                targetPetId
                targetSurveyResultId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
          expect(timelineActivities).toHaveProperty('targetPersonId');
          expect(timelineActivities).toHaveProperty('targetCompanyId');
          expect(timelineActivities).toHaveProperty('targetOpportunityId');
          expect(timelineActivities).toHaveProperty('targetNoteId');
          expect(timelineActivities).toHaveProperty('targetTaskId');
          expect(timelineActivities).toHaveProperty('targetWorkflowId');
          expect(timelineActivities).toHaveProperty('targetWorkflowVersionId');
          expect(timelineActivities).toHaveProperty('targetWorkflowRunId');
          expect(timelineActivities).toHaveProperty('targetPetId');
          expect(timelineActivities).toHaveProperty('targetSurveyResultId');
        }
      });
  });
});
