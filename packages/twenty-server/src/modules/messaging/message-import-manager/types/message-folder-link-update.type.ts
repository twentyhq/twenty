// 'replace': the message lists all its current folders, so a difference with stored links is a move.
// 'add': the message may list only some of its folders, so links accumulate.
export type MessageFolderLinkUpdate = 'add' | 'replace';
