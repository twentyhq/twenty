/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';

const OBJECT = {
  universalIdentifier: 'custom-object',
  isSystem: false,
  disabledObjectPermissionActions: null,
};
const OPEN_BY_DEFAULT = {
  isShareable: true,
  isShareRequired: false,
  isPrivateByDefault: false,
  defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
};
const ROLE_ONLY = {
  isShareable: false,
  isShareRequired: false,
  isPrivateByDefault: false,
  defaultGeneralAccessLevel: null,
};
const CHAT_THREAD = {
  ...OBJECT,
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
};
const PRIVATE_CHAT_THREAD = {
  [FeatureFlagKey.IS_PRIVATE_CHAT_THREAD_ENABLED]: true,
};
const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

describe('resolveObjectSharing', () => {
  it('should open records by default and let grants view or edit beyond the role', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: OBJECT,
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual({
      ...OPEN_BY_DEFAULT,
      canShareBeyondRole: true,
      operationTypesGrantedBeyondRole: ['select', 'update'],
    });
  });

  it.each([
    { isSystem: false, featureFlagsMap: {} },
    { isSystem: true, featureFlagsMap: RECORD_SHARING },
  ])(
    'should keep records role-only for %o',
    ({ isSystem, featureFlagsMap }) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: { ...OBJECT, isSystem },
          featureFlagsMap,
        }),
      ).toEqual({
        ...ROLE_ONLY,
        canShareBeyondRole: false,
        operationTypesGrantedBeyondRole: [],
      });
    },
  );

  it('should not grant beyond the role an operation the object disables', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: ['canUpdateObjectRecords'],
        },
        featureFlagsMap: RECORD_SHARING,
      }).operationTypesGrantedBeyondRole,
    ).toEqual(['select']);
  });

  it('should not share beyond the role when the object disables every operation a share could grant', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: [
            'canReadObjectRecords',
            'canUpdateObjectRecords',
          ],
        },
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toMatchObject({
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it('should reach chat threads through their shares until the workspace converts them', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: CHAT_THREAD,
        featureFlagsMap: {},
      }),
    ).toEqual({
      isShareable: true,
      isShareRequired: true,
      isPrivateByDefault: true,
      defaultGeneralAccessLevel: RecordShareAccessLevel.NONE,
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it('should make chat threads shareable private records once converted, whatever the sharing flag', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: CHAT_THREAD,
        featureFlagsMap: PRIVATE_CHAT_THREAD,
      }),
    ).toEqual({
      isShareable: true,
      isShareRequired: false,
      isPrivateByDefault: true,
      defaultGeneralAccessLevel: RecordShareAccessLevel.READ_WRITE,
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });
});
