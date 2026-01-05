import { WHATSAPP_API_ADDRESS } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/constants/whatsapp-api-address.constant';
import { WHATSAPP_API_VERSION } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/constants/whatsapp-api-version.constant';

export const preparedWhatsappAPIAddress = (...values: string[]) => {
  return WHATSAPP_API_ADDRESS.concat(WHATSAPP_API_VERSION, '/', ...values);
};
