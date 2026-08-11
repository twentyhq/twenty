# Workspace cache

Per-workspace metadata (object metadata, field metadata, permissions, views, the ORM
entity graph, ...) is expensive to compute from Postgres, so it is cached in two places:
Redis, shared by every pod, and a local `Map` inside each pod.

Two independent mechanisms have historically been described with overlapping words.
They are orthogonal: one decides **what a payload looks like**, the other decides
**how a version is held in this pod's memory**.

## Encoding — the storage format

`encodeForCacheStorage` / `decodeFromCacheStorage` on each provider.

Rewrites a payload into its compact form: long property names become short codes and
empty arrays are dropped. Decoding is tolerant, so a payload written before the codec
existed passes through untouched.

Runs when a payload is written to Redis, when it is read back from Redis, and as the
first half of packing (below).

## Live and packed — the in-memory tiers

Every cached version is in exactly one of two states, both inside this pod's heap:

| state | representation | cost |
|---|---|---|
| `live` | the object graph itself | the collector traces every object on each cycle |
| `packed` | one `Buffer` of encoded JSON | the collector traces one object |

Packed versions are not remote and not evicted. They are the same data, held in a form
the garbage collector can skip.

### Packing — live to packed

`packIdleVersions`, on its own 250 ms timer, never on a request.

Each slice looks at every live version, skips any read within `MIN_IDLE_BEFORE_PACKING_MS`
(those are in the working set — packing them only buys an unpack on the next read), and
packs the least recently read versions above `LIVE_VERSIONS_PER_PROVIDER`, coldest first,
until the time budget cannot absorb another one. Candidates are re-selected each slice,
so an interrupted slice needs no cursor.

### Unpacking — packed to live

`readVersion`, on the request path, when a read lands on a packed version.

Decodes the buffer back into objects and leaves the version live, so the next read of the
same version is free. This is the price paid for packing, which is why the idle window
matters: a version packed while still in use is unpacked again immediately, and the pair
costs more than never packing it.

## Recompute — neither of the above

`computeForCache` on each provider, when Redis has no valid version for a workspace.
Reads Postgres and rebuilds the payload from scratch. Orders of magnitude more expensive
than unpacking, and unrelated to the tiering: a recomputed payload arrives live.
