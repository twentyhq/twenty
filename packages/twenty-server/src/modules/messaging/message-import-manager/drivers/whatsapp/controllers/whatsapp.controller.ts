import { Body, Controller, Injectable, Post, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';

import { MessageParticipantRole } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import {
  WhatsAppWebhookMessage,
  WhatsappWebhookMessageChanges,
  WhatsappWebhookMessageContent,
} from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-message.type';
import {
  MessageParticipant,
  MessageWithParticipants,
} from 'src/modules/messaging/message-import-manager/types/message';
import { MessageDirection } from 'src/modules/messaging/common/enums/message-direction.enum';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { getAllWhatsappGroupParticipants } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-all-group-participants.service';

@Injectable()
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @InjectRepository(PersonWorkspaceEntity)
    private readonly personRepository: Repository<PersonWorkspaceEntity>,
  ) {}

  // TODO: add custom logic guard checking if request is from legitimate IP address
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Post('/message')
  public getMessages(
    @Req() req: Request,
    @Body() body: WhatsAppWebhookMessage,
  ): MessageWithParticipants[] {
    if (
      !this.validateWebhookPayload(
        req.headers.get('X-Hub-Signature-256'),
        body.toString(),
        'a',
      )
    ) {
      return [];
    }
    let convertedMessages: MessageWithParticipants[] = [];

    body.entry.forEach((entry) => {
      const whatsappBusinessAccountId = entry.id;

      entry.changes.forEach((change) =>
        change.value.errors === undefined
          ? convertedMessages.concat(
              this.convertFromWhatsappMessageToMessageWithParticipants(
                change,
                whatsappBusinessAccountId,
              ),
            )
          : '',
      );
    });

    return convertedMessages;
  }

  private convertFromWhatsappMessageToMessageWithParticipants(
    message: WhatsappWebhookMessageChanges,
    whatsappBusinessAccountId: string,
  ): MessageWithParticipants[] {
    // TODO: how to find sender's name in array if wa_id and from may not be the same?
    // When there are more than 1 contact?
    const senderData =
      message.value.contacts?.length !== undefined
        ? message.value.contacts?.length > 0
          ? {
              senderDisplayName: message.value.contacts[0].profile.name,
              senderWhatsappId: message.value.contacts[0].wa_id,
            }
          : null
        : null;

    let parsedMessages: MessageWithParticipants[] = [];
    const messageSender: MessageParticipant = {
      role: MessageParticipantRole.FROM,
      handle: null, //TODO: fix (wa_id or phone number?)
      displayName: senderData?.senderDisplayName ?? null,
    };
    const messageReceiver: MessageParticipant = {
      role: MessageParticipantRole.TO,
      handle: null, //TODO: fix
      displayName: null,
    };
    let participants: MessageParticipant[] = [messageSender, messageReceiver];

    // TODO: files are unsupported as direct attachment so download them, upload them somewhere and attach directly to related People records?
    message.value.messages?.forEach(async (message) => {
      message.type === 'system'
        ? this.updatePerson(message.system?.body, message.system?.wa_id)
        : message.type === 'unsupported'
          ? null // skip unsupported messages
          : parsedMessages.push(
              await this.readMessage(
                participants,
                senderData,
                whatsappBusinessAccountId,
                message,
              ),
            );
    });

    return parsedMessages;
  }

  private async readMessage(
    participants: MessageParticipant[],
    senderData: { senderDisplayName: string; senderWhatsappId: string } | null,
    whatsappBusinessAccountId: string,
    message: WhatsappWebhookMessageContent,
  ): Promise<MessageWithParticipants> {
    let attachments: { filename: string }[] = []; // TODO: ???
    const externalId: string = message.id;
    const receivedAt: Date = new Date(parseInt(message.timestamp));
    let text: string | null = null;

    if (message.group_id !== undefined) {
      participants.concat(
        await this.formatGroupParticipantsToMessageParticipants(
          message.group_id,
          senderData?.senderWhatsappId ?? '',
          whatsappBusinessAccountId,
        ),
      );
    }

    switch (message.type) {
      case 'audio':
        // TODO: attachments
        break;
      case 'button':
        text = message.button?.text ?? '';
        break;
      case 'contacts':
        // TODO: when contacts send, create a new Person record or message?
        break;
      case 'document':
        text = message.document?.caption ?? '';
        break;
      case 'image':
        text = message.image?.caption ?? '';
        // TODO: attachments
        break;
      case 'interactive':
        text =
          message.interactive?.button_reply?.title ??
          `${message.interactive?.list_reply?.title} - ${message.interactive?.list_reply?.description}`;
        break;
      case 'location':
        text = `Place: ${message.location?.name}\nAddress: ${message.location?.address}Lat: ${message.location?.latitude}Long: ${message.location?.longitude}URL: <a href='${message.location?.url}'>${message.location?.url}</a>`;
        break;
      case 'order':
        text = message.order?.text ?? ''; // TODO: ???
        break;
      case 'reaction':
        text =
          message.reaction?.emoji !== undefined
            ? `User reacted with ${message.reaction?.emoji} to ${message.reaction?.message_id}` // TODO: find a message text by message id?
            : `User removed ${message.reaction?.message_id} reaction to ${message.reaction?.message_id}`;
        break;
      case 'sticker':
        // TODO: attachments
        break;
      case 'text':
        text = message.text?.body ?? '';
        break;
      case 'video':
        text = message.video?.caption ?? '';
        break;
      default:
        break;
    }

    return {
      headerMessageId: null,
      receivedAt: receivedAt,
      subject: null,
      text: text,
      attachments: attachments,
      externalId: externalId,
      messageThreadExternalId: '',
      direction: MessageDirection.INCOMING,
      participants: participants,
    };
  }

  private validateWebhookPayload(
    sha256_signature: string | null,
    payload: string,
    app_secret: string,
  ): boolean {
    const webhookSignature = sha256_signature?.replace('sha256=', '').trim(); // https://developers.facebook.com/docs/graph-api/webhooks/getting-started#validate-payloads
    const generatedHash = crypto
      .createHash('sha256')
      .update(payload)
      .update(app_secret)
      .digest('hex');

    return webhookSignature === generatedHash;
  }

  private updatePerson(
    systemMessage: string | undefined,
    wa_id: string | undefined,
  ) {
    // "User <WHATSAPP_USER_PROFILE_NAME> changed from <WHATSAPP_USER_PHONE_NUMBER> to <NEW_WHATSAPP_USER_PHONE_NUMBER>"
    // @ts-expect-error there's a system message but compiler doesn't know
    const preparedString = systemMessage
      .replace('User ', '')
      .replace('changed from ', '')
      .replace('to ', '')
      .trim()
      .split(' ');
    const oldNumber = preparedString[1];
    const newNumber = preparedString[2];
    // TODO: implement finding a person by old number and updating its number to new one
  }

  private async formatGroupParticipantsToMessageParticipants(
    group_id: string,
    senderId: string,
    businessAccountId: string,
  ): Promise<MessageParticipant[]> {
    const participantsIds = await getAllWhatsappGroupParticipants(group_id);
    let messageParticipants: MessageParticipant[] = [];

    participantsIds.splice(participantsIds.indexOf(senderId), 1);
    participantsIds.splice(participantsIds.indexOf(businessAccountId), 1);
    for (const participantId of participantsIds) {
      const participantName = this.extractParticipantName(
        await this.personRepository.findOneBy({
          id: participantId,
        }),
      );
      const participant: MessageParticipant = {
        role: MessageParticipantRole.TO,
        handle: participantId,
        displayName: participantName,
      };

      messageParticipants.push(participant);
    }

    return messageParticipants;
  }

  private extractParticipantName(person: PersonWorkspaceEntity | null) {
    return person !== null
      ? `${person.name?.firstName} ${person.name?.lastName}`
      : null;
  }
}
