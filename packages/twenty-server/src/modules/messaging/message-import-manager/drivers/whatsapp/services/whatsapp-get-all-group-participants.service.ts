import axios from 'axios';

import { preparedWhatsappAPIAddress } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/prepared-whatsapp-api-address.util';

export const getAllWhatsappGroupParticipantsService = async (
  group_id: string,
): Promise<string[]> => {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer `, // TODO: add bearer token (how to get it???)
    },
    url: preparedWhatsappAPIAddress('/', group_id),
  };

  const data = await axios.request(options);

  return data.data.participants.participants as string[]; // array of WhatsApp IDs
};
