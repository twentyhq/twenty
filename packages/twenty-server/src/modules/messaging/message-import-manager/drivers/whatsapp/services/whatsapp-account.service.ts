import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { v4 } from 'uuid';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import type { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import type { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import type { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { WhatsappGetAssociatedPhoneNumbersService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-associated-phone-numbers.service';
import { formatWhatsappPhoneNumberUtil } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/format-whatsapp-phone-number.util';

@Injectable()
export class WhatsappAccountService {
  constructor(
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly whatsappGetAssociatedPhoneNumbersService: WhatsappGetAssociatedPhoneNumbersService,
  ) {}

  async getWhatsappAccount(workspaceId: string, id: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        return connectedAccountRepository.findOne({
          where: { id },
        });
      },
    );
  }

  async processWhatsappAccount(input: {
    workspaceId: string;
    workspaceMemberId: string;
    appSecret: string;
    bearerToken: string;
    webhookToken: string;
    businessAccountId: string;
    connectedAccountId?: string;
  }) {
    const {
      workspaceId,
      workspaceMemberId,
      businessAccountId,
      appSecret,
      webhookToken,
      bearerToken,
      connectedAccountId,
    } = input;

    const authContext = buildSystemAuthContext(workspaceId);
    const phoneNumbers: string[] =
      await this.whatsappGetAssociatedPhoneNumbersService.getAssociatedPhoneNumbers(
        businessAccountId,
        bearerToken,
      );
    const phoneNumberAliases: string = phoneNumbers.join(',').replace('+', '');
    let phoneNumberToMessageChannel: string[] = [];

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const existingAccount = connectedAccountId
          ? await connectedAccountRepository.findOne({
              where: { id: connectedAccountId },
            })
          : await connectedAccountRepository.findOne({
              where: {
                handle: businessAccountId,
                // should it be also checked by workspaceMemberId?
              },
            });

        const existingIntegrationEntry =
          await this.integrationsRepository.findOne({
            where: {
              whatsappBusinessAccountId: businessAccountId,
              workspaceId: workspaceId,
              whatsappWebhookToken: webhookToken,
            },
          });

        const newOrExistingAccountId =
          existingAccount?.id ?? connectedAccountId ?? v4();

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        for (const phoneNumber of phoneNumbers) {
          const formattedPhoneNumber =
            formatWhatsappPhoneNumberUtil(phoneNumber);

          (await messageChannelRepository.findOne({
            where: {
              connectedAccountId: existingAccount?.id,
              handle: formattedPhoneNumber,
            },
          })) !== null
            ? phoneNumberToMessageChannel.push(formattedPhoneNumber)
            : null;
        }

        await workspaceDataSource.transaction(
          async (manager: WorkspaceEntityManager) => {
            await connectedAccountRepository.save(
              {
                id: newOrExistingAccountId,
                handle: businessAccountId,
                provider: ConnectedAccountProvider.WHATSAPP,
                accessToken: bearerToken,
                refreshToken: appSecret,
                handleAliases: phoneNumberAliases,
                accountOwnerId: workspaceMemberId,
              },
              {},
              manager,
            );

            if (existingIntegrationEntry !== null) {
              await this.integrationsRepository.insert({
                whatsappBusinessAccountId: input.businessAccountId,
                workspaceId: input.workspaceId,
                whatsappWebhookToken: input.webhookToken,
              });
            }

            for (const phoneNumber of phoneNumberToMessageChannel) {
              await this.createMessageChannelService.createMessageChannel({
                workspaceId,
                connectedAccountId: newOrExistingAccountId,
                handle: phoneNumber,
                manager,
              });
            }
          },
        );

        return newOrExistingAccountId;
      },
    );
  }
}
