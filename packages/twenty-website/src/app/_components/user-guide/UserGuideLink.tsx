import React, { ReactNode } from 'react';

interface UserGuideLinkProps {
  href: string;
  children: ReactNode;
}

const UserGuideLink: React.FC<UserGuideLinkProps> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default UserGuideLink;
