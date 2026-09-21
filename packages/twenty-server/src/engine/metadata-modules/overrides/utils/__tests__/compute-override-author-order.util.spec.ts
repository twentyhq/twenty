import { computeOverrideAuthorOrder } from 'src/engine/metadata-modules/overrides/utils/compute-override-author-order.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

describe('computeOverrideAuthorOrder', () => {
  it('ranks the workspace custom application before the owner', () => {
    expect(
      computeOverrideAuthorOrder({
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        ownerApplicationUniversalIdentifier: OWNER,
      }),
    ).toEqual([CUSTOM, OWNER]);
  });

  it('dedupes when the custom application owns the entity', () => {
    expect(
      computeOverrideAuthorOrder({
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        ownerApplicationUniversalIdentifier: CUSTOM,
      }),
    ).toEqual([CUSTOM]);
  });

  it('skips an unknown owner', () => {
    expect(
      computeOverrideAuthorOrder({
        workspaceCustomApplicationUniversalIdentifier: CUSTOM,
        ownerApplicationUniversalIdentifier: undefined,
      }),
    ).toEqual([CUSTOM]);
  });
});
