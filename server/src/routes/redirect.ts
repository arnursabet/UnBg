import { supabase } from "../lib/supabase";
import { notFound, error } from "../lib/response";

export async function handleRedirect(shortId: string): Promise<Response> {
  try {
    const { data, error: dbError } = await supabase
      .from("images")
      .select("processed_url")
      .eq("short_id", shortId)
      .single();

    if (dbError || !data) {
      return notFound("Image not found");
    }

    return Response.redirect(data.processed_url, 302);
  } catch (err) {
    console.error("Redirect error:", err);
    return error("Failed to redirect");
  }
}
