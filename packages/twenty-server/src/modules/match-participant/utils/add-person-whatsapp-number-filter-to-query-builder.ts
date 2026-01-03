import { Brackets, type SelectQueryBuilder } from 'typeorm';
import { parsePhoneNumber } from 'libphonenumber-js/max';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface AddPersonWhatsappNumberFilterToQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  phoneNumbers: string[];
  excludePersonIds?: string[];
}

/**
 * Adds filters to a query builder to only return people with the given WhatsApp phone numbers.
 * We use the query builder here instead of the find method from typeorm to match the code.
 */
export function addPersonWhatsappNumberFilterToQueryBuilder({
  queryBuilder,
  phoneNumbers,
  excludePersonIds = [],
}: AddPersonWhatsappNumberFilterToQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  queryBuilder = queryBuilder.select([
    'person.id',
    'person.whatsappPhoneNumber.primaryPhoneNumber',
    'person.whatsappPhoneNumber.primaryPhoneCallingCode',
    'person.deletedAt',
  ]);
  for (const phoneNumber of phoneNumbers) {
    const parsedPhoneNumber = parsePhoneNumber(phoneNumber);

    queryBuilder = queryBuilder.orWhere(
      new Brackets((qb) => {
        qb.where(
          'person.whatsappPhoneNumber.primaryPhoneNumber = :nationalNumber',
          { nationalNumber: parsedPhoneNumber.nationalNumber },
        ).andWhere(
          'person.whatsappPhoneNumber.primaryPhoneCallingCode = :callingCode',
          { callingCode: parsedPhoneNumber.countryCallingCode },
        );
      }),
    ); // TODO: check if there's a better way to filter people by their whatsapp phone numbers
  }

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
