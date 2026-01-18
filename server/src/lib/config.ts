function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

export const config = {
  port: parseInt(optionalEnv("PORT", "3000"), 10),
  baseUrl: optionalEnv("BASE_URL", "http://localhost:3000"),
  allowedOrigins: optionalEnv("ALLOWED_ORIGINS", "http://localhost:5173").split(
    ",",
  ),

  supabase: {
    url: requireEnv("SUPABASE_URL"),
    serviceKey: requireEnv("SUPABASE_SERVICE_KEY"),
    bucketName: "images",
  },

  photoroom: {
    apiKey: requireEnv("PHOTOROOM_API_KEY"),
    apiUrl: "https://sdk.photoroom.com/v1/segment",
    timeoutMs: 30000,
  },

  upload: {
    maxFileSizeMb: 10,
    allowedTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
  },
} as const;
