import { Field, ObjectType } from '@nestjs/graphql';

import { IPageInfo } from './interfaces/page-info.interface';
import { ConnectionCursor } from './interfaces/connection-cursor.type';

@ObjectType({ isAbstract: true })
export class PageInfo implements IPageInfo {
  @Field({ nullable: true })
  public startCursor!: ConnectionCursor;

  @Field({ nullable: true })
  public endCursor!: ConnectionCursor;

  @Field(() => Boolean)
  public hasPreviousPage!: boolean;

  @Field(() => Boolean)
  public hasNextPage!: boolean;
}
