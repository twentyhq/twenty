import { css } from '@linaria/core';

export const cssVariables = css`
  :global(:root) {
    --color-white-100: #ffffff;
    --color-white-80: #ffffffcc;
    --color-white-60: #ffffff99;
    --color-white-40: #ffffff66;
    --color-white-20: #ffffff33;
    --color-white-10: #ffffff1a;

    --color-black-100: #1c1c1c;
    --color-black-hover: #333333;
    --color-black-80: #1c1c1ccc;
    --color-black-60: #1c1c1c99;
    --color-black-40: #1c1c1c66;
    --color-black-20: #1c1c1c33;
    --color-black-10: #1c1c1c1a;
    --color-black-5: #1c1c1c0d;

    --color-blue-100: #4a38f5;
    --color-blue-70: #8174f8;

    --color-pink-100: #ed87fc;
    --color-pink-70: #f3abfd;

    --color-yellow-100: #feffb7;
    --color-yellow-70: #feffd9;

    --color-green-100: #89fc9a;
    --color-green-70: #b0fdbe;

    --color-black: #1c1c1c;
    --color-white: #ffffff;
    --color-neutral: #f4f4f4;
    --color-blue: #4a38f5;
    --color-blue-muted: #8174f8;
    --color-pink: #ed87fc;
    --color-pink-muted: #f3abfd;
    --color-yellow: #feffb7;
    --color-yellow-muted: #feffd9;
    --color-green: #89fc9a;
    --color-green-muted: #b0fdbe;

    --color-text: #1c1c1c;
    --color-text-muted: #1c1c1c99;
    --color-text-subtle: #1c1c1c66;
    --color-bg: #ffffff;
    --color-bg-muted: #f4f4f4;
    --color-border: #1c1c1c1a;
    --color-border-strong: #1c1c1c33;

    --radius-base: 2px;
    --spacing-base: 4px;

    --font-base: 0.25rem;
    --line-height-base: 0.25rem;
  }

  :global([data-scheme='dark']) {
    --color-text: #ffffff;
    --color-text-muted: #ffffffcc;
    --color-text-subtle: #ffffff99;
    --color-bg: #1c1c1c;
    --color-bg-muted: #333333;
    --color-border: #ffffff1a;
    --color-border-strong: #ffffff33;
  }
`;
