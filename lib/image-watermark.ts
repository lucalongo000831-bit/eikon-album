import sharp from "sharp";
import path from "path";

type WatermarkOptions = {
  label?: string;
};

async function markerImage(size: number) {
  const source = path.join(process.cwd(), "public", "eikon-mark.png");
  const alpha = await sharp(source)
    .resize(size, size, { fit: "contain" })
    .ensureAlpha()
    .extractChannel("alpha")
    .linear(0.32)
    .raw()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: "#000000"
    }
  })
    .joinChannel(alpha, {
      raw: {
        width: size,
        height: size,
        channels: 1
      }
    })
    .png()
    .toBuffer();
}

export async function addPrivateWatermark(
  input: Buffer,
  options: WatermarkOptions = {}
) {
  const label =
    options.label ??
    process.env.PHOTO_WATERMARK_TEXT ??
    "EIKON private archive";
  const image = sharp(input, { failOn: "none" }).rotate();
  const size = 54;
  const marker = await markerImage(size);

  return image
    .resize(1200, 1200, { fit: "cover", position: "centre" })
    .composite([
      {
        input: marker,
        left: 1122,
        top: 1122
      }
    ])
    .jpeg({ quality: 92, mozjpeg: true })
    .withMetadata({
      exif: {
        IFD0: {
          Artist: "Luca Longo",
          Copyright: "EIKON private archive",
          ImageDescription: label
        }
      }
    })
    .toBuffer();
}
