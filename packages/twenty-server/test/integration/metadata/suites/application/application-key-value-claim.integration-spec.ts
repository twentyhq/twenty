import { randomUUID } from 'crypto';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

it('grants one concurrent claim, retains its value, and isolates applications', async () => {
  const key = `atomic-claim-${randomUUID()}`;
  const repository = getCoreRepository<KeyValuePairEntity>(KeyValuePairEntity);
  const applicationRepository =
    getCoreRepository<ApplicationEntity>(ApplicationEntity);
  const applications = await applicationRepository.find({
    where: { workspaceId: SEED_APPLE_WORKSPACE_ID },
    take: 2,
  });
  expect(applications).toHaveLength(2);
  const service = getAppProviderByClassName<ApplicationKeyValueService>(
    'ApplicationKeyValueService',
  );
  const claim = (applicationId: string, worker: number) =>
    service.setIfAbsent({
      application: { id: applicationId },
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      key,
      value: { worker },
    });
  try {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, worker) =>
        claim(applications[0].id, worker),
      ),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    const saved = await repository.findOneByOrFail({
      key,
      applicationId: applications[0].id,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
    expect(saved.value).toEqual({ worker: results.findIndex(Boolean) });
    expect(await claim(applications[1].id, 21)).toBe(true);
  } finally {
    await repository.delete({ key, workspaceId: SEED_APPLE_WORKSPACE_ID });
  }
});
