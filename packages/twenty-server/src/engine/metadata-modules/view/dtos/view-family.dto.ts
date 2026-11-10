import { Field, ObjectType } from '@nestjs/graphql';

import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

@ObjectType('ViewFamily')
export class ViewFamilyDTO {
  @Field(() => String)
  familyVersion: string;

  @Field(() => [ViewDTO])
  views: ViewDTO[];
}
