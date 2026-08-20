# Fonts

Self-hosted so that neither a build nor a page view ever reaches a third-party
font host. Bound to CSS variables through `next/font/local` in
`src/app/[locale]/layout.tsx`.

Every file is the `latin` subset only, matching what the site renders, and every
family is licensed under the SIL Open Font License 1.1.

- `host-grotesk-latin-variable.woff2`: Host Grotesk, variable `wght` 300-800, https://github.com/Element-Type/HostGrotesk
- `azeret-mono-latin-variable.woff2`: Azeret Mono, variable `wght` 100-900, https://github.com/displaay/azeret
- `aleo-latin-300.woff2`: Aleo Light, https://github.com/AlessioLaiso/aleo
- `vt323-latin-400.woff2`: VT323, https://github.com/phoikoi/VT323
- `inter-latin-{400,500,600}.woff2`: Inter (classic v12), https://github.com/rsms/inter

To refresh a file, take it from the family's upstream release rather than from a
font CDN.
