declare module 'pdfkit' {
  type PdfTextAlignment = 'center' | 'justify' | 'left' | 'right';

  type PdfTextOptions = {
    align?: PdfTextAlignment;
    features?: string[];
    width?: number;
  };

  type PdfDocumentOptions = {
    margin?: number;
    size?: string;
  };

  class PDFDocument {
    constructor(options?: PdfDocumentOptions);

    info: {
      Author?: string;
      Title?: string;
    };

    page: {
      height: number;
      margins: {
        bottom: number;
      };
    };

    y: number;

    addPage(): this;
    end(): void;
    fillColor(color: string): this;
    font(path: string): this;
    fontSize(size: number): this;
    moveDown(lines?: number): this;
    on(event: 'data', listener: (chunk: Buffer) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'error', listener: (error: Error) => void): this;
    text(text: string, options?: PdfTextOptions): this;
  }

  export = PDFDocument;
}
