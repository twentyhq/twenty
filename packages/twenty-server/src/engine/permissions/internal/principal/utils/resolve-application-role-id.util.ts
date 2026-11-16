import { resolveApplicationGrantRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-grant-role-id.util';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isOAuthOnlyApplication } from 'src/engine/core-modules/application/utils/is-oauth-only-application.util';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';

// OAuth-only applications have no role yet, so they act with the role of the member they act for
export const resolveApplicationRoleId = ({
  application,
  userRoleId,
  workspaceId,
  workspaceCustomApplicationId,
  flatRoleTargetByApplicationIdMaps,
}: {
  application: Pick<FlatApplication, 'id' | 'defaultRoleId' | 'sourceType'>;
  userRoleId?: string;
  workspaceId: string;
  workspaceCustomApplicationId: string;
  flatRoleTargetByApplicationIdMaps: Partial<
    Record<string, Pick<FlatRoleTarget, 'roleId'>>
  >;
}): string | undefined => {
  if (isOAuthOnlyApplication(application)) {
    return application.defaultRoleId ?? userRoleId;
  }

  return resolveApplicationGrantRoleId({
    flatApplication: application,
    workspaceId,
    workspaceCustomApplicationId,
    flatRoleTargetByApplicationIdMaps,
  });
};
