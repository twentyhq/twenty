import { Injectable } from '@nestjs/common';

import axios from 'axios';

import { preparedWhatsappAPIAddress } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/prepared-whatsapp-api-address.util';
import { WhatsappApiNumberResponse } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-api-number-response.type';
import { WhatsappApiAssignedUser } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/types/whatsapp-api-assigned-user.type';
import { formatWhatsappPhoneNumberUtil } from 'src/modules/messaging/message-import-manager/drivers/whatsapp/utils/format-whatsapp-phone-number.util';

@Injectable()
export class WhatsappGetAssociatedPhoneNumbersService {
  constructor() {}

  async getAssociatedPhoneNumbers(
    wabaId: string,
    bearerToken: string,
  ): Promise<string[]> {
    let userIds: string[] = [];
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: preparedWhatsappAPIAddress(
        wabaId,
        '/assigned_users?limit=100&fields=id,name,user_type',
      ),
    };

    try {
      let phoneNumbers: string[] = [];
      const response = await axios.request(options);
      let data = response.data as WhatsappApiNumberResponse;

      if (data.single_user !== undefined) {
        userIds.push(data.single_user.value.data.id);
      }
      if (data.multiple_users !== undefined) {
        for (const user of data.multiple_users.value.data) {
          userIds.push(user.id);
        }
        while (data.multiple_users?.value.paging?.cursors.after !== undefined) {
          const options2 = {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${bearerToken}`,
            },
            url: preparedWhatsappAPIAddress(
              wabaId,
              '/assigned_users?limit=100&fields=id,name,user_type&after=',
              data.multiple_users.value.paging.cursors.after,
            ),
          };
          const response2 = await axios.request(options2);

          data = response2.data as WhatsappApiNumberResponse;
          if (data.multiple_users !== undefined) {
            for (const user of data.multiple_users.value.data) {
              userIds.push(user.id);
            }
          }
        }
      }
      for (const userId in userIds) {
        const userPhoneNumbers = await this.getPhoneNumberFromUserData(
          userId,
          bearerToken,
          wabaId,
        );

        phoneNumbers.push(...userPhoneNumbers);
      }

      return phoneNumbers;
    } catch (error) {
      throw new Error(error);
    }
  }

  private async getPhoneNumberFromUserData(
    userId: string,
    bearerToken: string,
    wabaId: string,
  ): Promise<string[]> {
    let phoneNumbers: string[] = [];
    const options = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      url: preparedWhatsappAPIAddress(
        userId,
        '/assigned_whatsapp_business_accounts?fields=business_id,phone_numbers',
      ),
    };

    try {
      const response = await axios.request(options);
      const data = response.data as WhatsappApiAssignedUser;

      if (data.no_accounts !== undefined) {
        return phoneNumbers;
      }
      if (data.single_account !== undefined) {
        for (const number of data.single_account.value.data[0].phone_numbers) {
          phoneNumbers.push(
            formatWhatsappPhoneNumberUtil(number.display_phone_number),
          );
        }
      }
      if (data.multiple_accounts !== undefined) {
        // realistically speaking, I don't think there can be a user with more than 100 assigned business accounts
        // if that changes, I'll fix it
        data.multiple_accounts.value.data
          .filter(
            (businessData: { business_id: string }) =>
              businessData.business_id === wabaId,
          )[0]
          .phone_numbers.forEach((phone) => {
            phoneNumbers.push(
              formatWhatsappPhoneNumberUtil(phone.display_phone_number),
            );
          });
      }

      return phoneNumbers;
    } catch (error) {
      throw new Error(error);
    }
  }
}
