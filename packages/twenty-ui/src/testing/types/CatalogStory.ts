import { type StoryObj } from '@storybook/react-vite';
import { type ElementType } from 'react';

import {
  type CatalogDimension,
  type CatalogOptions,
} from '../decorators/CatalogDecorator';

export type CatalogStory<
  StoryType extends StoryObj<ComponentType>,
  ComponentType extends ElementType,
> = {
  args?: StoryType['args'];
  argTypes?: StoryType['argTypes'];
  globals?: StoryType['globals'];
  play?: StoryType['play'];
  render?: StoryType['render'];
  tags?: StoryType['tags'];
  parameters: StoryType['parameters'] & {
    catalog: {
      dimensions: CatalogDimension<ComponentType>[];
      options?: CatalogOptions;
    };
  };
  decorators: StoryType['decorators'];
};
