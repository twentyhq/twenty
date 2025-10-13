import { InputType, PartialType } from '@nestjs/graphql';

import { CreateViewSortInput } from './create-view-sort.input';

@InputType()
export class UpdateViewSortInput extends PartialType(CreateViewSortInput) {}
