import { InputType, PartialType } from '@nestjs/graphql';

import { CreateViewFilterInput } from './create-view-filter.input';

@InputType()
export class UpdateViewFilterInput extends PartialType(CreateViewFilterInput) {}
