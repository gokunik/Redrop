import type { DraggableElement, BaseDraggableType } from "./draggable";
import type { DroppableElement, BaseDroppableType } from "./droppable";

type Coords = { x: number; y: number };
type EventInfo = {
  rect: DOMRect;
  target: HTMLElement;
  position: {
    page: Coords;
    client: Coords;
    offset: Coords;
    screen: Coords;
  };
};
export type DndState = {
  active: {
    element: DraggableElement;
    options: BaseDraggableType;
    isDisabled: boolean;
    info: EventInfo;
  } | null;
  over: {
    element: DroppableElement;
    options: BaseDroppableType;
    isDisabled: boolean;
    info: EventInfo;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type SetState<T extends DraggableElement | DroppableElement> = T extends DraggableElement
  ? DndState["active"]
  : DndState["over"];
