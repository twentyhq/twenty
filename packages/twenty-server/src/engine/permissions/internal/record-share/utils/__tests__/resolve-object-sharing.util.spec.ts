/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FeatureFlagKey } from 'twenty-shared/types';

import { resolveObjectSharing } from 'src/engine/permissions/record-share/utils/resolve-object-sharing.util';

const OBJECT = {
  universalIdentifier: 'custom-object',
  disabledObjectPermissionActions: null,
};
const CHAT_THREAD = {
  ...OBJECT,
  universalIdentifier: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
};
const RECORD_SHARING = {
  [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
};

describe('resolveObjectSharing', () => {
  it('should make records shareable beyond the role once record sharing is enabled', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: OBJECT,
        featureFlagsMap: RECORD_SHARING,
      }),
    ).toEqual({
      isShareable: true,
      canSetRecordPrivacy: true,
      isPrivateByDefault: false,
      canShareBeyondRole: true,
      operationTypesGrantedBeyondRole: ['read', 'update'],
    });
  });

  it('should keep records unshareable while record sharing is disabled', () => {
    expect(
      resolveObjectSharing({ flatObjectMetadata: OBJECT, featureFlagsMap: {} }),
    ).toEqual({
      isShareable: false,
      canSetRecordPrivacy: false,
      isPrivateByDefault: false,
      canShareBeyondRole: false,
      operationTypesGrantedBeyondRole: [],
    });
  });

  it('should not grant beyond the role an operation the object disables', () => {
    expect(
      resolveObjectSharing({
        flatObjectMetadata: {
          ...OBJECT,
          disabledObjectPermissionActions: ['canUpdateObjectRecords'],
        },
        featureFlagsMap: RECORD_SHARING,
      }).operationTypesGrantedBeyondRole,
    ).toEqual(['read']);
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

  it.each([
    { featureFlagsMap: {}, isShareable: false },
    { featureFlagsMap: RECORD_SHARING, isShareable: true },
  ])(
    'should create chat threads private and share them only with record sharing ($isShareable)',
    ({ featureFlagsMap, isShareable }) => {
      expect(
        resolveObjectSharing({
          flatObjectMetadata: CHAT_THREAD,
          featureFlagsMap,
        }),
      ).toMatchObject({ isShareable, isPrivateByDefault: true });
    },
  );

  it('should let records be made private with private records on and sharing off', () => {
    const { isShareable, canSetRecordPrivacy } = resolveObjectSharing({
      flatObjectMetadata: {
        universalIdentifier: 'ordinary-object',
        disabledObjectPermissionActions: [],
      },
      featureFlagsMap: { [FeatureFlagKey.IS_PRIVATE_RECORDS_ENABLED]: true },
    });

    expect(isShareable).toBe(false);
    expect(canSetRecordPrivacy).toBe(true);
  });
});
