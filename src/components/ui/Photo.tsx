import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper: real photos get optimised (resized, webp/avif, lazy);
 * the generated SVG placeholders are served as-is.
 */
export function Photo(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} unoptimized={props.unoptimized ?? src.endsWith(".svg")} alt={props.alt} />;
}
