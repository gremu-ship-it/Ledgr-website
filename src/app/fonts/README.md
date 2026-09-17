# Fonts

`inter-latin-wght.woff2` is the **Inter** variable font (latin subset, `wght` axis,
48 KB), vendored from [`@fontsource-variable/inter` v5.3.0](https://www.npmjs.com/package/@fontsource-variable/inter)
(file: `files/inter-latin-wght-normal.woff2`).

Licensed under the **SIL Open Font License 1.1** — see [`OFL.txt`](./OFL.txt).

## Why vendored instead of `next/font/google`

`next/font/google` downloads the font **at build time** and fails the whole build if
Google Fonts is unreachable (`next/font: error: Failed to fetch \`Inter\``). Vendoring
makes builds hermetic and reproducible, and keeps visitors from having to reach
`fonts.googleapis.com` / `fonts.gstatic.com` at runtime.

To update, refresh from the package and re-copy the file:

```bash
npm i -D @fontsource-variable/inter
cp node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2 \
   src/app/fonts/inter-latin-wght.woff2
cp node_modules/@fontsource-variable/inter/LICENSE src/app/fonts/OFL.txt
npm rm @fontsource-variable/inter
```
