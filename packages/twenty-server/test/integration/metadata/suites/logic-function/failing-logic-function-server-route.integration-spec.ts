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

    expect(errors).toHaveLength(1);
    expect(errors[0].extensions.code).toBe('METADATA_VALIDATION_FAILED');
    expect(
      errors[0].extensions.errors.logicFunction[0].errors[0].message,
    ).toContain('serverRouteTriggerSettings');
  });
});
