import React, { type ReactNode } from 'react';

interface ArticleLinkProps {
  href: string;
  children: ReactNode;
}

const ArticleLink: React.FC<ArticleLinkProps> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
);

export default ArticleLink;
