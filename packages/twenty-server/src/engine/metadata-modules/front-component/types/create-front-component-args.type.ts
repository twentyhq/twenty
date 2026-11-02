import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';
import { type CreateFrontComponentInput } from 'src/engine/metadata-modules/front-component/dtos/create-front-component.input';

export type CreateFrontComponentArgs = CreateFrontComponentInput &
  Partial<
    Pick<FlatFrontComponent, 'usesSdkClient' | 'universalWidgetAvailability'>
  >;
