import { Field, ObjectType } from '@nestjs/graphql';

// One unique translatable string in the workspace, deduplicated by its i18n
// message id. `shipped` is the translation that applies with no workspace
// override; `override` is the workspace value-keyed override for the locale.
@ObjectType('WorkspaceTranslationBenchEntry')
export class WorkspaceTranslationBenchEntryDTO {
  @Field()
  key: string;

  @Field()
  applicationId: string;

  @Field()
  source: string;

  @Field()
  shipped: string;

  @Field(() => String, { nullable: true })
  override?: string | null;

  @Field()
  usageCount: number;
}
