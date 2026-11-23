import { syncChannelVisibilityRules } from 'test/integration/permissions/channel-visibility/utils/sync-channel-visibility-rules.util';
import { updateMessageChannelVisibility } from 'test/integration/permissions/channel-visibility/utils/update-message-channel-visibility.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { findFieldMetadataIdByName } from 'test/integration/utils/find-field-metadata-id-by-name.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { FeatureFlagKey } from 'twenty-shared/types';

import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const setJonyChannelVisibility = (visibility: string) =>
  updateMessageChannelVisibility({
    messageChannelId: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
    visibility,
  });

const setChannelVisibilityRlsEnabled = async (value: boolean) => {
  for (const featureFlag of [
    FeatureFlagKey.IS_RELATED_RECORD_PATHS_ENABLED,
    FeatureFlagKey.IS_ROW_LEVEL_PERMISSION_RELATION_HOP_ENABLED,
    FeatureFlagKey.IS_CHANNEL_VISIBILITY_RLS_ENABLED,
  ]) {
    await updateFeatureFlag({ featureFlag, value, expectToFail: false });
  }
  await syncChannelVisibilityRules();
};

describe('channel visibility rule sync (integration)', () => {
  let messageObjectMetadataId: string;
  let subjectFieldMetadataId: string;
  let textFieldMetadataId: string;

  const findUnreadableFieldsOfRulesListingJonyChannel = async (): Promise<
    string[][]
  > => {
    const { rolesPermissions } =
      await getAppProviderByClassName<WorkspaceCacheService>(
        'WorkspaceCacheService',
      ).getOrRecompute(SEED_APPLE_WORKSPACE_ID, ['rolesPermissions']);

    return Object.values(rolesPermissions).flatMap((roleRecordsPermissions) =>
      (
        roleRecordsPermissions.objects[messageObjectMetadataId]
          ?.rowLevelRecordsPermissions ?? []
      )
        .filter(({ predicates }) =>
          predicates.some(
            ({ value }) =>
              Array.isArray(value) &&
              value.includes(MESSAGE_CHANNEL_DATA_SEED_IDS.JONY),
          ),
        )
        .map(({ unreadableFields }) => [...unreadableFields].sort()),
    );
  };

  beforeAll(async () => {
    messageObjectMetadataId = await findObjectMetadataIdByName('message');
    [subjectFieldMetadataId, textFieldMetadataId] = await Promise.all(
      ['subject', 'text'].map((fieldName) =>
        findFieldMetadataIdByName({
          objectMetadataId: messageObjectMetadataId,
          fieldName,
        }),
      ),
    );
    await setChannelVisibilityRlsEnabled(true);
  });

  afterAll(async () => {
    await setJonyChannelVisibility('SHARE_EVERYTHING');
    await setChannelVisibilityRlsEnabled(false);
  });

  it('should list a channel sharing everything in a fully readable rule of every member', async () => {
    await setJonyChannelVisibility('SHARE_EVERYTHING');

    const unreadableFieldsOfRules =
      await findUnreadableFieldsOfRulesListingJonyChannel();

    expect(unreadableFieldsOfRules.length).toBeGreaterThan(1);
    expect(unreadableFieldsOfRules.every((fields) => fields.length === 0)).toBe(
      true,
    );
  });

  it('should keep a metadata channel fully readable by its owner only', async () => {
    await setJonyChannelVisibility('METADATA');

    const unreadableFieldsOfRules =
      await findUnreadableFieldsOfRulesListingJonyChannel();
    const fullyReadableRules = unreadableFieldsOfRules.filter(
      (fields) => fields.length === 0,
    );
    const restrictedRules = unreadableFieldsOfRules.filter(
      (fields) => fields.length > 0,
    );

    expect(fullyReadableRules).toHaveLength(1);
    expect(restrictedRules.length).toBeGreaterThan(0);
    expect(
      restrictedRules.every(
        (fields) =>
          fields.includes(subjectFieldMetadataId) &&
          fields.includes(textFieldMetadataId),
      ),
    ).toBe(true);
  });

  it('should keep the subject readable on a subject channel', async () => {
    await setJonyChannelVisibility('SUBJECT');

    const restrictedRules = (
      await findUnreadableFieldsOfRulesListingJonyChannel()
    ).filter((fields) => fields.length > 0);

    expect(restrictedRules.length).toBeGreaterThan(0);
    expect(
      restrictedRules.every(
        (fields) =>
          !fields.includes(subjectFieldMetadataId) &&
          fields.includes(textFieldMetadataId),
      ),
    ).toBe(true);
  });

  it('should remove every channel visibility rule once the flag is off', async () => {
    await setChannelVisibilityRlsEnabled(false);

    try {
      expect(await findUnreadableFieldsOfRulesListingJonyChannel()).toEqual([]);
    } finally {
      await setChannelVisibilityRlsEnabled(true);
    }
  });
});
