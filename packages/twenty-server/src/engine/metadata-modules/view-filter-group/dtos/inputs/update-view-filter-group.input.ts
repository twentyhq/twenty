import { InputType, PartialType } from '@nestjs/graphql';

import { CreateViewFilterGroupInput } from './create-view-filter-group.input';

@InputType()
export class UpdateViewFilterGroupInput extends PartialType(
  CreateViewFilterGroupInput,
) {}
