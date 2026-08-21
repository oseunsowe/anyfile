import { CLOUD_AI_ENABLED } from "@/lib/featureFlags";

const REMOVE_BG_ENDPOINT = "https://api.remove.bg/v1.0/removebg";
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 12_000_000;

export class CloudFeatureDisabledError extends Error {
  constructor() {
    super("Cloud AI is disabled in this deployment.");
    this.name = "CloudFeatureDisabledError";
  }
}

export class CloudProviderNotConfiguredError extends Error {
  constructor() {
    super("Cloud provider is not configured.");
    this.name = "CloudProviderNotConfiguredError";
  }
}

export class CloudValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudValidationError";
  }
}

export async function removeBackgroundWithProvider(file: File): Promise<Response> {
  if (!CLOUD_AI_ENABLED) throw new CloudFeatureDisabledError();

  const apiKey = process.env.REMOVE_BG_API_KEY?.trim();
  if (!apiKey) throw new CloudProviderNotConfiguredError();

  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new CloudValidationError("Only JPG, PNG, and WebP are supported for background removal.");
  }

  if (file.size > MAX_BYTES) {
    throw new CloudValidationError("Background removal currently supports files up to 12 MB.");
  }

  const payload = new FormData();
  payload.append("image_file", file, file.name || "upload");
  payload.append("size", "auto");
  payload.append("format", "png");

  const response = await fetch(REMOVE_BG_ENDPOINT, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: payload,
  });

  return response;
}
