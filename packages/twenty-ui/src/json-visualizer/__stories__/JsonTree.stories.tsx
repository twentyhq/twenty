import { type Meta, type StoryObj } from '@storybook/react';
import {
  expect,
  fn,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@storybook/test';
import { JsonTree } from '@ui/json-visualizer/components/JsonTree';
import { isTwoFirstDepths } from '@ui/json-visualizer/utils/isTwoFirstDepths';

const meta: Meta<typeof JsonTree> = {
  title: 'UI/JsonVisualizer/JsonTree',
  component: JsonTree,
  args: {
    shouldExpandNodeInitially: () => true,
    emptyArrayLabel: 'Empty Array',
    emptyObjectLabel: 'Empty Object',
    emptyStringLabel: '[empty string]',
    arrowButtonCollapsedLabel: 'Expand',
    arrowButtonExpandedLabel: 'Collapse',
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof JsonTree>;

export const String: Story = {
  args: {
    value: 'Hello',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('Hello');

    expect(node).toBeVisible();
  },
};

export const StringWithSpecialCharacters: Story = {
  args: {
    value: 'Merry \n Christmas \t 🎄',
    onNodeValueClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('Merry Christmas 🎄');

    await userEvent.click(node);

    await waitFor(() => {
      expect(args.onNodeValueClick).toHaveBeenCalledWith(
        'Merry \n Christmas \t 🎄',
      );
    });
  },
};

export const Number: Story = {
  args: {
    value: 42,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('42');

    expect(node).toBeVisible();
  },
};

export const Boolean: Story = {
  args: {
    value: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('true');

    expect(node).toBeVisible();
  },
};

export const Null: Story = {
  args: {
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('null');

    expect(node).toBeVisible();
  },
};

export const ArraySimple: Story = {
  args: {
    value: [1, 2, 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const node = await canvas.findByText('3');

    expect(node).toBeVisible();
  },
};

export const ArrayEmpty: Story = {
  args: {
    value: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emptyState = await canvas.findByText('Empty Array');

    expect(emptyState).toBeVisible();
  },
};

export const ArrayNested: Story = {
  args: {
    value: [1, 2, ['a', 'b', 'c'], 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedArrayElements = await canvas.findByText('[3]');

    expect(nestedArrayElements).toBeVisible();
  },
};

export const ArrayNestedEmpty: Story = {
  args: {
    value: [1, 2, [], 3],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedArrayElements = await canvas.findByText('[0]');

    expect(nestedArrayElements).toBeVisible();

    const emptyState = await canvas.findByText('Empty Array');

    expect(emptyState).toBeVisible();
  },
};

export const ArrayWithObjects: Story = {
  args: {
    value: [
      {
        name: 'John Doe',
        age: 30,
      },
      {
        name: 'John Dowl',
        age: 42,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCounts = await canvas.findAllByText('{2}');

    expect(nestedObjectItemsCounts).toHaveLength(2);
  },
};

export const ObjectSimple: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const name = await canvas.findByText('John Doe');
    expect(name).toBeVisible();

    const age = await canvas.findByText('30');
    expect(age).toBeVisible();
  },
};

export const ObjectEmpty: Story = {
  args: {
    value: {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const emptyState = await canvas.findByText('Empty Object');

    expect(emptyState).toBeVisible();
  },
};

export const ObjectNested: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
        },
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCounts = await canvas.findAllByText('{2}');

    expect(nestedObjectItemsCounts).toHaveLength(2);
  },
};

export const ObjectNestedEmpty: Story = {
  args: {
    value: {
      person: {},
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedObjectItemsCount = await canvas.findByText('{0}');

    expect(nestedObjectItemsCount).toBeVisible();

    const emptyState = await canvas.findByText('Empty Object');

    expect(emptyState).toBeVisible();
  },
};

export const ObjectWithArray: Story = {
  args: {
    value: {
      users: [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
      ],
      settings: {
        theme: 'dark',
        notifications: true,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nestedArrayCount = await canvas.findByText('[2]');
    expect(nestedArrayCount).toBeVisible();

    const nestedObjectCounts = await canvas.findAllByText('{2}');
    expect(nestedObjectCounts).toHaveLength(3);
  },
};

export const NestedElementCanBeCollapsed: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        age: 12,
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const toggleButton = await canvas.findByRole('button', {
      name: 'Collapse',
    });

    const ageElement = canvas.getByText('age');

    await Promise.all([
      waitForElementToBeRemoved(ageElement),

      userEvent.click(toggleButton),
    ]);

    expect(toggleButton).toHaveTextContent('Expand');
  },
};

export const ExpandingElementExpandsAllItsDescendants: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: {
            name: 'USA',
            code: 'US',
          },
        },
      },
      isActive: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    {
      const allCollapseButtons = await canvas.findAllByRole('button', {
        name: 'Collapse',
      });

      expect(allCollapseButtons).toHaveLength(3);

      for (const collapseButton of allCollapseButtons.reverse()) {
        await userEvent.click(collapseButton);
      }
    }

    const rootExpandButton = await canvas.findByRole('button', {
      name: 'Expand',
    });

    await userEvent.click(rootExpandButton);

    {
      const allCollapseButtons = await canvas.findAllByRole('button', {
        name: 'Collapse',
      });

      expect(allCollapseButtons).toHaveLength(3);
    }
  },
};

