import { Meta, StoryObj } from '@storybook/react';

import {
  IconAt,
  IconBell,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheckbox,
  IconColorSwatch,
  IconDoorEnter,
  IconMail,
  IconSearch,
  IconSettings,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
  IconUsers,
} from 'src/display/icon';
import { GithubVersionLink } from 'src/navigation/link/components/GithubVersionLink';
import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';
import { SnackBarDecorator } from 'src/testing/decorators/SnackBarDecorator';

import { NavigationDrawer } from '../NavigationDrawer';
import { NavigationDrawerItem } from '../NavigationDrawerItem';
import { NavigationDrawerItemGroup } from '../NavigationDrawerItemGroup';
import { NavigationDrawerSection } from '../NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '../NavigationDrawerSectionTitle';

const meta: Meta<typeof NavigationDrawer> = {
  title: 'UI/Navigation/NavigationDrawer/NavigationDrawer',
  component: NavigationDrawer,
  decorators: [ComponentDecorator, RouterDecorator, SnackBarDecorator],
  parameters: { layout: 'fullscreen' },
  argTypes: { children: { control: false }, footer: { control: false } },
};

export default meta;
type Story = StoryObj<typeof NavigationDrawer>;

export const Default: Story = {
  args: {
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerItem label="Search" Icon={IconSearch} active />
          <NavigationDrawerItem
            label="Notifications"
            to="/inbox"
            Icon={IconBell}
            soon={true}
          />
          <NavigationDrawerItem
            label="Settings"
            to="/settings/profile"
            Icon={IconSettings}
          />
          <NavigationDrawerItem
            label="Tasks"
            to="/tasks"
            Icon={IconCheckbox}
            count={2}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Workspace" />
          <NavigationDrawerItem
            label="Companies"
            to="/companies"
            Icon={IconBuildingSkyscraper}
          />
          <NavigationDrawerItem label="People" to="/people" Icon={IconUser} />
          <NavigationDrawerItem label="Opportunities" Icon={IconTargetArrow} />
        </NavigationDrawerSection>
      </>
    ),
    footer: null,
  },
};

export const Submenu: Story = {
  args: {
    isSubMenu: true,
    title: 'Settings',
    children: (
      <>
        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="User" />
          <NavigationDrawerItem
            label="Profile"
            to="/settings/profile"
            Icon={IconUserCircle}
            active
          />
          <NavigationDrawerItem
            label="Appearance"
            to="/settings/profile/appearance"
            Icon={IconColorSwatch}
          />
          <NavigationDrawerItemGroup>
            <NavigationDrawerItem
              label="Accounts"
              to="/settings/accounts"
              Icon={IconAt}
            />
            <NavigationDrawerItem
              level={2}
              label="Emails"
              to="/settings/accounts/emails"
              Icon={IconMail}
            />
            <NavigationDrawerItem
              level={2}
              label="Calendar"
              to="/settings/accounts/calendars"
              Icon={IconCalendarEvent}
            />
          </NavigationDrawerItemGroup>
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Workspace" />
          <NavigationDrawerItem
            label="General"
            to="/settings/workspace"
            Icon={IconSettings}
          />
          <NavigationDrawerItem
            label="Members"
            to="/settings/workspace-members"
            Icon={IconUsers}
          />
        </NavigationDrawerSection>

        <NavigationDrawerSection>
          <NavigationDrawerSectionTitle label="Other" />
          <NavigationDrawerItem label="Logout" Icon={IconDoorEnter} />
        </NavigationDrawerSection>
      </>
    ),
    footer: <GithubVersionLink version="0.0.1" />,
  },
};
