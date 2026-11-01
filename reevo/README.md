# reevo/

Fork-only files for `ReevoMY/twenty`. Upstream never touches this folder, so it never conflicts on merges. The patch list is in `../PATCHES.md`.

| Path | Patch | Purpose |
| --- | --- | --- |
| `brand/apply-brand.mjs` | P3 | Applies the brand to the source before the image build; `--check` verifies the rules still match upstream |
| `brand/brand.json` | P3 | Brand values (name, URLs) |
| `brand/rules.json` | P3 | The exact upstream strings the brand replaces |
| `brand/assets/` | P3 | Replacement icons and logos, mirroring upstream paths |
| `enterprise/check-enterprise-off.mjs` | P2 | Fails a deployment whose configuration switches on an Enterprise feature |

The scripts are plain Node (>= 18) with no dependencies.
