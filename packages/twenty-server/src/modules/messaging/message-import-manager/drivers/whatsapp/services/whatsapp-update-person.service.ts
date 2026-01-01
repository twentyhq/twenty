import { Injectable } from '@nestjs/common';

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
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const personRepository =
          await this.globalWorkspaceOrmManager.getRepository<PersonWorkspaceEntity>(
            workspaceId,
            'person',
          );

        await personRepository.update(
          { whatsAppPhoneNumber: { primaryPhoneNumber: oldNumber } },
          {
            whatsAppPhoneNumber: { primaryPhoneNumber: newNumber },
            whatsAppId: wa_id,
          },
        );
      },
    );
  }
}
