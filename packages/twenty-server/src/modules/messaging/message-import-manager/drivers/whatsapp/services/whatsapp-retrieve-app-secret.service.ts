import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WhatsappWorkspaceEntity } from 'src/modules/integrations/whatsapp-workspace.entity';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/whatsapp/integrations.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';

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

    if (workspaceIdByWABAId === null || !workspaceIdByWABAId.workspace.id) {
      throw new Error(); // TODO: fix
    }
    const workspaceId = workspaceIdByWABAId.workspace.id;
    const context = buildSystemAuthContext(workspaceId);

    const whatsappRecord =
      await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        context,
        async () => {
          const whatsappRepository =
            await this.globalWorkspaceOrmManager.getRepository<WhatsappWorkspaceEntity>(
              workspaceId,
              'whatsapp',
            );

          return await whatsappRepository.findOneBy({
            businessAccountId: whatsappBusinessAccountId,
          });
        },
      );

    if (!whatsappRecord) {
      throw new Error(''); // TODO: fix
    }

    return whatsappRecord.appSecret;
  }
}
