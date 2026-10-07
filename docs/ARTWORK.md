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
