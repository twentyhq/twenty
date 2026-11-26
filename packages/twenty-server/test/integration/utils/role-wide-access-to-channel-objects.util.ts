import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getObjectPermissionUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/permissions/channel-visibility/constants/channel-child-object-universal-identifiers.constant';
import { CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS } from 'src/engine/permissions/channel-visibility/constants/channel-record-rule-universal-identifier-seeds.constant';
import { type ChannelVisibilityRoleWideAccessRevokeService } from 'src/engine/permissions/channel-visibility/services/channel-visibility-role-wide-access-revoke.service';
import { getChannelRecordRuleUniversalIdentifier } from 'src/engine/permissions/channel-visibility/utils/get-channel-record-rule-universal-identifier.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

export const ROLE_WIDE_ACCESS_REVOKED_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
  ...CHANNEL_CHILD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_OBJECTS.attachment.universalIdentifier,
  STANDARD_OBJECTS.callRecording.universalIdentifier,
];

const getWorkspaceCacheService = () =>
  getAppProviderByClassName<WorkspaceCacheService>('WorkspaceCacheService');

export const grantRoleWideAccessToChannelObjects = async () => {
  const {
    flatRoleMaps,
    flatObjectPermissionMaps,
    flatRowLevelPermissionRuleMaps,
  } = await getWorkspaceCacheService().getOrRecompute(SEED_APPLE_WORKSPACE_ID, [
    'flatRoleMaps',
    'flatObjectPermissionMaps',
    'flatRowLevelPermissionRuleMaps',
  ]);
  const userRoles = Object.values(flatRoleMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter(({ canBeAssignedToUsers }) => canBeAssignedToUsers);

  const objectPermissionIds = userRoles
    .flatMap(({ universalIdentifier, applicationUniversalIdentifier }) =>
      ROLE_WIDE_ACCESS_REVOKED_OBJECT_UNIVERSAL_IDENTIFIERS.map(
        (objectUniversalIdentifier) =>
          flatObjectPermissionMaps.byUniversalIdentifier[
            getObjectPermissionUniversalIdentifier({
              applicationUniversalIdentifier,
              roleUniversalIdentifier: universalIdentifier,
              objectUniversalIdentifier,
            })
          ]?.id,
      ),
    )
    .filter(isDefined);
  const channelRecordRuleUniversalIdentifiers = (
    kind: 'rule' | 'group' | 'predicate',
  ) =>
    userRoles.flatMap(({ universalIdentifier }) =>
      CHANNEL_RECORD_RULE_UNIVERSAL_IDENTIFIER_SEEDS.map(
        (ruleUniversalIdentifierSeed) =>
          getChannelRecordRuleUniversalIdentifier({
            ruleUniversalIdentifierSeed,
            roleUniversalIdentifier: universalIdentifier,
            kind,
          }),
      ),
    );
  const ruleIds = channelRecordRuleUniversalIdentifiers('rule')
    .map(
      (universalIdentifier) =>
        flatRowLevelPermissionRuleMaps.byUniversalIdentifier[
          universalIdentifier
        ]?.id,
    )
    .filter(isDefined);

  await global.testDataSource.query(
    `DELETE FROM core."rowLevelPermissionPredicate" WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
    [
      SEED_APPLE_WORKSPACE_ID,
      channelRecordRuleUniversalIdentifiers('predicate'),
    ],
  );
  await global.testDataSource.query(
    `DELETE FROM core."rowLevelPermissionPredicateGroup" WHERE "workspaceId" = $1 AND "universalIdentifier" = ANY($2)`,
    [SEED_APPLE_WORKSPACE_ID, channelRecordRuleUniversalIdentifiers('group')],
  );
  await global.testDataSource.query(
    `DELETE FROM core."rowLevelPermissionRule" WHERE id = ANY($1)`,
    [ruleIds],
  );
  await global.testDataSource.query(
    `DELETE FROM core."objectPermission" WHERE id = ANY($1)`,
    [objectPermissionIds],
  );
  await getWorkspaceCacheService().invalidateAndRecompute(
    SEED_APPLE_WORKSPACE_ID,
    [
      'flatObjectPermissionMaps',
      'flatRowLevelPermissionRuleMaps',
      'flatRowLevelPermissionPredicateGroupMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatFieldPermissionMaps',
      'rolesPermissions',
    ],
  );
};

export const revokeRoleWideAccessToChannelObjects = () =>
  getAppProviderByClassName<ChannelVisibilityRoleWideAccessRevokeService>(
    'ChannelVisibilityRoleWideAccessRevokeService',
  ).revokeRoleWideAccess({ workspaceId: SEED_APPLE_WORKSPACE_ID });
