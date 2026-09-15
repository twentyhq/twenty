import { type Meta, type StoryObj } from '@storybook/react-vite';

import * as publicIconExports from '@ui/icon';
import {
  TWENTY_ICON_DICTIONARY,
  TWENTY_ICON_DICTIONARY_CATEGORIES,
} from '@ui/icon/constants/TwentyIconDictionary';
import { type IconComponent } from '@ui/icon/types/IconComponent';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import styles from './IconDictionary.stories.module.scss';

const getIconComponent = (iconName: string) =>
  publicIconExports[
    iconName as keyof typeof publicIconExports
  ] as IconComponent;

const IconDictionary = () => (
  <div className={styles.dictionary}>
    {TWENTY_ICON_DICTIONARY_CATEGORIES.map((category) => (
      <section className={styles.category} key={category.key}>
        <h2 className={styles.categoryTitle}>{category.label}</h2>
        {TWENTY_ICON_DICTIONARY.filter(
          (entry) => entry.category === category.key,
        ).map((entry) => {
          const Icon = getIconComponent(entry.iconName);

          return (
            <div className={styles.item} key={entry.key}>
              <span>{entry.label}</span>
              <Icon
                aria-hidden
                color="var(--t-font-color-light)"
                size={14}
                stroke={1.6}
              />
            </div>
          );
        })}
      </section>
    ))}
  </div>
);

const meta: Meta<typeof IconDictionary> = {
  title: 'UI/Icon/Icon Dictionary',
  component: IconDictionary,
  decorators: [ComponentDecorator],
  parameters: {
    container: { width: 432 },
  },
};

export default meta;

type Story = StoryObj<typeof IconDictionary>;

export const CanonicalMappings: Story = {};
