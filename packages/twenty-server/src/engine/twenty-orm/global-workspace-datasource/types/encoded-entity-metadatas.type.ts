import { type EntitySchemaOptions } from 'typeorm';

// The serializable recipe for a workspace's ORM entity metadatas: the plain
// options each EntitySchema was built from. Verified against real workspace
// metadata to contain no functions, symbols, Maps, Sets or class instances, so
// it survives JSON and rebuilds to a structurally identical metadata graph.
export type EncodedEntityMetadatas = EntitySchemaOptions<unknown>[];
