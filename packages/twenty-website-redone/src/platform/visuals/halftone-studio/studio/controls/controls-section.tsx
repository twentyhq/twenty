'use client';

import { styled } from '@linaria/react';
import { type ChangeEventHandler, type ReactNode, useId } from 'react';

import { ToggleSwitch } from './toggle-switch';

const Section = styled.div<{ $first?: boolean }>`
  border-top: ${(props) =>
    props.$first ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'};
  margin-top: ${(props) => (props.$first ? '0' : '14px')};
  padding-top: ${(props) => (props.$first ? '0' : '14px')};
`;

const SectionTitle = styled.div<{ $preserveCase?: boolean }>`
  color: rgba(255, 255, 255, 0.36);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: ${(props) => (props.$preserveCase ? '0.02em' : '0.08em')};
  margin-bottom: 10px;
  text-transform: ${(props) => (props.$preserveCase ? 'none' : 'uppercase')};
`;

const SectionHeader = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  & > ${SectionTitle} {
    margin-bottom: 0;
  }
`;

type SectionToggleHeaderProps = {
  checked: boolean;
  children: ReactNode;
  onChange: ChangeEventHandler<HTMLInputElement>;
  preserveCase?: boolean;
};

function SectionToggleHeader({
  checked,
  children,
  onChange,
  preserveCase,
}: SectionToggleHeaderProps) {
  const titleId = useId();

  return (
    <SectionHeader>
      <SectionTitle $preserveCase={preserveCase} id={titleId}>
        {children}
      </SectionTitle>
      <ToggleSwitch
        ariaLabelledBy={titleId}
        checked={checked}
        onChange={onChange}
      />
    </SectionHeader>
  );
}

export const CONTROLS_SECTION = {
  Section,
  Title: SectionTitle,
  Header: SectionHeader,
  ToggleHeader: SectionToggleHeader,
};
