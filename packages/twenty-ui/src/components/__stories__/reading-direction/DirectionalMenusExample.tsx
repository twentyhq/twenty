import { Dropdown } from '@ui/components';
import { Button } from '@ui/primitives/input';
import { IconInfoCircle } from '@ui/icon';
import { Menu, Tooltip } from '@ui/primitives/surfaces';
import { ThemeProvider } from '@ui/theme';

import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';

export const DirectionalMenusExample = ({
  direction,
  scoped = true,
}: {
  direction: 'ltr' | 'rtl';
  scoped?: boolean;
}) => (
  <TextDirectionProvider direction={direction}>
    <ThemeProvider colorScheme="dark" applyToRoot={!scoped}>
      <div
        dir={direction}
        data-testid="direction-scope"
        style={{
          display: 'flex',
          gap: 24,
          padding: '100px 300px',
          minHeight: 300,
          background: 'var(--t-background-primary)',
        }}
      >
        <Menu.Root>
          <Menu.Trigger render={<Button>Open menu</Button>} />
          <Menu.Popup>
            <Menu.SubmenuRoot>
              <Menu.SubmenuTrigger>Menu export</Menu.SubmenuTrigger>
              <Menu.Popup>
                <Menu.Item>Menu CSV</Menu.Item>
              </Menu.Popup>
            </Menu.SubmenuRoot>
          </Menu.Popup>
        </Menu.Root>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger render={<Button>Open dropdown</Button>} />
          <Dropdown.Content>
            <Dropdown.Header>
              <IconInfoCircle data-testid="header-icon" />
              <Dropdown.Title>Record options</Dropdown.Title>
            </Dropdown.Header>
            <Dropdown.Submenu>
              <Dropdown.SubmenuTrigger>Dropdown export</Dropdown.SubmenuTrigger>
              <Dropdown.Content aria-label="Dropdown export formats">
                <Dropdown.ActionItem>Dropdown CSV</Dropdown.ActionItem>
              </Dropdown.Content>
            </Dropdown.Submenu>
            <Dropdown.Page id="root">
              <Dropdown.ActionItem page="details">
                Details page
              </Dropdown.ActionItem>
            </Dropdown.Page>
            <Dropdown.Page id="details">
              <Dropdown.Back />
              <Dropdown.ActionItem>Page action</Dropdown.ActionItem>
            </Dropdown.Page>
          </Dropdown.Content>
        </Dropdown.Root>
        <Tooltip.Root>
          <Tooltip.Trigger render={<Button>Tooltip target</Button>} />
          <Tooltip.Popup>Directional tooltip</Tooltip.Popup>
        </Tooltip.Root>
      </div>
    </ThemeProvider>
  </TextDirectionProvider>
);
