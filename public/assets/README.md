# public/assets

## podshar-avatar.webp

The assistant's face — the pug in a hood. Used on the round launcher in the
bottom-right corner and in the chat panel header. Shipped: 256x256 WebP, ~11 KB,
cropped square and tight on the head so it survives being drawn at 36px inside
a circle.

`AssistantAvatar` falls back to the stroke mark if the file goes missing, so
deleting it degrades rather than breaks.

Replacing it — the crop matters more than the resolution. Anything with air
around the subject turns to mush at launcher size. With Pillow:

    from PIL import Image
    im = Image.open("source.jpg").convert("RGB")
    # square window centred on the head, not on the frame
    im = im.crop((left, top, left + side, top + side)).resize((256, 256), Image.LANCZOS)
    im.save("public/assets/podshar-avatar.webp", "WEBP", quality=84, method=6)

Or with ImageMagick, if the source is already centred:

    magick source.jpg -resize 256x256^ -gravity center -extent 256x256       -quality 84 public/assets/podshar-avatar.webp

The component uses `object-center`. If a future crop is loose or off-centre,
fix the file rather than reaching for an offset anchor in CSS.
