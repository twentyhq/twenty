import { Injectable, type Type } from '@nestjs/common';

import { MessageCampaignStatus } from 'twenty-shared/types';
import {
  EMAIL_DOCUMENT_SCHEMA_VERSION,
  CANVAS_THEME_DEFAULTS,
  type EmailDocument,
  isDefined,
  parseEmailDocument,
} from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';
import { v4 } from 'uuid';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { CampaignVariableService } from 'src/modules/emailing/services/campaign-variable.service';
import { MessageCampaignWorkspaceEntity } from 'src/modules/emailing/standard-objects/message-campaign.workspace-entity';
import {
  collectCampaignVariableNames,
  collectCampaignVariableNamesFromString,
} from 'src/modules/emailing/utils/collect-campaign-variables.util';

export type SaveDraftCampaignArgs = {
  workspaceId: string;
  userWorkspaceId: string;
  campaignId?: string;
  name?: string;
  subject?: string;
  body?: unknown;
};

export type SaveDraftCampaignResult = {
  campaignId: string;
  campaignName: string;
  created: boolean;
  blockCount?: number;
  variablesUsed: string[];
};

const DEFAULT_CAMPAIGN_NAME = 'Untitled campaign';

@Injectable()
export class MessageCampaignDraftService {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly campaignVariableService: CampaignVariableService,
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

  // One path for creating and editing: without a campaignId a fresh draft is
  // inserted, with one the provided fields update the existing draft. Body
  // and subject go through the same validation either way.
  async saveDraft({
    workspaceId,
    userWorkspaceId,
    campaignId,
    name,
    subject,
    body,
  }: SaveDraftCampaignArgs): Promise<SaveDraftCampaignResult> {
    const stampedDocument = isDefined(body)
      ? this.parseAndStampDocument(body)
      : undefined;

    const variablesUsed = [
      ...new Set([
        ...(isDefined(stampedDocument)
          ? collectCampaignVariableNames(stampedDocument)
          : []),
        ...(isDefined(subject)
          ? collectCampaignVariableNamesFromString(subject)
          : []),
      ]),
    ].sort();

    if (variablesUsed.length > 0) {
      await this.campaignVariableService.assertKnownVariables(
        workspaceId,
        variablesUsed,
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

        if (!isDefined(campaignId)) {
          const createdCampaignId = v4();
          const campaignName = name ?? DEFAULT_CAMPAIGN_NAME;

          await campaignRepository.insert({
            id: createdCampaignId,
            name: campaignName,
            status: MessageCampaignStatus.DRAFT,
            ...(isDefined(subject) && { subject }),
            ...(isDefined(stampedDocument) && {
              bodyTemplate: JSON.stringify(stampedDocument),
            }),
          });

          return {
            campaignId: createdCampaignId,
            campaignName,
            created: true,
            blockCount: stampedDocument?.content?.length,
            variablesUsed,
          };
        }

        if (!isDefined(name) && !isDefined(subject) && !isDefined(body)) {
          throw new EmailingDomainException(
            'Nothing to update: provide a name, subject or body',
            EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          );
        }

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
          {
            ...(isDefined(name) && { name }),
            ...(isDefined(subject) && { subject }),
            ...(isDefined(stampedDocument) && {
              bodyTemplate: JSON.stringify(stampedDocument),
            }),
          },
        );

        if (affected !== 1) {
          throw new EmailingDomainException(
            `Campaign ${campaignId} is no longer an editable draft`,
            EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
          );
        }

        return {
          campaignId,
          campaignName: name ?? campaign.name,
          created: false,
          blockCount: stampedDocument?.content?.length,
          variablesUsed,
        };
      },
    );
  }

  private parseAndStampDocument(body: unknown): EmailDocument {
    const parseResult = parseEmailDocument(body);

    if (!parseResult.success) {
      throw new EmailingDomainException(
        `Invalid email document: ${parseResult.error}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
      );
    }

    return this.stampDocumentDefaults(parseResult.document);
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
        canvasTheme: isDefined(document.attrs?.canvasTheme)
          ? document.attrs.canvasTheme
          : CANVAS_THEME_DEFAULTS,
      },
    };
  }
}
