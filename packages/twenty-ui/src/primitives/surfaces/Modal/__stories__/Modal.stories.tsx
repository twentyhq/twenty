import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IconX } from '@ui/icon';
import { H1Title, H1TitleFontColor, H2Title } from '@ui/primitives/typography';
import { Button } from '@ui/primitives/input';
import { IconButton } from '@ui/components';
import {
  Section,
  SectionAlignment,
  SectionFontColor,
} from '@ui/primitives/layout';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Modal } from '@ui/primitives/surfaces/Modal/Modal';
import { ModalContent } from '@ui/primitives/surfaces/ModalContent/ModalContent';
import { ModalFooter } from '@ui/primitives/surfaces/ModalFooter/ModalFooter';
import { ModalHeader } from '@ui/primitives/surfaces/ModalHeader/ModalHeader';

import styles from './Modal.stories.module.scss';

const meta: Meta<typeof Modal> = {
  title: 'UI/Surfaces/Modal',
  component: Modal,
  decorators: [ComponentDecorator],
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'extraLarge'],
    },
    padding: {
      control: 'select',
      options: ['none', 'small', 'medium', 'large'],
    },
    overlay: {
      control: 'select',
      options: ['light', 'dark', 'transparent'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    isOpen: true,
    size: 'medium',
    padding: 'none',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal
      isOpen={isOpen}
      size={size}
      padding={padding}
      overlay={overlay}
      ariaLabel="Edit workspace"
    >
      <ModalHeader>
        <H2Title
          title="Edit workspace"
          description="Update your workspace settings"
        />
      </ModalHeader>
      <ModalContent>
        <Section>
          Workspace name and subdomain can be changed from the settings panel.
          These changes will be reflected across all members.
        </Section>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline">{'Cancel'}</Button>
        <Button variant="solid" color="accent">
          {'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  ),
};

export const Confirmation: Story = {
  args: {
    isOpen: true,
    padding: 'large',
    overlay: 'dark',
    smallBorderRadius: true,
    narrowWidth: true,
    autoHeight: true,
    gap: 2,
  },
  render: ({
    isOpen,
    padding,
    overlay,
    smallBorderRadius,
    narrowWidth,
    autoHeight,
    gap,
  }) => (
    <Modal
      isOpen={isOpen}
      padding={padding}
      overlay={overlay}
      ariaLabel="Delete record?"
      smallBorderRadius={smallBorderRadius}
      narrowWidth={narrowWidth}
      autoHeight={autoHeight}
      gap={gap}
    >
      <div className={styles.centeredTitle}>
        <H1Title title="Delete record?" fontColor={H1TitleFontColor.Primary} />
      </div>
      <div className={styles.sectionContainer}>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          This action cannot be undone. The record and all of its data will be
          permanently removed.
        </Section>
      </div>
      <Button fullWidth variant="outline" style={{ justifyContent: 'center' }}>
        {'Cancel'}
      </Button>
      <Button
        fullWidth
        variant="outline"
        color="danger"
        style={{ justifyContent: 'center' }}
      >
        {'Delete'}
      </Button>
    </Modal>
  ),
};

export const Small: Story = {
  args: {
    isOpen: true,
    size: 'small',
    padding: 'none',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal
      isOpen={isOpen}
      size={size}
      padding={padding}
      overlay={overlay}
      ariaLabel="Archive item"
    >
      <ModalHeader>
        <H2Title title="Archive item" />
      </ModalHeader>
      <ModalContent>
        <Section>Are you sure you want to archive this item?</Section>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline">{'No'}</Button>
        <Button variant="solid" color="accent">
          {'Yes, archive'}
        </Button>
      </ModalFooter>
    </Modal>
  ),
};

export const ExtraLarge: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    isOpen: true,
    size: 'extraLarge',
    padding: 'none',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal
      isOpen={isOpen}
      size={size}
      padding={padding}
      overlay={overlay}
      ariaLabel="Import contacts"
    >
      <ModalHeader>
        <H2Title
          title="Import contacts"
          description="Upload a CSV file to import your contacts"
        />
      </ModalHeader>
      <ModalContent>
        <Section>
          The file should include columns for name, email, phone, and company.
          Drag and drop your CSV file here, or click to browse.
        </Section>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline">{'Cancel'}</Button>
        <Button variant="solid" color="accent">
          {'Upload & import'}
        </Button>
      </ModalFooter>
    </Modal>
  ),
};

export const Closed: Story = {
  args: {
    isOpen: false,
    size: 'medium',
    padding: 'medium',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal isOpen={isOpen} size={size} padding={padding} overlay={overlay}>
      <ModalContent>This should not be visible.</ModalContent>
    </Modal>
  ),
};

const InteractiveModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="solid" color="accent">
        {'Open Modal'}
      </Button>
      <Modal
        isOpen={isOpen}
        size="medium"
        padding="none"
        overlay="dark"
        onBackdropMouseDown={() => setIsOpen(false)}
      >
        <ModalHeader>
          <H2Title title="Create record" />
          <IconButton
            aria-label="Close"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            <IconX />
          </IconButton>
        </ModalHeader>
        <ModalContent>
          <Section>
            Fill in the details below to create a new record. All fields are
            optional.
          </Section>
        </ModalContent>
        <ModalFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline">
            {'Cancel'}
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="solid"
            color="accent"
          >
            {'Create'}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveModal />,
};
