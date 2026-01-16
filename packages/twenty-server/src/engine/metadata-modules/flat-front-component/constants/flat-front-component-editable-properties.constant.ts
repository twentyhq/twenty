import { type FlatFrontComponent } from 'src/engine/metadata-modules/flat-front-component/types/flat-front-component.type';

export const FLAT_FRONT_COMPONENT_EDITABLE_PROPERTIES = [
  'name',
] as const satisfies (keyof FlatFrontComponent)[];
