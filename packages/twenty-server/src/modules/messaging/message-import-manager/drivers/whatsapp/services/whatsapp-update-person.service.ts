import { Injectable } from '@nestjs/common';

import { parsePhoneNumber } from 'libphonenumber-js/max';
import { getCountryCodesForCallingCode } from 'twenty-shared/utils';

import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class WhatsappUpdatePersonService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  public async updatePerson(
    systemMessage: string | undefined,
    wa_id: string | undefined,
    workspaceId: string,
  ) {
    // if Twenty will allow importing historic messages by becoming a Business Solution Provider
    // logic must be changed (probably)
    // "User <WHATSAPP_USER_PROFILE_NAME> changed from <WHATSAPP_USER_PHONE_NUMBER> to <NEW_WHATSAPP_USER_PHONE_NUMBER>"
    // @ts-expect-error there's a system message but compiler doesn't know
    const preparedString = systemMessage
      .replace('User ', '')
      .replace('changed from ', '')
      .replace('to ', '')
      .trim()
      .split(' ');
    const formattedOldNumber = parsePhoneNumber(preparedString[1]);
    const formattedNewNumber = parsePhoneNumber(preparedString[2]);
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
          );

        if (
          await personRepository.findOneBy({
            phones: {
              primaryPhoneNumber: formattedOldNumber.nationalNumber,
              primaryPhoneCallingCode: formattedOldNumber.countryCallingCode,
            },
          })
        ) {
          await personRepository.update(
            {
              phones: {
                primaryPhoneCallingCode: formattedOldNumber.countryCallingCode,
                primaryPhoneNumber: formattedOldNumber.nationalNumber,
              },
            },
            {
              phones: {
                primaryPhoneCallingCode: formattedNewNumber.countryCallingCode,
                primaryPhoneNumber: formattedNewNumber.nationalNumber,
                primaryPhoneCountryCode: getCountryCodesForCallingCode(
                  formattedNewNumber.countryCallingCode,
                )[0], // possible discrepancies
              },
              whatsAppId: wa_id,
            },
          );
        }
        // TODO: add case where old phone number is in additionalPhones array
      },
    );
  }
}
