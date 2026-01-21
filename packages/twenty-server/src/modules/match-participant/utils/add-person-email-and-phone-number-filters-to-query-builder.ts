import { Brackets, type SelectQueryBuilder } from 'typeorm';
import { parsePhoneNumber } from 'libphonenumber-js/max';

import { type PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export interface AddPersonEmailFiltersToQueryBuilderOptions {
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>;
  emailsOrPhoneNumbers: string[];
  excludePersonIds?: string[];
}

type minimizedPhoneNumber = {
  number: string;
  callingCode: string;
};

/**
 * Adds filters to a query builder to only return people with the given emails.
 * This is used to find people by their primary or additional emails.
 * We use the query builder here instead of the find method from typeorm
 * because we need to use the jsonb @> operator to check if the email is in the additional emails array.
 *
 * @param queryBuilder - The query builder to add the filters to
 * @param emails - The emails to filter by
 * @param excludePersonIds - The person IDs to exclude from the results
 */
export function addPersonEmailAndPhoneNumberFiltersToQueryBuilder({
  queryBuilder,
  emailsOrPhoneNumbers,
  excludePersonIds = [],
}: AddPersonEmailFiltersToQueryBuilderOptions): SelectQueryBuilder<PersonWorkspaceEntity> {
  let emails: string[] = [];
  let phoneNumbers: minimizedPhoneNumber[] = [];

  for (const emailOrPhoneNumber of emailsOrPhoneNumbers) {
    if (emailOrPhoneNumber.includes('@')) {
      emails.push(emailOrPhoneNumber);
    } else {
      const parsedPhoneNumber = parsePhoneNumber(emailOrPhoneNumber);

      phoneNumbers.push({
        number: parsedPhoneNumber.nationalNumber,
        callingCode: parsedPhoneNumber.countryCallingCode,
      });
    }
  }

  const normalizedEmails = emails.map((email) => email.toLowerCase());

  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.emailsPrimaryEmail',
      'person.emailsAdditionalEmails',
      'person.phonesPrimaryPhoneCallingCode',
      'person.phonesPrimaryPhoneNumber',
      'person.phonesAdditionalPhones',
      'person.deletedAt',
    ])
    .where('LOWER(person.emailsPrimaryEmail) IN (:...emails)', {
      emails: normalizedEmails,
    })
    .withDeleted();

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }
  if (normalizedEmails.length > 0) {
    for (const [index, email] of normalizedEmails.entries()) {
      const emailParamName = `email${index}`;
      const orWhereIsInAdditionalEmail =
        excludePersonIds.length > 0
          ? `person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :${emailParamName}::jsonb`
          : `person.emailsAdditionalEmails @> :${emailParamName}::jsonb`;

      queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalEmail, {
        ...(excludePersonIds.length > 0 && { excludePersonIds }),
        [emailParamName]: JSON.stringify([email]),
      });
    }
  }
  if (phoneNumbers.length > 0) {
    for (const phoneNumber of phoneNumbers) {
      queryBuilder = queryBuilder.orWhere(
        new Brackets((qb) => {
          qb.where('person.phonesPrimaryPhoneNumber = :nationalNumber', {
            nationalNumber: phoneNumber.number,
          }).andWhere('person.phonesPrimaryPhoneCallingCode = :callingCode', {
            callingCode: phoneNumber.callingCode,
          });
        }),
      ); // TODO: check if there's a better way to filter people by their phone numbers
    }
    for (const [index, phoneNumber] of phoneNumbers.entries()) {
      const phoneParamName = `phone${index}`;
      const orWhereIsInAdditionalPhone =
        excludePersonIds.length > 0
          ? `person.id NOT IN (:...excludePersonIds) AND person.phonesAdditionalPhones @> :${phoneParamName}::jsonb`
          : `person.phonesAdditionalPhones @> :${phoneParamName}::jsonb`;

      queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalPhone, {
        ...(excludePersonIds?.length > 0 && { excludePersonIds }),
        [phoneParamName]: JSON.stringify([phoneNumber]), // TODO: check if this will create '[{"number": "...", "callingCode": "..."}]
      });
    } // TODO: is there a way to optimize this query?
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
