import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('logicFunctionsResolver (e2e)', () => {
  it('should find many logicFunctions', () => {
    const queryData = {
      query: `
        query GetManyLogicFunctions {
          findManyLogicFunctions {
            id
            name
            description
            runtime
            createdAt
            updatedAt
          }
        }
      `,
    };

    return client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const logicFunctions = res.body.data.findManyLogicFunctions;

        expect(logicFunctions).toBeDefined();
        expect(Array.isArray(logicFunctions)).toBe(true);

        if (logicFunctions.length > 0) {
          const logicFunction = logicFunctions[0];

          expect(logicFunction).toHaveProperty('id');
          expect(logicFunction).toHaveProperty('name');
          expect(logicFunction).toHaveProperty('description');
          expect(logicFunction).toHaveProperty('runtime');
          expect(logicFunction).toHaveProperty('createdAt');
          expect(logicFunction).toHaveProperty('updatedAt');
        }
      });
  });
});
