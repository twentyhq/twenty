import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';
import ExpandableContainer from '../ExpandableContainer';

const StyledButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.color.blue50};
  color: ${({ theme }) => theme.font.color.primary};
  border: none;
  border-radius: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  &:hover {
    background-color: ${({ theme }) => theme.color.blue40};
  }
`;

const StyledContent = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  height: 200px;
  padding: ${({ theme }) => theme.spacing(3)};

  p {
    color: ${({ theme }) => theme.font.color.primary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;

const ExpandableContainerWithButton = (args: any) => {
  const [isExpanded, setIsExpanded] = useState(args.isExpanded);

  return (
    <div>
      <StyledButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </StyledButton>
      <ExpandableContainer isExpanded={isExpanded}>
        <StyledContent>
          <p>
            This is some content inside the ExpandableContainer. It will grow
            and shrink depending on the expand/collapse state.
          </p>
          <p>
            Add more text or even other components here to test how the
            container handles more content.
          </p>
          <p>
            Feel free to adjust the height and content to see how it affects the
            expand/collapse behavior.
          </p>
        </StyledContent>
      </ExpandableContainer>
    </div>
  );
};

const meta: Meta<typeof ExpandableContainer> = {
  title: 'UI/Layout/ExpandableContainer',
  component: ExpandableContainerWithButton,
  decorators: [ComponentDecorator],
  argTypes: {
    isExpanded: {
      control: 'boolean',
      description: 'Controls whether the container is expanded or collapsed',
      defaultValue: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ExpandableContainerWithButton>;

export const Default: Story = {
  args: {
    isExpanded: false,
  },
};
