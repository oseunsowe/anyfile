function nextName(name: string): string {
  const index = name.lastIndexOf(".");
  const base = index > 0 ? name.slice(0, index) : name;
  return `${base}-no-bg.png`;
}

export async function removeBackgroundInCloud(
  file: File,
  options: { signal?: AbortSignal } = {},
): Promise<File> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch("/api/cloud/remove-background", {
    method: "POST",
    body: formData,
    signal: options.signal,
  });

  if (!response.ok) {
    let message = "Cloud background removal failed.";
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // Preserve the generic fallback if the response is not JSON.
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  return new File([blob], nextName(file.name), {
    type: blob.type || "image/png",
    lastModified: Date.now(),
  });
}
