// Reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/history#syntax

import { type WhatsappWebhookMessageContent } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-webhook-message.type';

export type WhatsappWebhookHistory = {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string; // WABA ID
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        history: Array<{
          metadata: {
            phase: number;
            chunk_order: number;
            progress: number;
          };
          threads: WhatsappWebhookHistoryThread[];
        }>;
      };
    }>;
  }>;
};

export type WhatsappWebhookHistoryThread = {
  id: string; // user's phone number
  messages: Array<
    Omit<WhatsappWebhookMessageContent, 'group_id'> & {
      history_context: {
        status: 'DELIVERED' | 'ERROR' | 'PENDING' | 'PLAYED' | 'READ' | 'SENT';
      };
    }
  >;
};
