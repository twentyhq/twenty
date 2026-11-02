import { type EntitySchema } from 'typeorm';

// Mirrors @nestjs/typeorm's EntityClassOrSchema, which its package exports no longer expose
export type EntityClassOrSchema = Function | EntitySchema;
