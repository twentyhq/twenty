import { SelectQueryBuilder } from 'typeorm';

import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

export function buildPersonEmailQueryBuilder(
  queryBuilder: SelectQueryBuilder<PersonWorkspaceEntity>,
  emails: string[],
  excludePersonIds: string[] = [],
): SelectQueryBuilder<PersonWorkspaceEntity> {
  queryBuilder = queryBuilder
    .select([
      'person.id',
      'person.emailsPrimaryEmail',
      'person.emailsAdditionalEmails',
    ])
    .where('person.emailsPrimaryEmail IN (:...emails)', { emails });

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      'person.id NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }

  for (const [index, email] of emails.entries()) {
    const orCondition =
      excludePersonIds.length > 0
        ? 'person.id NOT IN (:...excludePersonIds) AND person.emailsAdditionalEmails @> :email' +
          index +
          '::jsonb'
        : 'person.emailsAdditionalEmails @> :email' + index + '::jsonb';

    queryBuilder = queryBuilder.orWhere(orCondition, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [`email${index}`]: JSON.stringify([email]),
    });
  }

  return queryBuilder;
}
