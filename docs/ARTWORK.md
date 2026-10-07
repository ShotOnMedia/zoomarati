# Zoomarati Game Artwork Specification

## Character master

Supply every character as transparent PNG artwork on a **512 x 512 px sRGB canvas**.

- Character faces right.
- Keep the complete character inside X 25–487 and Y 20–460.
- All ground-contact poses use **Y = 460 px as the foot/ground line**.
- Do not add a background or baked-in drop shadow.
- Do not crop hats, gloves, hands, shoes, hair, leaves or other extremities.
- Keep proportions and character scale consistent across every frame.

### Required first-pass frames

For Orange:

- `orange-idle.png`
- `orange-run-01.png`
- `orange-run-02.png`
- `orange-run-03.png`
- `orange-run-04.png`
- `orange-jump.png`
- `orange-duck.png`
- `orange-hit.png`

Run frames and grounded poses must share the same Y=460 foot line. The jump frame may lift the feet naturally, but the 512x512 canvas and character scale must remain unchanged.

Once Orange is approved, use the same master template for the other Zoomarati characters.

## Promo artwork

Promo artwork is intentionally separate from permanent scenery.

Recommended source sizes:

- Billboard: **1024 x 512 px** (2:1)
- Storefront panel: **800 x 800 px** (1:1)

Use PNG, WebP or JPEG. Keep important text/logos away from the outer 5% safe margin.

Promo files live below `public/assets/promo/` and are selected by `public/assets/promo/campaigns.json`.

An inactive campaign, an out-of-date campaign, or a campaign whose asset is missing simply falls back to an in-game house ad; gameplay must never depend on an advert loading.


## Product collectible artwork

The game has six stable collectible texture identities:

- `zoom-orange`
- `zoom-mango`
- `zoom-apple`
- `zoom-pineapple`
- `zoom-raspberry`
- `zoom-blueberry`

Supply clean product cut-outs as transparent PNG or WebP artwork. Recommended master canvas: **256 x 356 px**, portrait, with the complete pouch/product inside a 10% safe margin. Keep all flavours at the same apparent scale and baseline.

The current generated pouch art is only a fallback. Replacing it must not require changes to scoring, spawn patterns, combos or flavour metadata.

## Scenery and obstacle contract

Permanent scenery belongs to the game world, not the promo folder. Keep visual layers separate:

- distant skyline / landscape: decorative only;
- shop façades and street furniture: decorative only;
- promo billboard/storefront surfaces: campaign-controlled;
- hazards: gameplay collision objects and must have strong, readable silhouettes;
- collectibles and power-ups: gameplay objects and should remain visually dominant.

Recommended source masters:

- shop/background section: **1120 x 300 px** or larger at the same aspect ratio;
- compact street prop: **256 x 256 px** transparent;
- ground hazard: **256 x 256 px** transparent;
- wide/overhead hazard: **512 x 256 px** transparent.

Do not bake collision guides, shadows that extend far outside the object, or advertising into permanent scenery.

## Promo campaign weighting

`weight` is a **relative frequency from 1–100**. Values do not need to add up to 100.

For example, three eligible campaigns with weights 10, 30 and 60 will receive approximately 10%, 30% and 60% of selections over a large sample. Date and active-status filtering happens before weighting.

Keep in-world promo surfaces non-interactive during a run. Any future click/tap destination should be exposed from menus or result screens so an attempted jump cannot accidentally navigate away from gameplay.
