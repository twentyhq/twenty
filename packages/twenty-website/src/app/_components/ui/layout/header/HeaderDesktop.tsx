'use client';

import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconBook, IconChevronDown, IconRobotFace } from '@tabler/icons-react';

import { ExternalArrow, GithubIcon } from '@/app/_components/ui/icons/SvgIcons';
import { CallToAction } from '@/app/_components/ui/layout/header/callToAction';
import {
  DesktopNav,
  LinkList,
  ListItem,
  LogoContainer,
} from '@/app/_components/ui/layout/header/styled';
import { Logo } from '@/app/_components/ui/layout/Logo';
import { Theme } from '@/app/_components/ui/theme/theme';
import { formatNumberOfStars } from '@/shared-utils/formatNumberOfStars';

const DropdownMenu = styled.ul<{ open: boolean }>`
  display: ${(props) => (props.open ? 'block' : 'none')};
  position: absolute;
  top: 100%;
  left: 0;
  list-style: none;
  background: white;
  border: 1px solid black;
  border-radius: 8px;
  padding: 2px 0;
  margin: 4px 0px;
  width: 150px;
`;

const DropdownItem = styled.a`
  color: rgb(71, 71, 71);
  text-decoration: none;
  padding-left: 14px;
  padding-right: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  margin: 0px 2px;
  border-radius: 4px;
  font-size: 15px;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const Dropdown = styled.div`
  color: rgb(71, 71, 71);
  text-decoration: none;
  display: flex;
  gap: 4px;
  align-items: center;
  border-radius: 8px;
  height: 40px;
  padding-left: 16px;
  padding-right: 16px;
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: #f1f1f1;
  }
`;

const StyledIconContainer = styled.div`
  border: 1px solid ${Theme.text.color.secondary};
  border-radius: ${Theme.border.radius.sm};
  display: flex;
  align-items: center;
  padding: 2px;
`;

const StyledChevron = styled.div`
  display: flex;
  align-items: center;
  margin-top: 2px;
  color: rgb(179, 179, 179);
`;

const Arrow = styled.div<{ open: boolean }>`
  display: inline-block;
  margin-left: 5px;
  transition: transform 0.3s;
  transform: ${(props) => (props.open ? 'rotate(180deg)' : 'rotate(0deg)')};
`;

type Props = {
  numberOfStars: number;
};

export const HeaderDesktop = ({ numberOfStars }: Props) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <DesktopNav>
      <LogoContainer>
        <Logo />
      </LogoContainer>
      <LinkList>
        <ListItem href="/story">Story</ListItem>
        <ListItem href="/pricing">Pricing</ListItem>
        <ListItem href="/releases">Releases</ListItem>
        <Dropdown
          ref={dropdownRef}
          style={{ position: 'relative' }}
          onClick={toggleDropdown}
        >
          Docs
          <Arrow open={dropdownOpen}>
            <StyledChevron>
              <IconChevronDown size={Theme.icon.size.sm} />
            </StyledChevron>
          </Arrow>
          <DropdownMenu open={dropdownOpen}>
            <DropdownItem href="/user-guide">
              <StyledIconContainer>
                <IconBook size={Theme.icon.size.md} />
              </StyledIconContainer>
              User Guide
            </DropdownItem>
            <DropdownItem href="/developers">
              <StyledIconContainer>
                <IconRobotFace size={Theme.icon.size.md} />
              </StyledIconContainer>
              Developers
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <ListItem href="https://github.com/twentyhq/twenty">
          <GithubIcon color="rgb(71,71,71)" />
          {formatNumberOfStars(numberOfStars)}
          <ExternalArrow />
        </ListItem>
      </LinkList>
      <CallToAction />
    </DesktopNav>
  );
};
