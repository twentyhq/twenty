import { WHATSAPP_API_ADDRESS } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/constants/whatsapp-api-address.constant';
import { WHATSAPP_API_VERSION } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/constants/whatsapp-api-version.constant';

export const getAllWhatsappGroupParticipants = async (
  group_id: string,
): Promise<string[]> => {
  const response = await fetch(
    WHATSAPP_API_ADDRESS.concat(WHATSAPP_API_VERSION, '/', group_id),
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer `, // TODO: add bearer token
      },
    },
  );
  const data = await response.json();

  return data.data.participants.participants as string[]; // array of WhatsApp IDs
};
