// Event types

import type { DraggableElement } from "./draggable.ts";
import type { DroppableElement } from "./droppable.ts";
import type { DndState } from "./state.ts";

export type EventAbortController = {
  dragEvents: Map<Element, AbortController>;
  dropEvents: Map<Element, AbortController>;
};

export type DragEventName = "drag" | "dragstart" | "dragend";
export type DropEventName = "dragenter" | "dragleave" | "dragover" | "drop";

export type DragEventCallback = (
  event: PointerEvent,
  state: DndState,
  element: DraggableElement,
) => void;
export type DragListeners = {
  drag: Map<Element, DragEventCallback[]>;
  dragstart: Map<Element, DragEventCallback[]>;
  dragend: Map<Element, DragEventCallback[]>;
};

export type DropEventCallback = (
  event: PointerEvent,
  state: DndState,
  element: DroppableElement,
) => void;
export type DropListeners = {
  dragenter: Map<Element, DropEventCallback[]>;
  dragleave: Map<Element, DropEventCallback[]>;
  dragover: Map<Element, DropEventCallback[]>;
  drop: Map<Element, DropEventCallback[]>;
};

export type OnDragEvent = (
  eventName: DragEventName,
  callback: DragEventCallback,
) => DraggableElement;

export type OnDraggablesEvent = (
  eventname: DragEventName,
  callback: DragEventCallback,
) => {
  on: OnDraggablesEvent;
};

export type OnDropEvent = (
  eventName: DropEventName,
  callback: DropEventCallback,
) => DroppableElement;

export type OnDroppablesEvent = (
  eventname: DropEventName,
  callback: DropEventCallback,
) => {
  on: OnDroppablesEvent;
};
