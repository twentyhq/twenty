import { Button } from '@ui/primitives/input/Button/Button';
import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';
import { Menu } from '@ui/primitives/surfaces/Menu/Menu';

type ListItemMenuExampleProps = {
  onClick?: ListItemProps['onClick'];
};

export const ListItemMenuExample = ({ onClick }: ListItemMenuExampleProps) => (
  <Menu.Root>
    <Menu.Trigger render={<Button>Record actions</Button>} />
    <Menu.Popup>
      <Menu.Item onClick={onClick}>Duplicate record</Menu.Item>
      <Menu.Item disabled onClick={onClick}>
        Unavailable action
      </Menu.Item>
      <Menu.Item>Export record</Menu.Item>
    </Menu.Popup>
  </Menu.Root>
);
