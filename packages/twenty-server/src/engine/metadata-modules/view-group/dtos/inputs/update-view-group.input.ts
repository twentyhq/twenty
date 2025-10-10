import { InputType, PartialType } from '@nestjs/graphql';

import { CreateViewGroupInput } from './create-view-group.input';

@InputType()
export class UpdateViewGroupInput extends PartialType(CreateViewGroupInput) {}
