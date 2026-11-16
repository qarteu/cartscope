# CartScope Store assets

## Actual Chrome screenshots — current upload set

The five [Preview 0.1.2 Store screenshots](screenshots/README.md) are unmodified **1280 × 800 PNGs** from the installed extension in successful [Chrome verification run 43778186951](https://github.com/qarteu/cartscope/actions/runs/43778186951). Comparison shows actual offer costs; Settings shows the privacy and data controls. The upload index links every file and explains exactly what is visible. Its [capture manifest](screenshots/capture-manifest.json) records source/package identity, capture positions, dimensions, hashes, and verification scope. These screenshots do not claim Store publication or approval.

## Original promotional artwork

These assets are original vector compositions made from CartScope's own `extension/assets/mark.svg`, type, lines, and the paper/forest palette. They are promotional illustrations, **not screenshots**. They contain no fabricated product UI, customer quotes, ratings, review counts, user counts, or Store approval badges.

| Asset | Dimensions | Use |
| --- | --- | --- |
| [Small tile PNG](store-small-tile.png) / [SVG source](store-small-tile.svg) | 440 × 280 | Optional Store promotional tile |
| [Marquee PNG](store-marquee.png) / [SVG source](store-marquee.svg) | 1400 × 560 | Optional Store marquee art |

The promotional assets are independent of a release number, so they do not claim a published release. The current actual Chrome upload screenshots are linked above. Older tall evidence screenshots in `docs/visuals` have their own provenance; these promotional assets do not replace either screenshot set.

[The asset manifest](asset-manifest.json) records the logo source hash, generated PNG hashes, dimensions, and the fact that these images are not screenshots. [The authoring script](build-promos.mjs) generates both SVG and PNG files from the original logo. Run it with an installed `sharp` package; `CARTSCOPE_SHARP_PATH` can point to an existing package without adding any runtime dependency to CartScope:

```sh
CARTSCOPE_SHARP_PATH=/path/to/node_modules/sharp node docs/launch/assets/build-promos.mjs
```

Google's current listing guidance describes these tile dimensions and distinguishes promotional art from interface screenshots. [Store listing assets](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).
