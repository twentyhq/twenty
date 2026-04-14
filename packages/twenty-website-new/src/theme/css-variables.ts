import { css } from "@linaria/core";

export const cssVariables = css`
  :global(:root) {
    --color-white-100: #FFFFFF;
    --color-white-80: #FFFFFFCC;
    --color-white-60: #FFFFFF99;
    --color-white-40: #FFFFFF66;
    --color-white-20: #FFFFFF33;
    --color-white-10: #FFFFFF1A;

    --color-black-100: #1C1C1C;
    --color-black-hover: #333333;
    --color-black-80: #1C1C1CCC;
    --color-black-60: #1C1C1C99;
    --color-black-40: #1C1C1C66;
    --color-black-20: #1C1C1C33;
    --color-black-10: #1C1C1C1A;
    --color-black-5: #1C1C1C0D;

    --color-blue-100: #4A38F5;
    --color-blue-70: #8174F8;

    --radius-base: 2px;
    --spacing-base: 4px;

    --font-base: 0.25rem;
    --line-height-base: 0.25rem;
  }
`;
