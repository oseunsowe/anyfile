/**
 * Emits a JSON-LD block. Values come from the typed builders in `@/lib/seo`,
 * never from user input, so serialising them is safe — we still escape `<` to
 * keep a stray sequence from closing the script element early.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Serialised from typed, app-owned builders — never from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
