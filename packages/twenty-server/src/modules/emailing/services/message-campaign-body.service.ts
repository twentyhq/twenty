import { Injectable, type Type } from '@nestjs/common';

import { MessageCampaignStatus } from 'twenty-shared/types';
import {
  CAMPAIGN_VARIABLE_NAMES,
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  EMAIL_THEME_DEFAULTS,
  type EmailDocument,
  isDefined,
  parseEmailDocument,
} from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import { collectCampaignVariableNames } from 'src/modules/emailing/utils/collect-campaign-variables.util';

export type UpdateDraftCampaignBodyArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  campaignId: string;
  document: unknown;
};

export type UpdateDraftCampaignBodyResult = {
  campaignId: string;
  campaignName: string;
  blockCount: number;
  variablesUsed: string[];
};

@Injectable()
export class MessageCampaignBodyService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private getUserRepository<T extends ObjectLiteral>(
    workspaceId: string,
    entity: Type<T>,
    roleId: string,
  ) {
    return this.globalWorkspaceOrmManager.getRepository(workspaceId, entity, {
      unionOf: [roleId],
    });
  }

  async updateDraftBody({
    workspaceId,
    userWorkspaceId,
    campaignId,
    document,
  }: UpdateDraftCampaignBodyArgs): Promise<UpdateDraftCampaignBodyResult> {
    const parseResult = parseEmailDocument(document);

    if (!parseResult.success) {
      throw new EmailingDomainException(
        `Invalid email document: ${parseResult.error}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    const stampedDocument = this.stampDocumentDefaults(parseResult.document);
    const variablesUsed = [
      ...collectCampaignVariableNames(stampedDocument),
    ].sort();
    const unknownVariables = variablesUsed.filter(
      (variableName) =>
        !CAMPAIGN_VARIABLE_NAMES.includes(
          variableName as (typeof CAMPAIGN_VARIABLE_NAMES)[number],
        ),
    );

    if (unknownVariables.length > 0) {
      throw new EmailingDomainException(
        `Unknown campaign variables: ${unknownVariables.join(', ')}. ` +
          `Available variables: ${CAMPAIGN_VARIABLE_NAMES.join(', ')}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    const roleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const campaignRepository = await this.getUserRepository(
          workspaceId,
          MessageCampaignWorkspaceEntity,
          roleId,
        );

        const campaign = await campaignRepository.findOne({
          where: { id: campaignId },
        });

        if (!isDefined(campaign)) {
          throw new EmailingDomainException(
            `Campaign ${campaignId} not found`,
            EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_FOUND,
          );
        }

        if (campaign.status !== MessageCampaignStatus.DRAFT) {
          throw new EmailingDomainException(
            `Campaign ${campaignId} is ${campaign.status}; only draft campaigns can be edited`,
            EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          );
        }

        // Conditional on status so a concurrent send cannot be overwritten.
        const { affected } = await campaignRepository.update(
          { id: campaignId, status: MessageCampaignStatus.DRAFT },
          { bodyTemplate: JSON.stringify(stampedDocument) },
        );

        if (affected !== 1) {
          throw new EmailingDomainException(
            `Campaign ${campaignId} is no longer an editable draft`,
            EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          );
        }

        return {
          campaignId,
          campaignName: campaign.name,
          blockCount: stampedDocument.content?.length ?? 0,
          variablesUsed,
        };
      },
    );
  }

  // Documents written by the AI tool get the same doc-level attributes the
  // composer stamps: the schema version, and the default theme so the email
  // renders as a themed page instead of a bare body.
  private stampDocumentDefaults(document: EmailDocument): EmailDocument {
    return {
      ...document,
      attrs: {
        ...document.attrs,
        schemaVersion:
          document.attrs?.schemaVersion ?? EMAIL_DOCUMENT_SCHEMA_VERSION,
        emailTheme: isDefined(document.attrs?.emailTheme)
          ? document.attrs.emailTheme
          : EMAIL_THEME_DEFAULTS,
      },
    };
  }
}
