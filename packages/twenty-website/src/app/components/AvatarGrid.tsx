'use client'

import styled from '@emotion/styled';

export interface User {
    login: string;
    avatarUrl: string;
  }
  

const AvatarGridContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    grid-gap: 10px;
`;

const AvatarItem = styled.div`
    position: relative;
    width: 100%;

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
        transition: opacity 0.3s ease, visibility 0.3s;
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
            {users.map(user => (
                <AvatarItem key={user.login}>
                    <img src={user.avatarUrl} alt={user.login} />
                    <span className="username">{user.login}</span>
                </AvatarItem>
            ))}
        </AvatarGridContainer>
    );
};

export default AvatarGrid;
