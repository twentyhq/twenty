'use client';

import styled from '@emotion/styled';
import Link from 'next/link';

export interface User {
  login: string;
  avatarUrl: string;
}

const AvatarGridContainer = styled.div`
  margin: 0 auto;
  max-width: 1024px;
  justify-items: center;
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
`;

const AvatarItem = styled.div`
  position: relative;
  width: 124px;
  height: 124px;
  border: 3px solid #141414;
  border-radius: 16px;
  overflow: hidden;
  transition: 200ms;

  &:hover {
    -webkit-box-shadow: -6px 6px 0px 1px rgba(0, 0, 0, 1);
    -moz-box-shadow: -6px 6px 0px 1px rgba(0, 0, 0, 1);
    box-shadow: -6px 6px 0px 1px rgba(0, 0, 0, 1);
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }

  .username {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    text-align: center;
    visibility: hidden;
    opacity: 0;
    transition:
      opacity 0.3s ease,
      visibility 0.3s;
  }

  &:hover .username {
    visibility: visible;
    opacity: 1;
  }
`;

import React from 'react';

const AvatarGrid = ({ users }: { users: User[] }) => {
  return (
    <AvatarGridContainer>
      {users.map((user) => (
        <Link
          href={`/developers/contributors/${user.login}`}
          key={`l_${user.login}`}
        >
          <AvatarItem key={user.login}>
            <img src={user.avatarUrl} alt={user.login} />
            <span className="username">{user.login}</span>
          </AvatarItem>
        </Link>
      ))}
    </AvatarGridContainer>
  );
};

export default AvatarGrid;
