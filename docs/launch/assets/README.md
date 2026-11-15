# Original CartScope promotional artwork

These assets are original vector compositions made from CartScope's own `extension/assets/mark.svg`, type, lines, and the paper/forest palette. They are promotional illustrations, **not screenshots**. They contain no fabricated product UI, customer quotes, ratings, review counts, user counts, or Store approval badges.

| Asset | Dimensions | Use |
| --- | --- | --- |
| [Small tile PNG](store-small-tile.png) / [SVG source](store-small-tile.svg) | 440 × 280 | Optional Store promotional tile |
| [Marquee PNG](store-marquee.png) / [SVG source](store-marquee.svg) | 1400 × 560 | Optional Store marquee art |

The assets are independent of a release number, so they do not claim a published release. Actual Store screenshots must come from the submitted version running in Chrome and retain visible sample labels. Existing evidence screenshots in `docs/visuals` have their own provenance; these promotional assets do not replace them.

[The asset manifest](asset-manifest.json) records the logo source hash, generated PNG hashes, dimensions, and the fact that these images are not screenshots. [The authoring script](build-promos.mjs) generates both SVG and PNG files from the original logo. Run it with an installed `sharp` package; `CARTSCOPE_SHARP_PATH` can point to an existing package without adding any runtime dependency to CartScope:

```sh
CARTSCOPE_SHARP_PATH=/path/to/node_modules/sharp node docs/launch/assets/build-promos.mjs
```

Google's current listing guidance describes these tile dimensions and distinguishes promotional art from interface screenshots. [Store listing assets](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).
