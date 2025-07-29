import { InputType, PartialType } from '@nestjs/graphql';

import { CreateViewInput } from './create-view.input';

@InputType()
export class UpdateViewInput extends PartialType(CreateViewInput) {}
