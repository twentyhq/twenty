type PropertySchema = {
  type: 'string' | 'number' | 'boolean';
  optional: boolean;
};

export const ALLOWED_HTML_ELEMENTS: Array<{
  tag: string;
  name: string;
  properties: Record<string, PropertySchema>;
}> = [
  // Container elements
  { tag: 'div', name: 'Div', properties: {} },
  { tag: 'span', name: 'Span', properties: {} },
  { tag: 'section', name: 'Section', properties: {} },
  { tag: 'article', name: 'Article', properties: {} },
  { tag: 'header', name: 'Header', properties: {} },
  { tag: 'footer', name: 'Footer', properties: {} },
  { tag: 'main', name: 'Main', properties: {} },
  { tag: 'nav', name: 'Nav', properties: {} },
  { tag: 'aside', name: 'Aside', properties: {} },

  // Text elements
  { tag: 'p', name: 'P', properties: {} },
  { tag: 'h1', name: 'H1', properties: {} },
  { tag: 'h2', name: 'H2', properties: {} },
  { tag: 'h3', name: 'H3', properties: {} },
  { tag: 'h4', name: 'H4', properties: {} },
  { tag: 'h5', name: 'H5', properties: {} },
  { tag: 'h6', name: 'H6', properties: {} },
  { tag: 'strong', name: 'Strong', properties: {} },
  { tag: 'em', name: 'Em', properties: {} },
  { tag: 'small', name: 'Small', properties: {} },
  { tag: 'code', name: 'Code', properties: {} },
  { tag: 'pre', name: 'Pre', properties: {} },
  { tag: 'blockquote', name: 'Blockquote', properties: {} },

  // Links & media
  {
    tag: 'a',
    name: 'A',
    properties: {
      href: { type: 'string', optional: true },
      target: { type: 'string', optional: true },
      rel: { type: 'string', optional: true },
    },
  },
  {
    tag: 'img',
    name: 'Img',
    properties: {
      src: { type: 'string', optional: true },
      alt: { type: 'string', optional: true },
      width: { type: 'number', optional: true },
      height: { type: 'number', optional: true },
    },
  },

  // Lists
  { tag: 'ul', name: 'Ul', properties: {} },
  { tag: 'ol', name: 'Ol', properties: {} },
  { tag: 'li', name: 'Li', properties: {} },

  // Forms
  {
    tag: 'form',
    name: 'Form',
    properties: {
      action: { type: 'string', optional: true },
      method: { type: 'string', optional: true },
    },
  },
  {
    tag: 'label',
    name: 'Label',
    properties: {
      htmlFor: { type: 'string', optional: true },
    },
  },
  {
    tag: 'input',
    name: 'HtmlInput',
    properties: {
      type: { type: 'string', optional: true },
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      placeholder: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      checked: { type: 'boolean', optional: true },
      readOnly: { type: 'boolean', optional: true },
    },
  },
  {
    tag: 'textarea',
    name: 'Textarea',
    properties: {
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      placeholder: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      readOnly: { type: 'boolean', optional: true },
      rows: { type: 'number', optional: true },
      cols: { type: 'number', optional: true },
    },
  },
  {
    tag: 'select',
    name: 'Select',
    properties: {
      name: { type: 'string', optional: true },
      value: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      multiple: { type: 'boolean', optional: true },
    },
  },
  {
    tag: 'option',
    name: 'Option',
    properties: {
      value: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
      selected: { type: 'boolean', optional: true },
    },
  },
  {
    tag: 'button',
    name: 'HtmlButton',
    properties: {
      type: { type: 'string', optional: true },
      disabled: { type: 'boolean', optional: true },
    },
  },

  // Table elements
  { tag: 'table', name: 'Table', properties: {} },
  { tag: 'thead', name: 'Thead', properties: {} },
  { tag: 'tbody', name: 'Tbody', properties: {} },
  { tag: 'tfoot', name: 'Tfoot', properties: {} },
  { tag: 'tr', name: 'Tr', properties: {} },
  {
    tag: 'th',
    name: 'Th',
    properties: {
      colSpan: { type: 'number', optional: true },
      rowSpan: { type: 'number', optional: true },
    },
  },
  {
    tag: 'td',
    name: 'Td',
    properties: {
      colSpan: { type: 'number', optional: true },
      rowSpan: { type: 'number', optional: true },
    },
  },

  // Other
  { tag: 'br', name: 'Br', properties: {} },
  { tag: 'hr', name: 'Hr', properties: {} },
] as const;
