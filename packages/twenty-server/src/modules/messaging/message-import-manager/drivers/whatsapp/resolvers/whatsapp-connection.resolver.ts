import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import axios from 'axios';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionGuard } from 'src/engine/guards/settings-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';
import { ConnectedWhatsappAccountDTO } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/dto/whatsapp-connected-account.dto';
import { WhatsappAccountService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-account.service';
import { IntegrationsEntity } from 'src/engine/metadata-modules/integrations/integrations.entity';
import { WhatsappConnectionStatusDTO } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/dto/whatsapp-connection-status.dto';
import { preparedWhatsappAPIAddress } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/prepared-whatsapp-api-address.util';

@Resolver()
@UsePipes(ResolverValidationPipe)
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionGuard(PermissionFlagType.WORKSPACE))
export class WhatsappResolver {
  constructor(
    private readonly integrationsService: WhatsappAccountService,
    @InjectRepository(IntegrationsEntity)
    private readonly integrationsRepository: Repository<IntegrationsEntity>,
  ) {}

  @Query(() => ConnectedWhatsappAccountDTO)
  @UseGuards(WorkspaceAuthGuard)
  async getConnectedWhatsappAccount(
    @Args('connectedAccountId', { type: () => UUIDScalarType })
    connectedAccountId: string,
    @Args('businessAccountId') businessAccountId: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<ConnectedWhatsappAccountDTO> {
    const connectedAccount = await this.integrationsService.getWhatsappAccount(
      workspace.id,
      connectedAccountId,
    );

    if (!isDefined(connectedAccount) || !isDefined(connectedAccount?.handle)) {
      throw new UserInputError(
        `Connected mail account with ID ${connectedAccountId} not found`,
      );
    }

    const connectedIntegration = await this.integrationsRepository.findOne({
      where: {
        whatsappBusinessAccountId: connectedAccountId,
        workspaceId: workspace.id,
      },
    });

    if (
      !isDefined(connectedIntegration) ||
      !isDefined(connectedIntegration.whatsappWebhookToken)
    ) {
      throw new UserInputError(
        `Missing WhatsApp webhook token for WhatsApp account with ${businessAccountId} ID`,
      );
    }

    return {
      appSecret: connectedAccount.refreshToken,
      bearerToken: connectedAccount.accessToken,
      id: connectedAccount.id,
      businessAccountId: connectedAccount.handle,
      provider: connectedAccount.provider,
      accountOwnerId: connectedAccount.accountOwnerId,
      webhookToken: connectedIntegration.whatsappWebhookToken,
    };
  }

  @Mutation(() => WhatsappConnectionStatusDTO)
  @UseGuards(WorkspaceAuthGuard)
  async saveWhatsappAccount(
    @Args('accountOwnerId', { type: () => UUIDScalarType })
    accountOwnerId: string,
    @Args('bearerToken') bearerToken: string,
    @Args('businessAccountId') businessAccountId: string,
    @Args('appSecret') appSecret: string,
    @Args('webhookToken') webhookToken: string,
    @AuthWorkspace() workspace: WorkspaceEntity,
    @Args('id', { type: () => UUIDScalarType, nullable: true }) id?: string,
  ): Promise<WhatsappConnectionStatusDTO> {
    const validatedParams = await this.validateAndTestConnectionParameters(
      businessAccountId,
      bearerToken,
    );

    if (!validatedParams) {
      throw new UserInputError(`Invalid connection data`);
    }

    const connectedAccountId =
      await this.integrationsService.processWhatsappAccount({
        workspaceId: workspace.id,
        workspaceMemberId: accountOwnerId,
        appSecret,
        bearerToken,
        webhookToken,
        businessAccountId,
        connectedAccountId: id,
      });

    return {
      success: true,
      connectedAccountId,
    };
  }

  private async validateAndTestConnectionParameters(
    businessAccountId: string,
    bearerToken: string,
  ): Promise<boolean> {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: preparedWhatsappAPIAddress(businessAccountId),
    };

    try {
      const response = await axios.request(options);

      return response.status === 200;
    } catch (e) {
      throw new Error(e);
    }
  }
}
