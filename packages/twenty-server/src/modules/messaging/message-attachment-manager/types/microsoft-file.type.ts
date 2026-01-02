export type MicrosoftFile = {
  '@odata.context': string;
  '@odata.type': '#microsoft.graph.fileAttachment';
  id: string;
  lastModifiedDateTime: Date;
  name: string;
  contentType: string;
  size: number;
  isInline: boolean;
  contentId: null; // TODO: ???
  contentLocation: null;
  contentBytes: string;
};
