import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../scalars';
import { Company } from '../models/Company';
import { RefreshToken } from '../models/RefreshToken';
import { WorkspaceMember } from '../models/WorkspaceMember';
import { UserCount } from '../resolvers/outputs/UserCount';

@TypeGraphQL.ObjectType('User', {
  isAbstract: true,
})
export class User {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  id!: string;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  createdAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: false,
  })
  updatedAt!: Date;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  deletedAt?: Date | null;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  lastSeen?: Date | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  disabled!: boolean;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  displayName!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  email!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  avatarUrl?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  locale!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  phoneNumber?: string | null;

  @TypeGraphQL.Field((_type) => String, {
    nullable: true,
  })
  passwordHash?: string | null;

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: false,
  })
  emailVerified!: boolean;

  @TypeGraphQL.Field((_type) => GraphQLScalars.JSONResolver, {
    nullable: true,
  })
  metadata?: Prisma.JsonValue | null;

  WorkspaceMember?: WorkspaceMember | null;

  companies?: Company[];

  RefreshTokens?: RefreshToken[];

  @TypeGraphQL.Field((_type) => UserCount, {
    nullable: true,
  })
  _count?: UserCount | null;
}
