import { findWorkspaceCustomApplicationId } from 'test/integration/metadata/suites/application-default-role/utils/find-application-default-role.util';
import { exportApplication } from 'test/integration/metadata/suites/application/utils/export-application.util';
import { type Manifest } from 'twenty-shared/application';

export const pullWorkspaceCustomApplicationManifest = async ({
  token,
}: {
  token: string;
}): Promise<Manifest> => {
  const workspaceCustomApplicationId =
    await findWorkspaceCustomApplicationId(token);

  const { data } = await exportApplication({
    universalIdentifier: workspaceCustomApplicationId,
    expectToFail: false,
    token,
  });

  return data.exportApplication.manifest;
};
