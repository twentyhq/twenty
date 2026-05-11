export type FileItem = {
  color: string;
  name: string;
  size: string;
  type: string;
};

export const FILES: FileItem[] = [
  { color: '#ef4444', name: 'Q3-Report.pdf', size: '2.4 MB', type: 'PDF' },
  { color: '#16a34a', name: 'Revenue-2024.xlsx', size: '1.1 MB', type: 'XLS' },
  {
    color: '#0ea5e9',
    name: 'Brand-Guidelines.docx',
    size: '840 KB',
    type: 'DOC',
  },
  { color: '#8b5cf6', name: 'Pitch-Deck.pptx', size: '5.2 MB', type: 'PPT' },
  { color: '#f59e0b', name: 'Logo-Final.png', size: '320 KB', type: 'PNG' },
  { color: '#ec4899', name: 'NDA-Signed.pdf', size: '180 KB', type: 'PDF' },
];
