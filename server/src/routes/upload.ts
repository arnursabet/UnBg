import { nanoid } from "nanoid";
import { supabase, BUCKET_NAME } from "../lib/supabase";
import { removeBackground } from "../lib/photoroom";
import { flipImageHorizontally } from "../lib/imageUtils";
import { json, badRequest, error } from "../lib/response";
import { config } from "../lib/config";
import { validateFileMagic, sanitizeFilename } from "../lib/security";

const MAX_FILE_SIZE = config.upload.maxFileSizeMb * 1024 * 1024;

export async function handleUpload(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image");
    const shouldMirror = formData.get("mirror") === "true";

    if (!imageFile || !(imageFile instanceof File)) {
      return badRequest("No image provided");
    }

    if (!config.upload.allowedTypes.includes(imageFile.type)) {
      return badRequest(
        `Invalid file type. Allowed: ${config.upload.allowedTypes.join(", ")}`,
      );
    }

    if (imageFile.size > MAX_FILE_SIZE) {
      return badRequest(
        `File too large. Max size: ${config.upload.maxFileSizeMb}MB`,
      );
    }

    const id = nanoid();
    const shortId = nanoid(8);
    const imageBuffer = await imageFile.arrayBuffer();

    if (!validateFileMagic(imageBuffer, imageFile.type)) {
      return badRequest("Invalid image file");
    }

    const safeFilename = sanitizeFilename(imageFile.name);

    const originalPath = `originals/${id}.png`;
    const processedPath = `processed/${id}.png`;

    const {
      data: { publicUrl: originalUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(originalPath);

    const {
      data: { publicUrl: processedUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(processedPath);

    const [originalUpload, processedBuffer] = await Promise.all([
      supabase.storage.from(BUCKET_NAME).upload(originalPath, imageBuffer, {
        contentType: "image/png",
      }),
      removeBackground(imageBuffer, safeFilename).then((buffer) =>
        shouldMirror ? flipImageHorizontally(buffer) : buffer,
      ),
    ]);

    if (originalUpload.error) {
      console.error("Original upload error:", originalUpload.error);
      return error("Failed to upload original image");
    }

    const [processedUpload, dbInsert] = await Promise.all([
      supabase.storage
        .from(BUCKET_NAME)
        .upload(processedPath, processedBuffer, {
          contentType: "image/png",
        }),
      supabase.from("images").insert({
        id,
        short_id: shortId,
        original_url: originalUrl,
        processed_url: processedUrl,
        is_mirrored: shouldMirror,
      }),
    ]);

    if (processedUpload.error) {
      console.error("Processed upload error:", processedUpload.error);
      return error("Failed to upload processed image");
    }

    if (dbInsert.error) {
      console.error("Database error:", dbInsert.error);
      return error("Failed to save image metadata");
    }

    return json(
      {
        id,
        shortId,
        originalUrl,
        processedUrl,
        shareUrl: `${config.baseUrl}/i/${shortId}`,
      },
      201,
    );
  } catch (err) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return error(message);
  }
}
