import { type SelectQueryBuilder } from 'typeorm';
import { parsePhoneNumber, type PhoneNumber } from 'libphonenumber-js/max';

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

  const parsedPhoneNumber: PhoneNumber[] = [];

  for (const phoneNumber of phoneNumbers) {
    parsedPhoneNumber.push(parsePhoneNumber(phoneNumber));
  }
  for (const [index, phoneNumber] of parsedPhoneNumber.entries()) {
    const callingPhoneParam = `callingCode${index}`;
    const nationalNumberParam = `nationalNumber${index}`;
    const orWhereIsPrimaryNumberEqual =
      excludePersonIds.length > 0
        ? `person.id NOT IN (:...excludePersonIds) AND person.whatsappPhoneNumberPrimaryPhoneNumber = :${nationalNumberParam} AND person.whatsappPhoneNumberPrimaryPhoneCallingCode = :${callingPhoneParam}`
        : `person.whatsappPhoneNumberPrimaryPhoneNumber = :${nationalNumberParam} AND person.whatsappPhoneNumberPrimaryPhoneCallingCode = :${callingPhoneParam}`;

    queryBuilder = queryBuilder.orWhere(orWhereIsPrimaryNumberEqual, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [nationalNumberParam]: phoneNumber.nationalNumber,
      [callingPhoneParam]: phoneNumber.countryCallingCode,
    });
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
