import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonCreateManyWorkspaceInput } from './person-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class PersonCreateManyWorkspaceInputEnvelope {
  @Field(() => [PersonCreateManyWorkspaceInput], { nullable: false })
  @Type(() => PersonCreateManyWorkspaceInput)
  data!: Array<PersonCreateManyWorkspaceInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
