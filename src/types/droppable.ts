// Droppable types

import type { OnDroppablesEvent, OnDropEvent } from "./event";
import type { RecursiveAtLeastOne } from "./utiles";
import type { Redrop } from "@/app";

// note: Please do not add any optional property to the BaseDroppableType
export type BaseDroppableType = {
  identifier: {
    id: string;
    type:
      | {
          accept: string[];
        }
      | {
          reject: string[];
        };
  };
  modifiers: {
    disabled: boolean;
    highlight: {
      on: "dragmove" | "dragover" | "none";
      class: string;
    };
    strictMatch: boolean;
  };
};
export type DroppableOptions = RecursiveAtLeastOne<BaseDroppableType>;

export type Droppables = Map<Redrop, Map<Element, BaseDroppableType>>;
// drag and drop State

export type DroppableElement = HTMLElement & {
  _Redrop: {
    droppableOptions: BaseDroppableType;
  };
  on: OnDropEvent;
};

export type DroppableElements = (DroppableElement[] | []) & { on: OnDroppablesEvent };

export type DroppableInfo = {
  droppableOptions: BaseDroppableType;
  element: DroppableElement;
};
