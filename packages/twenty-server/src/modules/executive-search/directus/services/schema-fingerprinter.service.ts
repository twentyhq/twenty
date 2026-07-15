import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';

import {
  DirectusCollection,
  DirectusSchemaFingerprint,
} from 'src/modules/executive-search/directus/types/directus-types';

/**
 * Computes and compares schema fingerprints to detect drift between the
 * live Directus schema and the last known-good state.
 *
 * Drift that mutates approved collections or removes mapped fields
 * should block deployment until resolved.
 */
@Injectable()
export class DirectusSchemaFingerprinterService {
  private readonly logger = new Logger(
    DirectusSchemaFingerprinterService.name,
  );

  /**
   * Serialize collections deterministically (sorted by name, subset of
   * stable attributes) and produce a hash.
   */
  computeCollectionsHash(collections: DirectusCollection[]): string {
    const sorted = [...collections].sort((a, b) =>
      a.collection.localeCompare(b.collection),
    );

    const normalized = sorted.map((c) => ({
      collection: c.collection,
      hidden: c.meta?.hidden ?? false,
      singleton: c.meta?.singleton ?? false,
    }));

    return this.hash(JSON.stringify(normalized));
  }

  /**
   * Build a complete fingerprint from a raw snapshot.
   */
  buildFingerprint(
    collections: DirectusCollection[],
    directusVersion: string,
  ): DirectusSchemaFingerprint {
    return {
      collectionsHash: this.computeCollectionsHash(collections),
      fieldsHash: this.hash(JSON.stringify(collections)),
      collectionsCount: collections.length,
      fieldsCount: this.countFields(collections),
      capturedAt: new Date().toISOString(),
      directusVersion,
    };
  }

  /**
   * Compare two fingerprints and produce a human-readable diff.
   * Returns null if they match, otherwise a structured diff object.
   */
  compare(
    previous: DirectusSchemaFingerprint,
    current: DirectusSchemaFingerprint,
  ): SchemaDriftReport | null {
    const diffs: string[] = [];

    if (previous.collectionsHash !== current.collectionsHash) {
      diffs.push(
        `Collections changed: hash ${previous.collectionsHash.slice(0, 8)} → ${current.collectionsHash.slice(0, 8)}`,
      );
    }
    if (previous.fieldsHash !== current.fieldsHash) {
      diffs.push(
        `Fields changed: hash ${previous.fieldsHash.slice(0, 8)} → ${current.fieldsHash.slice(0, 8)}`,
      );
    }
    if (previous.collectionsCount !== current.collectionsCount) {
      diffs.push(
        `Collection count: ${previous.collectionsCount} → ${current.collectionsCount}`,
      );
    }
    if (previous.fieldsCount !== current.fieldsCount) {
      diffs.push(
        `Field count: ${previous.fieldsCount} → ${current.fieldsCount}`,
      );
    }
    if (previous.directusVersion !== current.directusVersion) {
      diffs.push(
        `Directus version: ${previous.directusVersion} → ${current.directusVersion}`,
      );
    }

    if (diffs.length === 0) return null;

    return {
      hasDrift: true,
      diffs,
      previousFingerprint: previous,
      currentFingerprint: current,
    };
  }

  private hash(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }

  private countFields(collections: DirectusCollection[]): number {
    // Approximate — full field count requires fetching /fields per collection
    return collections.length;
  }
}

export interface SchemaDriftReport {
  hasDrift: true;
  diffs: string[];
  previousFingerprint: DirectusSchemaFingerprint;
  currentFingerprint: DirectusSchemaFingerprint;
}
