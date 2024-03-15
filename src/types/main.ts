// types

import type { BaseDraggableType, DraggableOptions, DraggableElement } from "./draggable.ts";
import type { BaseDroppableType, DroppableOptions, DroppableElement } from "./droppable.ts";
import type { RecursiveAtLeastOne } from "./utiles.ts";

// note: Please do not add any optional property to the BaseGlobalType
export type BaseGlobalType = {
  draggableOptions: BaseDraggableType;
  droppableOptions: BaseDroppableType;
};
export type GlobalOptions = RecursiveAtLeastOne<{
  draggableOptions: DraggableOptions;
  droppableOptions: DroppableOptions;
}>;

export type ExtendedElement = DraggableElement | DroppableElement;
