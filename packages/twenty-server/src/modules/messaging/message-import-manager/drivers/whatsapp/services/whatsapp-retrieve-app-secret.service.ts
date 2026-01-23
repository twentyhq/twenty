import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class WhatsappRetrieveAppSecretService {
  constructor(
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  async retrieveAppSecret(whatsappBusinessAccountId: string) {
    const workspaceIdByWABAId = await this.integrationsRepository.findOneBy({
      whatsappBusinessAccountId: whatsappBusinessAccountId,
    });

    if (workspaceIdByWABAId === null) {
      throw new Error(
        'WhatsApp connected account not found in integrations entity',
      );
    }
    const workspaceId = workspaceIdByWABAId.workspaceId;
    const context = buildSystemAuthContext(workspaceId);

    const whatsappConnectedAccountRecord =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        context,
        async () => {
          const connectedAccountRepository =
            await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
              workspaceId,
              'connectedAccount',
            );

          return await connectedAccountRepository.findOneBy({
            handle: whatsappBusinessAccountId,
          });
        },
      );

    if (!whatsappConnectedAccountRecord) {
      throw new Error('WhatsApp connected account not found');
    }

    return whatsappConnectedAccountRecord.refreshToken;
  }
}
