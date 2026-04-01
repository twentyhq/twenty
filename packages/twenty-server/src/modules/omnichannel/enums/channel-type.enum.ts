import { registerEnumType } from '@nestjs/graphql';

export enum ChannelType {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  TELEGRAM = 'TELEGRAM',
  EMAIL = 'EMAIL',
  WEB_CHAT = 'WEB_CHAT',
}

registerEnumType(ChannelType, {
  name: 'ChannelType',
  description: 'Messaging channel type',
});
