export type DropdownRow = {
  id: string;
  kind: 'action' | 'option' | 'back' | 'submenu-trigger';
  disabled: boolean;
  page?: string;
  element: HTMLElement;
};
