import {
  type ConnectedAccountProvider,
  type FieldActorSource,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type Contact } from 'src/modules/contact-creation-manager/types/contact.type';
import { getFirstNameAndLastNameFromPhoneDisplayName } from 'src/modules/contact-creation-manager/utils/get-first-name-and-last-name-from-phone-display-name.util';
import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { computeDisplayName } from 'src/utils/compute-display-name';
import { parsePhoneHandle } from 'src/utils/parse-phone-handle';

export const formatPhonePeopleToCreateFromContacts = ({
  contactsToCreate,
  createdBy,
}: {
  contactsToCreate: Contact[];
  createdBy: {
    source: FieldActorSource;
    workspaceMember?: WorkspaceMemberWorkspaceEntity | null;
    context: {
      provider: ConnectedAccountProvider;
    };
  };
}): Partial<PersonWorkspaceEntity>[] => {
  return contactsToCreate
    .map((contact) => {
      const parsedPhone = parsePhoneHandle(contact.handle);

      if (!isDefined(parsedPhone)) {
        return undefined;
      }

      return {
        id: v4(),
        phones: parsedPhone,
        name: getFirstNameAndLastNameFromPhoneDisplayName(contact.displayName),
        createdBy: {
          source: createdBy.source,
          workspaceMemberId: createdBy.workspaceMember?.id ?? null,
          name: computeDisplayName(createdBy.workspaceMember?.name),
          context: createdBy.context,
        },
      };
    })
    .filter(isDefined);
};
