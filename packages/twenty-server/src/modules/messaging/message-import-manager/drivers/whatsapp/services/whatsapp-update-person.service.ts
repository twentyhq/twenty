import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

@Injectable()
export class WhatsappUpdatePersonService {
  constructor(
    @InjectRepository(PersonWorkspaceEntity)
    private readonly personRepository: Repository<PersonWorkspaceEntity>,
  ) {}

  public async updatePerson(
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
}
