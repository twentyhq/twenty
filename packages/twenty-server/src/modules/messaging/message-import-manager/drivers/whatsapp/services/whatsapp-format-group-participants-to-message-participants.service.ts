import { Injectable } from '@nestjs/common';

import { MessageParticipantRole } from 'twenty-shared/types';

import { MessageParticipant } from 'src/modules/messaging/message-import-manager/types/message';
import { extractParticipantName } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/extract-message-participant-name.util';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WhatsappGetAllGroupParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-all-group-participants.service';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class WhatsappFormatGroupParticipantsToMessageParticipantsService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly whatsappGetAllGroupParticipantsService: WhatsappGetAllGroupParticipantsService,
  ) {}

  async formatGroupParticipantsToMessageParticipants(
    workspaceId: string,
    group_id: string,
    senderId: string,
    businessAccountId: string,
  ): Promise<MessageParticipant[]> {
    let messageParticipants: MessageParticipant[] = [];

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'whatsapp',
          );

        const whatsappRecord = await connectedAccountRepository.findOne({
          where: {
            handle: businessAccountId,
          },
        });

        if (!whatsappRecord || !whatsappRecord.accessToken) {
          throw new Error(); // TODO: check
        }

        let participantsIds =
          await this.whatsappGetAllGroupParticipantsService.getAllWhatsappGroupParticipantsService(
            group_id,
            whatsappRecord.accessToken,
          );

        participantsIds.splice(participantsIds.indexOf(senderId), 1);
        participantsIds.splice(participantsIds.indexOf(businessAccountId), 1);
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
          );

        for (const participantId of participantsIds) {
          const participantName = extractParticipantName(
            await personRepository.findOneBy({
              whatsAppId: participantId,
            }),
          );
          const participant: MessageParticipant = {
            role: MessageParticipantRole.TO,
            handle: participantId,
            displayName: participantName,
          };

          messageParticipants.push(participant);
        }
      },
    );

    return messageParticipants;
  }
}