export const ExpandTwoFirstDepths: Story = {
  args: {
    value: {
      person: {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'New York',
          country: {
            name: 'USA',
            code: 'US',
          },
        },
      },
      isActive: true,
    },
    shouldExpandNodeInitially: isTwoFirstDepths,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nameElement = await canvas.findByText('name');
    expect(nameElement).toBeVisible();

    const addressElement = await canvas.findByText('address');
    expect(addressElement).toBeVisible();

    const streetElement = canvas.queryByText('street');
    expect(streetElement).not.toBeInTheDocument();

    const countrCodeElement = canvas.queryByText('code');
    expect(countrCodeElement).not.toBeInTheDocument();
  },
};

export const ReallyDeepNestedObject: Story = {
  args: {
    value: {
      a: {
        b: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          k: {
                            l: {
                              m: {
                                n: {
                                  o: {
                                    p: {
                                      q: {
                                        r: {
                                          s: {
                                            t: {
                                              u: {
                                                v: {
                                                  w: {
                                                    x: {
                                                      y: {
                                                        z: {
                                                          end: true,
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        bis: {
          c: {
            d: {
              e: {
                f: {
                  g: {
                    h: {
                      i: {
                        j: {
                          k: {
                            l: {
                              m: {
                                n: {
                                  o: {
                                    p: {
                                      q: {
                                        r: {
                                          s: {
                                            t: {
                                              u: {
                                                v: {
                                                  w: {
                                                    x: {
                                                      y: {
                                                        z: {
                                                          end: true,
                                                        },
                                                      },
                                                    },
                                                  },
                                                },
                                              },
                                            },
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const finalNodes = await canvas.findAllByText('end');

    expect(finalNodes).toHaveLength(2);
    expect(finalNodes[0]).toBeVisible();
    expect(finalNodes[1]).toBeVisible();
  },
};

export const LongText: Story = {
  args: {
    value: {
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum iaculis est tincidunt, sagittis neque vitae, sodales purus.':
        'Ut lobortis ultricies purus, sit amet porta eros. Suspendisse efficitur quam vitae diam imperdiet feugiat. Etiam vel bibendum elit.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const label = await canvas.findByText(
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum iaculis est tincidunt, sagittis neque vitae, sodales purus.',
    );

    expect(label).toBeVisible();

    const value = await canvas.findByText(
      'Ut lobortis ultricies purus, sit amet porta eros. Suspendisse efficitur quam vitae diam imperdiet feugiat. Etiam vel bibendum elit.',
    );

    expect(value).toBeVisible();
  },
};

export const BlueHighlighting: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
    },
    getNodeHighlighting: () => 'blue',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const ageElement = await canvas.findByText('age');
    expect(ageElement).toBeVisible();
  },
};

export const PartialBlueHighlighting: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
      address: {
        city: 'Paris',
      },
    },
    getNodeHighlighting: (keyPath: string) =>
      keyPath === 'address' ? 'partial-blue' : undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const ageElement = await canvas.findByText('age');
    expect(ageElement).toBeVisible();
  },
};

export const RedHighlighting: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
      address: {
        city: 'Paris',
      },
    },
    getNodeHighlighting: () => 'red',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const ageElement = await canvas.findByText('age');
    expect(ageElement).toBeVisible();
  },
};

export const CopyJsonNodeValue: Story = {
  args: {
    value: {
      name: 'John Doe',
      age: 30,
    },
    onNodeValueClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const nameValue = await canvas.findByText('John Doe');

    await userEvent.click(nameValue);

    await waitFor(() => {
      expect(args.onNodeValueClick).toHaveBeenCalledWith('John Doe');
    });

    const ageValue = await canvas.findByText('30');

    await userEvent.click(ageValue);

    await waitFor(() => {
      expect(args.onNodeValueClick).toHaveBeenCalledWith('30');
    });
  },
};
