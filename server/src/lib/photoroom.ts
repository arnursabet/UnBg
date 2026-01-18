import { config } from "./config";

export async function removeBackground(
  imageBuffer: ArrayBuffer,
  filename: string,
): Promise<ArrayBuffer> {
  const formData = new FormData();
  formData.append(
    "image_file",
    new Blob([imageBuffer], { type: "image/png" }),
    filename,
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    config.photoroom.timeoutMs,
  );

  try {
    const response = await fetch(config.photoroom.apiUrl, {
      method: "POST",
      headers: { "x-api-key": config.photoroom.apiKey },
      body: formData,
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PhotoRoom API error: ${response.status} - ${errorText}`);
      throw new Error("Background removal failed");
    }

    return response.arrayBuffer();
  } finally {
    clearTimeout(timeoutId);
  }
}
