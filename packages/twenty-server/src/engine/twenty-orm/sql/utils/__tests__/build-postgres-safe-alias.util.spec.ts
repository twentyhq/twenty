import { buildPostgresSafeAlias } from 'src/engine/twenty-orm/sql/utils/build-postgres-safe-alias.util';

const OUTER_ALIAS =
  'customLeafRecord_parentCollectionId_containerId_securityGroupId';

describe('buildPostgresSafeAlias', () => {
  it('should keep an alias that fits in 63 bytes', () => {
    expect(OUTER_ALIAS).toHaveLength(63);
    expect(buildPostgresSafeAlias(OUTER_ALIAS)).toBe(OUTER_ALIAS);
  });

  it('should not collapse a nested alias onto its 63-byte parent', () => {
    const innerAlias = buildPostgresSafeAlias(`${OUTER_ALIAS}_groupMembership`);

    expect(Buffer.byteLength(innerAlias)).toBeLessThanOrEqual(63);
    expect(innerAlias).not.toBe(OUTER_ALIAS);
  });

  it('should give distinct aliases to long siblings sharing a prefix', () => {
    expect(buildPostgresSafeAlias(`${OUTER_ALIAS}_groupMembership`)).not.toBe(
      buildPostgresSafeAlias(`${OUTER_ALIAS}_groupInvitation`),
    );
  });

  it('should be deterministic', () => {
    expect(buildPostgresSafeAlias(`${OUTER_ALIAS}_groupMembership`)).toBe(
      buildPostgresSafeAlias(`${OUTER_ALIAS}_groupMembership`),
    );
  });

  it('should count bytes rather than characters', () => {
    const multiByteAlias = 'é'.repeat(40);

    expect(buildPostgresSafeAlias(multiByteAlias)).not.toBe(multiByteAlias);
  });
});
