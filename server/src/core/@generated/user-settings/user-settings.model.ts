import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { ID } from '@nestjs/graphql';
import { ColorScheme } from '../prisma/color-scheme.enum';
import { User } from '../user/user.model';

@ObjectType()
export class UserSettings {

    @Field(() => ID, {nullable:false})
    id!: string;

    @Field(() => ColorScheme, {nullable:false,defaultValue:'System'})
    colorScheme!: keyof typeof ColorScheme;

    @Field(() => String, {nullable:false})
    locale!: string;

    @Field(() => Date, {nullable:false})
    createdAt!: Date;

    @Field(() => Date, {nullable:false})
    updatedAt!: Date;

    @Field(() => User, {nullable:true})
    user?: User | null;
}
