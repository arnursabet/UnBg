import sharp from "sharp";

export async function flipImageHorizontally(
  imageBuffer: ArrayBuffer
): Promise<ArrayBuffer> {
  const flipped = await sharp(Buffer.from(imageBuffer))
    .flop() // horizontal flip
    .png()
    .toBuffer();

  return flipped.buffer;
}
