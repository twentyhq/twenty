import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('EnsoViewerScope')
export class EnsoViewerScopeDTO {
  // True when this viewer only sees the records they own.
  @Field(() => Boolean)
  isRecordScoped: boolean;

  // Objects to leave out of this viewer's sidebar. Empty for anyone who is not
  // record-scoped. Served from the server so the list has one home.
  @Field(() => [String])
  hiddenNavigationObjectNameSingulars: string[];
}
