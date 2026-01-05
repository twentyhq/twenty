import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { preparedWhatsappAPIAddress } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/prepared-whatsapp-api-address.util';

@Injectable()
export class WhatsappGetAllGroupParticipantsService {
  constructor() {}

  getAllWhatsappGroupParticipantsService = async (
    group_id: string,
    bearerToken: string,
  ): Promise<string[]> => {
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: preparedWhatsappAPIAddress(group_id),
    };

    const data = await axios.request(options);

    return data.data.participants.participants as string[]; // array of WhatsApp IDs
  };
}
