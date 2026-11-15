import { Field, ObjectType } from '@nestjs/graphql';

import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewDTO } from 'src/engine/metadata-modules/view/dtos/view.dto';

@ObjectType('ViewFieldWithScope')
export class ViewFieldWithScopeDTO {
  @Field(() => ViewFieldDTO)
  viewField: ViewFieldDTO;

  @Field(() => ViewDTO, { nullable: true })
  scopeView: ViewDTO | null;
}
