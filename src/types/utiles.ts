// type utils

// make all properties required in the object
export type RecursiveRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? RecursiveRequired<Required<T[P]>> : T[P];
}>;

// make at least one property required in the object
export type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// make at least one property required in the object recursively (nested objects)
export type RecursiveAtLeastOne<T> = AtLeastOne<{
  [K in keyof T]: T[K] extends object ? AtLeastOne<T[K]> : T[K];
}>;
