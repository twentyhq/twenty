import {
  EMAIL_DOCUMENT_NODE_CATALOG,
  isEmailDocumentNodeType,
  isRenderedEmailDocumentNodeType,
} from '../email-document-node-catalog';
import { TIPTAP_NODE_TYPES } from '../tiptap-node-types';

describe('EMAIL_DOCUMENT_NODE_CATALOG', () => {
  it('explicitly selects reusable TipTap nodes supported by email', () => {
    expect(isEmailDocumentNodeType(TIPTAP_NODE_TYPES.SECTION)).toBe(true);
    expect(isEmailDocumentNodeType(TIPTAP_NODE_TYPES.COLUMNS)).toBe(true);
    expect(isEmailDocumentNodeType(TIPTAP_NODE_TYPES.HTML)).toBe(true);
  });

  it('distinguishes nodes rendered by their parent from renderer entries', () => {
    expect(isRenderedEmailDocumentNodeType('paragraph')).toBe(true);
    expect(isRenderedEmailDocumentNodeType('column')).toBe(false);
    expect(isRenderedEmailDocumentNodeType('doc')).toBe(false);
  });

  it('rejects node types outside the email document vocabulary', () => {
    expect(isEmailDocumentNodeType('mentionTag')).toBe(false);
  });

  it('keeps renderer behavior in the email capability catalog', () => {
    expect(
      EMAIL_DOCUMENT_NODE_CATALOG[TIPTAP_NODE_TYPES.COLUMN].renderMode,
    ).toBe('parent');
    expect(
      EMAIL_DOCUMENT_NODE_CATALOG[TIPTAP_NODE_TYPES.SECTION].renderMode,
    ).toBe('node');
  });
});
