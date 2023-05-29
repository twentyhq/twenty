import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CompanyCreateManyWorkspaceInput } from './company-create-many-workspace.input';
import { Type } from 'class-transformer';

@InputType()
export class CompanyCreateManyWorkspaceInputEnvelope {
  @Field(() => [CompanyCreateManyWorkspaceInput], { nullable: false })
  @Type(() => CompanyCreateManyWorkspaceInput)
  data!: Array<CompanyCreateManyWorkspaceInput>;

  @Field(() => Boolean, { nullable: true })
  skipDuplicates?: boolean;
}
