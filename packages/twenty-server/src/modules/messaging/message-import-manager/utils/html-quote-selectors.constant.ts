const QUOTE_CONTAINERS = [
  'div.gmail_quote',
  'div#divRplyFwdMsg',
  'div#OLK_SRC_BODY_SECTION',
];

const REPEATED_QUOTE_CONTAINERS = [
  "div[style='border:none;border-top:solid #B5C4DF 1.0pt;padding:3.0pt 0cm 0cm 0cm']",
  "div[style='border:none;border-top:solid #E1E1E1 1.0pt;padding:3.0pt 0cm 0cm 0cm']",
  "div[style='padding-top: 5px; border-top-color: rgb(229, 229, 229); border-top-width: 1px; border-top-style: solid;']",
];

export const HTML_QUOTE_SELECTORS = {
  quoteContainers: QUOTE_CONTAINERS,
  repeatedQuoteContainers: REPEATED_QUOTE_CONTAINERS,
} as const;
