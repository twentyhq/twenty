import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { H1Title, H1TitleFontColor, H2Title, IconX } from '@ui/display';
import { Button, IconButton } from '@ui/input';
import { Section, SectionAlignment, SectionFontColor } from '@ui/layout';
import { ComponentDecorator } from '@ui/testing';
import { themeCssVariables } from '@ui/theme-constants';

import { Modal } from '../Modal';
import { ModalContent } from '../ModalContent';
import { ModalFooter } from '../ModalFooter';
import { ModalHeader } from '../ModalHeader';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const meta: Meta<typeof Modal> = {
  title: 'UI/Layout/Modal/Modal',
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
  args: {
    isOpen: true,
    size: 'medium',
    padding: 'none',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal isOpen={isOpen} size={size} padding={padding} overlay={overlay}>
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
        <Button title="Cancel" variant="secondary" />
        <Button title="Save" variant="primary" accent="blue" />
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
      smallBorderRadius={smallBorderRadius}
      narrowWidth={narrowWidth}
      autoHeight={autoHeight}
      gap={gap}
    >
      <StyledCenteredTitle>
        <H1Title title="Delete record?" fontColor={H1TitleFontColor.Primary} />
      </StyledCenteredTitle>
      <StyledSectionContainer>
        <Section
          alignment={SectionAlignment.Center}
          fontColor={SectionFontColor.Primary}
        >
          This action cannot be undone. The record and all of its data will be
          permanently removed.
        </Section>
      </StyledSectionContainer>
      <Button title="Cancel" variant="secondary" fullWidth justify="center" />
      <Button
        title="Delete"
        variant="secondary"
        accent="danger"
        fullWidth
        justify="center"
      />
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
    <Modal isOpen={isOpen} size={size} padding={padding} overlay={overlay}>
      <ModalHeader>
        <H2Title title="Archive item" />
      </ModalHeader>
      <ModalContent>
        <Section>Are you sure you want to archive this item?</Section>
      </ModalContent>
      <ModalFooter>
        <Button title="No" variant="secondary" />
        <Button title="Yes, archive" variant="primary" accent="blue" />
      </ModalFooter>
    </Modal>
  ),
};

export const ExtraLarge: Story = {
  args: {
    isOpen: true,
    size: 'extraLarge',
    padding: 'none',
    overlay: 'dark',
  },
  render: ({ isOpen, size, padding, overlay }) => (
    <Modal isOpen={isOpen} size={size} padding={padding} overlay={overlay}>
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
        <Button title="Cancel" variant="secondary" />
        <Button title="Upload & import" variant="primary" accent="blue" />
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
      <Button
        title="Open Modal"
        variant="primary"
        accent="blue"
        onClick={() => setIsOpen(true)}
      />
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
            Icon={IconX}
            variant="tertiary"
            size="small"
            onClick={() => setIsOpen(false)}
          />
        </ModalHeader>
        <ModalContent>
          <Section>
            Fill in the details below to create a new record. All fields are
            optional.
          </Section>
        </ModalContent>
        <ModalFooter>
          <Button
            title="Cancel"
            variant="secondary"
            onClick={() => setIsOpen(false)}
          />
          <Button
            title="Create"
            variant="primary"
            accent="blue"
            onClick={() => setIsOpen(false)}
          />
        </ModalFooter>
      </Modal>
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveModal />,
};
