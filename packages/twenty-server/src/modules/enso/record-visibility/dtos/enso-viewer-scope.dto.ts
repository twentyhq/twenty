import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType('EnsoDefaultView')
export class EnsoDefaultViewDTO {
  @Field(() => String)
  objectMetadataId: string;

  @Field(() => String)
  viewId: string;
}

@ObjectType('EnsoViewerScope')
export class EnsoViewerScopeDTO {
  // True when this viewer only sees the records they own.
  @Field(() => Boolean)
  isRecordScoped: boolean;

  // Objects to leave out of this viewer's sidebar. Empty for anyone who is not
  // record-scoped. Served from the server so the list has one home.
  @Field(() => [String])
  hiddenNavigationObjectNameSingulars: string[];

  // The view this viewer should land on per object, ahead of the workspace
  // INDEX view. Empty when their role has no defaults configured.
  @Field(() => [EnsoDefaultViewDTO])
  defaultViews: EnsoDefaultViewDTO[];
}

@InputType('EnsoDefaultViewInput')
export class EnsoDefaultViewInput {
  @Field(() => String)
  objectMetadataId: string;

  @Field(() => String)
  viewId: string;
}
