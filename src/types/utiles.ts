// type utils

import { type DraggableElement } from "./draggable";
import { type DroppableElement } from "./droppable";

// make all properties required in the object
export type RecursiveRequired<T> = Required<{
  [P in keyof T]: T[P] extends object | undefined ? RecursiveRequired<Required<T[P]>> : T[P];
}>;

// // make at least one property required in the object
// type AtLeastOne<T> = {
//   [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
// }[keyof T];

// // make at least one property required in the object recursively (nested objects)
// export type RecursiveAtLeastOne<T> = AtLeastOne<{
//   [K in keyof T]: T[K] extends object ? RecursiveAtLeastOne<T[K]> : T[K];
// }>;

type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

// RecursiveAtLeastOne should distribute over unions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Distribute<T> = T extends any ? AtLeastOne<T> : never;

export type RecursiveAtLeastOne<T> = T extends object
  ? Distribute<{
      [K in keyof T]: T[K] extends object ? RecursiveAtLeastOne<T[K]> : T[K];
    }>
  : T;

export type GetDragOverElement = {
  drag: DraggableElement;
  drop: DroppableElement;
};
