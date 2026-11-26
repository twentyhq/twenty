/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { resolveCreatedRecordSharingOrThrow } from 'src/engine/permissions/record-share/utils/resolve-created-record-sharing-or-throw.util';

const ROLE_GRANT = {
  roleId: '20202020-0000-4000-8000-000000000001',
  accessLevel: RecordShareAccessLevel.READ,
};
const EVERYONE_GRANT = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.READ,
};
const EVERYONE_NONE = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.NONE,
};
const EVERYONE_AT_DEFAULT = {
  everyone: true,
  accessLevel: RecordShareAccessLevel.READ_WRITE,
};
const SHAREABLE_OBJECT = {
  isPrivateByDefault: false,
};
const PRIVATE_BY_DEFAULT_OBJECT = {
  isPrivateByDefault: true,
};

describe('resolveCreatedRecordSharingOrThrow', () => {
  it('should create private records when everyone gets no access', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_NONE],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: true });
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: [EVERYONE_NONE],
      }),
    ).toEqual({ shareWith: [], isPrivate: true });
  });

  it('should write named grants on a public record', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: [ROLE_GRANT, EVERYONE_AT_DEFAULT],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: false });
  });

  it('should write nothing for a public record without named grants', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: [EVERYONE_AT_DEFAULT],
      }),
    ).toBeNull();
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: null,
      }),
    ).toBeNull();
  });

  it('should reject a view-only general access, which private records replace', () => {
    expect(() =>
      resolveCreatedRecordSharingOrThrow({
        ...SHAREABLE_OBJECT,
        shareWith: [EVERYONE_GRANT],
      }),
    ).toThrow('A record is either private or follows the roles of its object');
  });

  it('should create a record of a private-by-default object private unless it is shared with everyone', () => {
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...PRIVATE_BY_DEFAULT_OBJECT,
        shareWith: [ROLE_GRANT],
      }),
    ).toEqual({ shareWith: [ROLE_GRANT], isPrivate: true });
    expect(
      resolveCreatedRecordSharingOrThrow({
        ...PRIVATE_BY_DEFAULT_OBJECT,
        shareWith: [EVERYONE_AT_DEFAULT],
      }),
    ).toBeNull();
  });
});
