import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';

import { FieldActorSource, MessageParticipantRole } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Response } from 'express';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

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
import { getAllWhatsappGroupParticipantsService } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/services/whatsapp-get-all-group-participants.service';
import { extractParticipantName } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/extract-message-participant-name.util';
import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { getFileExtension } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/get-file-extension.util';
import { validateWebhookPayload } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/validate-webhook-payload.util';

@Injectable()
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    @InjectRepository(PersonWorkspaceEntity)
    private readonly personRepository: Repository<PersonWorkspaceEntity>,
    @InjectRepository(AttachmentWorkspaceEntity)
    private readonly attachmentRepository: Repository<AttachmentWorkspaceEntity>,
    private readonly fileUploadService: FileUploadService,
    private readonly logger = new Logger('WhatsappController'),
  ) {}

  // reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint#get-requests
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Get('/whatsapp_verification')
  public whatsappVerification(
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') token: string,
    @Res() res: Response,
  ) {
    if (mode !== 'subscribe') {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error('WhatsApp webhook verification failed - wrong request');
    }
    if (token === '') {
      // TODO: fix token ^ (where it should be stored?)
      // TODO: check the response (where challenge should be send? in body as is or in json, maybe in header?)
      res.status(HttpStatus.OK).send({ challenge: challenge });
    } else {
      res.status(HttpStatus.BAD_REQUEST).send();
      this.logger.error(
        'WhatsApp webhook verification failed - invalid stored token',
      );
    }
  }

  // TODO: add custom logic guard checking if request is from legitimate IP address (or maybe better to implement mTLS?)
  // eslint-disable-next-line @nx/workspace-rest-api-methods-should-be-guarded
  @Post('/message')
  public getMessages(
    @Req() req: Request,
    @Body() body: WhatsAppWebhookMessage,
    @Res() res: Response,
  ): MessageWithParticipants[] {
    res.status(HttpStatus.OK).send(); // TODO: is it necessary to send a response?
    if (
      !validateWebhookPayload(
        req.headers.get('X-Hub-Signature-256'),
        body.toString(),
        'a', // TODO: take it from where?
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
    change: WhatsappWebhookMessageChanges,
    whatsappBusinessAccountId: string,
  ): MessageWithParticipants[] {
    // TODO: how to find sender's name in array if wa_id and from may not be the same?
    // When there are more than 1 contact?
    const messageSenderContactName =
      change.value.contacts?.[0].profile.name ?? null;

    const messageSenderId = change.value.contacts?.[0].wa_id ?? '';

    let parsedMessages: MessageWithParticipants[] = [];
    const messageReceiver: MessageParticipant = {
      role: MessageParticipantRole.TO,
      handle: change.value.metadata.display_phone_number,
      displayName: null, // TODO: store somewhere business user display name?
    };
    let participants: MessageParticipant[] = [messageReceiver];

    change.value.messages?.forEach(async (message) => {
      message.type === 'system'
        ? await this.updatePerson(message.system?.body, message.system?.wa_id)
        : message.type === 'unsupported'
          ? null // skip unsupported messages
          : parsedMessages.push(
              await this.readMessage(
                participants,
                messageSenderContactName,
                messageSenderId,
                whatsappBusinessAccountId,
                message,
              ),
            );
    });

    return parsedMessages;
  }

  private async readMessage(
    participants: MessageParticipant[],
    messageSenderContactName: string | null,
    messageSenderId: string,
    whatsappBusinessAccountId: string,
    message: WhatsappWebhookMessageContent,
  ): Promise<MessageWithParticipants> {
    let attachments: { filename: string }[] = [];
    const externalId: string = message.id;
    const receivedAt: Date = new Date(parseInt(message.timestamp));
    let text: string | null = null;

    const messageSender: MessageParticipant = {
      role: MessageParticipantRole.FROM,
      handle: message.from, // phone number
      displayName: messageSenderContactName,
    };

    participants.concat(messageSender);

    if (message.group_id !== undefined) {
      participants.concat(
        await this.formatGroupParticipantsToMessageParticipants(
          message.group_id,
          messageSenderId,
          whatsappBusinessAccountId,
        ),
      );
    }

    switch (message.type) {
      case 'audio':
        attachments.push({
          filename: await this.downloadFile(
            'AUDIO',
            'whatsapp_',
            message.audio?.mime_type,
            '',
            message.audio?.sha256,
            message.timestamp,
            message.audio?.url,
          ),
        });
        break;
      case 'button':
        text = message.button?.text ?? null;
        break;
      case 'contacts':
        // TODO: when contacts send, create a new Person record or message?
        break;
      case 'document': {
        text = message.document?.caption ?? '';
        const fileType =
          message.document?.filename.endsWith('.txt') ||
          message.document?.filename.endsWith('.doc') ||
          message.document?.filename.endsWith('.docx') ||
          message.document?.filename.endsWith('.pdf')
            ? 'TEXT_DOCUMENT'
            : message.document?.filename.endsWith('.xls') ||
                message.document?.filename.endsWith('.xlsx')
              ? 'SPREADSHEET'
              : message.document?.filename.endsWith('.ppt') ||
                  message.document?.filename.endsWith('.pptx')
                ? 'PRESENTATION'
                : 'OTHER';

        attachments.push({
          filename: await this.downloadFile(
            fileType,
            'whatsapp_',
            message.document?.mime_type,
            '',
            message.document?.sha256,
            message.timestamp,
            message.document?.url,
          ),
        });
        break;
      }
      case 'image':
        text = message.image?.caption ?? null;
        attachments.push({
          filename: await this.downloadFile(
            'IMAGE',
            'whatsapp_',
            message.image?.mime_type,
            '',
            message.image?.sha256,
            message.timestamp,
            message.image?.url,
          ),
        });
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
        text = message.order?.text ?? null; // TODO: ???
        break;
      case 'reaction':
        text =
          message.reaction?.emoji !== undefined
            ? `User reacted with ${message.reaction?.emoji} to ${message.reaction?.message_id}` // TODO: find a message text by message id?
            : `User removed ${message.reaction?.message_id} reaction to ${message.reaction?.message_id}`;
        break;
      case 'sticker':
        attachments.push({
          filename: await this.downloadFile(
            'IMAGE',
            'whatsapp_',
            message.sticker?.mime_type,
            '',
            message.sticker?.sha256,
            message.timestamp,
            message.sticker?.url,
          ),
        });
        break;
      case 'text':
        text = message.text?.body ?? null;
        break;
      case 'video':
        text = message.video?.caption ?? null;
        attachments.push({
          filename: await this.downloadFile(
            'VIDEO',
            'whatsapp_',
            message.video?.mime_type,
            '',
            message.video?.sha256,
            message.timestamp,
            message.video?.url,
          ),
        });
        break;
      default:
        break;
    }

    attachments.includes({ filename: '' })
      ? attachments.splice(
          attachments.findIndex((attachment) => attachment.filename === ''),
          1,
        )
      : null;

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

  private async updatePerson(
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

    // TODO: implement finding a person by old number and updating its number to new one (like this??)
    await this.personRepository.update(
      { whatsAppPhoneNumber: { primaryPhoneNumber: oldNumber } },
      {
        whatsAppPhoneNumber: { primaryPhoneNumber: newNumber },
        whatsAppId: wa_id,
      },
    );
  }

  private async formatGroupParticipantsToMessageParticipants(
    group_id: string,
    senderId: string,
    businessAccountId: string,
  ): Promise<MessageParticipant[]> {
    const participantsIds =
      await getAllWhatsappGroupParticipantsService(group_id);
    let messageParticipants: MessageParticipant[] = [];

    participantsIds.splice(participantsIds.indexOf(senderId), 1);
    participantsIds.splice(participantsIds.indexOf(businessAccountId), 1);
    for (const participantId of participantsIds) {
      const participantName = extractParticipantName(
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

  // 1st POC: download a file, upload them somewhere on server and store them as attachment (or maybe file?) to People records
  // TODO: change logic so files are downloaded once person records are established
  private async downloadFile(
    fileCategory: string,
    filenamePrefix: string,
    mimeType: string | undefined,
    personId: string,
    sha256: string | undefined,
    timestamp: string,
    url: string | undefined,
  ) {
    const options = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ', // TODO: bearer token stored somewhere?
      },
      url: url,
    };

    const response = await axios.request(options);
    const responseData: string = response.data; // is it really a string???
    const file: Buffer<ArrayBufferLike> = Buffer.from(responseData); // TODO: check if it's correct

    const checkIfDataIsCorrect =
      crypto.createHash('sha256').update(responseData).digest('hex') === sha256;

    if (!checkIfDataIsCorrect) {
      return '';
    }

    const fileFolder = FileFolder.Attachment;
    const fileExtension = getFileExtension(mimeType?.split(';', 2)[0] ?? '');
    const filename = filenamePrefix.concat(timestamp, '_', fileExtension);
    const workspaceId = '???'; // TODO: find a way how to retrieve a current workspace id (pass it from AuthContext somewhere)
    const uploadedFile = await this.fileUploadService.uploadFile({
      file,
      filename,
      mimeType,
      fileFolder,
      workspaceId,
    });

    this.attachmentRepository.create({
      name: uploadedFile.name,
      fullPath: uploadedFile.files[0].path,
      fileCategory: fileCategory,
      createdBy: {
        name: 'WhatsApp',
        source: FieldActorSource.IMPORT,
        workspaceMemberId: null,
      },
      personId: '', // TODO: person or personId?
    });

    return filename;
  }
  // TODO: how People records are created?
  // Logic would be to find an existing person with matching standard phone number or whatsapp number, if such doesn't exist, create new one
  // TODO: break controller into several services
}
