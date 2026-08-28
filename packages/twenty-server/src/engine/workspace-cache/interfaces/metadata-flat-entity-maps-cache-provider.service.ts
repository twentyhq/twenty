import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityTypesByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-types-by-metadata-name';
import { WorkspaceCacheProvider } from 'src/engine/workspace-cache/interfaces/workspace-cache-provider.service';
import { type FlatEntityRowsRequirement } from 'src/engine/workspace-cache/types/flat-entity-rows-requirement.type';

@Injectable()
export abstract class MetadataFlatEntityMapsCacheProvider<
  TMetadataName extends AllMetadataName,
  TCompact = AllFlatEntityTypesByMetadataName[TMetadataName]['flatEntityMaps'],
> extends WorkspaceCacheProvider<
  AllFlatEntityTypesByMetadataName[TMetadataName]['flatEntityMaps'],
  TCompact
> {
  abstract override readonly rowsRequirement: FlatEntityRowsRequirement<TMetadataName>;
}
