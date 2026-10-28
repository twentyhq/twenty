import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { createOneLogicFunction } from 'test/integration/metadata/suites/logic-function/utils/create-logic-function.util';
import { v4 as uuidv4 } from 'uuid';

describe('Logic function creation should reject server route triggers', () => {
  it('fails when serverRouteTriggerSettings is provided', async () => {
    const { errors } = await createOneLogicFunction({
      input: {
        name: `server-route-${uuidv4()}`,
        serverRouteTriggerSettings: { forwardedRequestHeaders: [] },
      },
      expectToFail: true,
    });

    expectOneNotInternalServerErrorSnapshot({ errors });
  });
});
