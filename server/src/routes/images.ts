import { supabase, BUCKET_NAME } from "../lib/supabase";
import { json, notFound, error } from "../lib/response";

export async function handleGetImage(id: string): Promise<Response> {
  try {
    const { data, error: dbError } = await supabase
      .from("images")
      .select("*")
      .eq("id", id)
      .single();

    if (dbError || !data) {
      return notFound("Image not found");
    }

    return json(data);
  } catch (err) {
    console.error("Get image error:", err);
    return error("Failed to get image");
  }
}

export async function handleDeleteImage(id: string): Promise<Response> {
  try {
    const { data: image, error: fetchError } = await supabase
      .from("images")
      .select("id")
      .eq("id", id)
      .single();

    if (fetchError || !image) {
      return notFound("Image not found");
    }

    // Delete storage files and DB record in parallel
    const [storageResult, dbResult] = await Promise.all([
      supabase.storage
        .from(BUCKET_NAME)
        .remove([`originals/${id}.png`, `processed/${id}.png`]),
      supabase.from("images").delete().eq("id", id),
    ]);

    if (storageResult.error) {
      console.error("Storage delete error:", storageResult.error);
    }

    if (dbResult.error) {
      console.error("Database delete error:", dbResult.error);
      return error("Failed to delete image");
    }

    return json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    return error("Failed to delete image");
  }
}
