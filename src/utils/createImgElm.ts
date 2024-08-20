/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
type ImageOptions = {
  id?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  title?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  crossOrigin?: "anonymous" | "use-credentials" | "";
  referrerPolicy?: ReferrerPolicy;
  style?: Partial<CSSStyleDeclaration>;
  [key: string]: any;
};

const knownAttributes = new Set([
  "src",
  "id",
  "className",
  "width",
  "height",
  "alt",
  "title",
  "loading",
  "decoding",
  "crossOrigin",
  "referrerPolicy",
  "style",
]);

export function createImgElm(url: string, options: ImageOptions = {}): HTMLImageElement {
  const img = document.createElement("img");
  img.src = url;
  img.style.verticalAlign = "bottom";

  // Apply options
  Object.entries(options).forEach(([key, value]) => {
    if (key === "style" && value !== undefined) {
      Object.assign(img.style, value);
    } else if (key === "className") {
      img.className = value;
    } else if (key === "width" || key === "height") {
      img.setAttribute(key, value.toString());
    } else if (!knownAttributes.has(key)) {
      img.setAttribute(key, value);
    } else if (value !== undefined) {
      (img as any)[key] = value;
    }
  });

  return img;
}
