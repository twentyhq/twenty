import { FeatureFlagKey } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type DirectMessageThreadPair } from 'src/engine/permissions/direct-message/types/direct-message-thread-pair.type';
import { validateDirectMessageRecordTargetsOrThrow } from 'src/engine/permissions/direct-message/utils/validate-direct-message-record-targets-or-throw.util';
import { PermissionsExceptionCode } from 'src/engine/permissions/permissions.exception';

const directMessagePair: DirectMessageThreadPair = {
  conversationType: 'DIRECT_MESSAGE',
  directMessageFirstWorkspaceMemberId: 'member-one',
  directMessageSecondWorkspaceMemberId: 'member-two',
};
const targetRelations = [
  {
    fieldName: 'targetCompany',
    fieldMetadataId: 'company-field',
    relationType: RelationType.MANY_TO_ONE,
    targetObjectMetadataId: 'company-object',
    targetFieldMetadataId: 'company-inverse-field',
    joinColumnName: 'targetCompanyId',
  },
];

describe('validateDirectMessageRecordTargetsOrThrow', () => {
  it('requires independent target record access when attaching or changing a DM link', async () => {
    const request = {
      records: [{ id: 'link', threadId: 'dm', targetCompanyId: 'company' }],
      context: {
        findRecords: async () => [{ id: 'dm', ...directMessagePair }],
      },
      metadataMaps: {
        featureFlagsMap: {
          [FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED]: true,
        },
      },
      targetRelations,
      findReadableRecordIds: jest.fn(async () => new Set<string>()),
    };

    await expect(
      validateDirectMessageRecordTargetsOrThrow(request),
    ).rejects.toMatchObject({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    request.findReadableRecordIds.mockResolvedValue(new Set(['company']));

    await expect(
      validateDirectMessageRecordTargetsOrThrow(request),
    ).resolves.toBeUndefined();
  });

  it('preserves ordinary conversation links without adding new record checks', async () => {
    const findReadableRecordIds = jest.fn(async () => new Set<string>());

    await validateDirectMessageRecordTargetsOrThrow({
      records: [{ id: 'link', threadId: 'chat', targetCompanyId: 'company' }],
      context: {
        findRecords: async () => [
          {
            id: 'chat',
            conversationType: 'STANDARD',
            directMessageFirstWorkspaceMemberId: null,
            directMessageSecondWorkspaceMemberId: null,
          },
        ],
      },
      metadataMaps: {
        featureFlagsMap: {
          [FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED]: true,
        },
      },
      targetRelations,
      findReadableRecordIds,
    });

    expect(findReadableRecordIds).not.toHaveBeenCalled();
  });
});
