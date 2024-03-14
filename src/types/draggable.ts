import type { OnDragEvent, OnDraggablesEvent } from "./event";
import type { RecursiveAtLeastOne } from "./utiles";
import type { Redrop } from "@/app";

// note: Please do not add any optional property to the BaseDraggableType
export type BaseDraggableType = {
  identifier: {
    id: string;
    type: string;
  };
  modifiers: {
    disabled: boolean;
    dragEffect: "copy" | "move" | "none";
  };
  accessibility: {
    role: string;
    tabIndex: number;
    "aria-roledescription": string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type DraggableOptions = RecursiveAtLeastOne<BaseDraggableType>;

export type Draggables = Map<Redrop, Map<Element, BaseDraggableType>>;

export type DraggableElement = HTMLElement & {
  _Redrop: {
    draggableOptions: BaseDraggableType;
  };
  on: OnDragEvent;
};

export type DraggableElements = (DraggableElement[] | []) & { on: OnDraggablesEvent };

export type DraggableInfo = {
  draggableOptions: BaseDraggableType;
  element: DraggableElement;
};
