import sharp from "sharp";

type WatermarkOptions = {
  label?: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function markerSvg(size: number, label: string) {
  const cleanLabel = escapeXml(label);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
      <g opacity="0.045" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="16" cy="16" r="12"/>
        <path d="M11 10h11M11 16h8M11 22h11"/>
      </g>
      <metadata>${cleanLabel}</metadata>
    </svg>
  `);
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
  const metadata = await image.metadata();
  const width = metadata.width ?? 1200;
  const height = metadata.height ?? 1200;
  const size = Math.max(12, Math.round(Math.min(width, height) * 0.018));

  return image
    .composite([
      {
        input: markerSvg(size, label),
        left: Math.max(8, width - size - 24),
        top: Math.max(8, height - size - 24)
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
