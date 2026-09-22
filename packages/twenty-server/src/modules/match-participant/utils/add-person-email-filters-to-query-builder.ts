import { normalizeEmailAddress } from 'src/engine/core-modules/record-transformer/utils/normalize-email-address.util';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export interface AddPersonEmailFiltersToQueryBuilderOptions {
  queryBuilder: WorkspaceSelectQueryBuilder;
  emails: string[];
  excludePersonIds?: string[];
}

// A query builder rather than find(): matching additional emails needs the jsonb @> operator
export function addPersonEmailFiltersToQueryBuilder({
  queryBuilder,
  emails,
  excludePersonIds = [],
}: AddPersonEmailFiltersToQueryBuilderOptions): WorkspaceSelectQueryBuilder {
  const normalizedEmails = emails.map(normalizeEmailAddress);

  queryBuilder = queryBuilder
    .where('"person"."emailsPrimaryEmail" IN (:...emails)', {
      emails: normalizedEmails,
    })
    .withDeleted();

  if (excludePersonIds.length > 0) {
    queryBuilder = queryBuilder.andWhere(
      '"person"."id" NOT IN (:...excludePersonIds)',
      {
        excludePersonIds,
      },
    );
  }

  for (const [index, email] of normalizedEmails.entries()) {
    const emailParamName = `email${index}`;
    const orWhereIsInAdditionalEmail =
      excludePersonIds.length > 0
        ? `"person"."id" NOT IN (:...excludePersonIds) AND "person"."emailsAdditionalEmails" @> :${emailParamName}::jsonb`
        : `"person"."emailsAdditionalEmails" @> :${emailParamName}::jsonb`;

    queryBuilder = queryBuilder.orWhere(orWhereIsInAdditionalEmail, {
      ...(excludePersonIds.length > 0 && { excludePersonIds }),
      [emailParamName]: JSON.stringify([email]),
    });
  }

  queryBuilder = queryBuilder.withDeleted();

  return queryBuilder;
}
