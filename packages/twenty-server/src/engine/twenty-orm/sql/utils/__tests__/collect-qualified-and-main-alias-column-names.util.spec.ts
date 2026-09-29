import { collectQualifiedAndMainAliasColumnNames } from 'src/engine/twenty-orm/sql/utils/collect-qualified-and-main-alias-column-names.util';

const collect = (expressions: string[]) =>
  collectQualifiedAndMainAliasColumnNames({
    expressions,
    mainAlias: 'messageThread',
    mainAliasColumnNames: ['id', 'subject', 'createdAt', 'text'],
    aliases: ['messageThread', 'messages'],
  });

describe('collectQualifiedAndMainAliasColumnNames', () => {
  it('reports qualified references under their alias', () => {
    expect(
      collect([
        '"messageThread"."subject" ILIKE :subject AND "messages"."text" = :text',
      ]),
    ).toEqual({ messageThread: ['subject'], messages: ['text'] });
  });

  it('attributes unqualified main alias columns to the main alias', () => {
    expect(
      collect(['subject ILIKE :subject', '("createdAt" > :since)']),
    ).toEqual({ messageThread: ['subject', 'createdAt'] });
  });

  it('ignores parameters, casts, function names and string literals', () => {
    expect(
      collect([
        `lower(:text) = 'subject' AND "messageThread"."id"::text = :id`,
      ]),
    ).toEqual({ messageThread: ['id'] });
  });

  it('ignores identifiers that are not columns of the main alias', () => {
    expect(collect(['"messages" IS NOT NULL AND unknown = 1'])).toEqual({});
  });
});
