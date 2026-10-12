import { useId, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';

import { Menu } from '../Menu';

type MenuPartsExampleProps = {
  defaultOpen?: boolean;
};

export const MenuPartsExample = ({
  defaultOpen = false,
}: MenuPartsExampleProps) => {
  const firstTriggerId = useId();
  const secondTriggerId = useId();
  const [handle] = useState(() => Menu.createHandle<{ name: string }>());

  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <Menu.Trigger
          handle={handle}
          id={firstTriggerId}
          payload={{ name: 'First record' }}
          render={<Button>First record</Button>}
        />
        <Menu.Trigger
          handle={handle}
          id={secondTriggerId}
          payload={{ name: 'Second record' }}
          render={<Button>Second record</Button>}
        />
      </div>
      <Menu.Root
        handle={handle}
        defaultOpen={defaultOpen}
        defaultTriggerId={firstTriggerId}
      >
        {({ payload }) => (
          <Menu.Portal>
            <Menu.Backdrop data-testid="menu-backdrop" />
            <Menu.Positioner
              align="end"
              collisionPadding={12}
              collisionAvoidance={{ side: 'flip', align: 'shift' }}
            >
              <Menu.Popup>
                <Menu.Arrow data-testid="menu-arrow" />
                <Menu.Viewport data-testid="menu-viewport">
                  <Menu.Group>
                    <Menu.GroupLabel>{payload?.name}</Menu.GroupLabel>
                    <Menu.LinkItem
                      href="#menu-record"
                      render={
                        <ListItem
                          render={
                            <a href="#menu-record" aria-label="Open record" />
                          }
                        />
                      }
                    >
                      Open record
                    </Menu.LinkItem>
                    <Menu.CheckboxItem
                      defaultChecked
                      endIcon={
                        <Menu.CheckboxItemIndicator data-testid="checkbox-indicator">
                          Enabled
                        </Menu.CheckboxItemIndicator>
                      }
                    >
                      Notifications
                    </Menu.CheckboxItem>
                  </Menu.Group>
                  <Menu.Separator />
                  <Menu.RadioGroup defaultValue="list">
                    <Menu.RadioItem
                      value="list"
                      endIcon={
                        <Menu.RadioItemIndicator data-testid="list-indicator">
                          Current
                        </Menu.RadioItemIndicator>
                      }
                    >
                      List view
                    </Menu.RadioItem>
                    <Menu.RadioItem
                      value="board"
                      endIcon={
                        <Menu.RadioItemIndicator data-testid="board-indicator">
                          Current
                        </Menu.RadioItemIndicator>
                      }
                    >
                      Board view
                    </Menu.RadioItem>
                  </Menu.RadioGroup>
                </Menu.Viewport>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        )}
      </Menu.Root>
    </>
  );
};
