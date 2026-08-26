import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FlatEntityFetchShape } from 'src/engine/workspace-cache/types/flat-entity-fetch-shape.type';

// Base for the providers owning one metadata name's flat entity maps: the
// name derives the computed maps type, and the fetch shape is strictly typed
// against the metadata relation constants.
@Injectable()
export abstract class FlatEntityMapCacheProvider<
  TMetadataName extends AllMetadataName,
  TCompact = AllFlatEntityTypesByMetadataName[TMetadataName]['flatEntityMaps'],
> extends WorkspaceCacheProvider<
  AllFlatEntityTypesByMetadataName[TMetadataName]['flatEntityMaps'],
  TCompact
> {
  abstract override readonly rowsRequirement: FlatEntityFetchShape<TMetadataName>;
}
