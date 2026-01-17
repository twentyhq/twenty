import { extractFolderPathFilenameAndTypeOrThrow } from '@/utils/files/extractFolderPathFilenameAndTypeOrThrow.util';

describe('extractFolderPathFilenameAndType', () => {
  it('should extract folder path, filename, and type from a basic path', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow(
      'folder/subfolder/file.txt',
    );

    expect(result).toEqual({
      folderPath: 'folder/subfolder',
      filename: 'file.txt',
      type: 'txt',
    });
  });

  it('should handle multiple dots in filename', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow(
      'path/to/file.config.json',
    );

    expect(result).toEqual({
      folderPath: 'path/to',
      filename: 'file.config.json',
      type: 'json',
    });
  });

  it('should handle filename without extension', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow('folder/Makefile');

    expect(result).toEqual({
      folderPath: 'folder',
      filename: 'Makefile',
      type: '',
    });
  });

  it('should handle file at root level', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow('document.pdf');

    expect(result).toEqual({
      folderPath: '',
      filename: 'document.pdf',
      type: 'pdf',
    });
  });

  it('should handle deeply nested paths', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow(
      'a/b/c/d/e/image.png',
    );

    expect(result).toEqual({
      folderPath: 'a/b/c/d/e',
      filename: 'image.png',
      type: 'png',
    });
  });

  it('should handle hidden files', () => {
    const result = extractFolderPathFilenameAndTypeOrThrow('folder/.gitignore');

    expect(result).toEqual({
      folderPath: 'folder',
      filename: '.gitignore',
      type: 'gitignore',
    });
  });

  it('should throw error for empty string', () => {
    expect(() => extractFolderPathFilenameAndTypeOrThrow('')).toThrow(
      'Invalid fullPath provided',
    );
  });

  it('should throw error for null value', () => {
    expect(() =>
      extractFolderPathFilenameAndTypeOrThrow(null as unknown as string),
    ).toThrow('Invalid fullPath provided');
  });

  it('should throw error for undefined value', () => {
    expect(() =>
      extractFolderPathFilenameAndTypeOrThrow(undefined as unknown as string),
    ).toThrow('Invalid fullPath provided');
  });
});
