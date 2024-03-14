import type { BaseDraggableType, BaseDroppableType, BaseGlobalType } from "@/types";

export const DEFAULT_DRAGGABLE_OPTIONS: BaseDraggableType = {
  identifier: {
    id: "",
    type: "draggableItem",
  },
  modifiers: {
    disabled: false,
    dragEffect: "copy",
  },
  accessibility: {
    role: "draggable",
    tabIndex: 0,
    "aria-roledescription": "A Draggable Item",
  },
  data: null,
} as const;

export const DEFAULT_DROPPABLE_OPTIONS: BaseDroppableType = {
  identifier: {
    id: "",
    type: {
      accept: ["draggableItem"],
    },
  },
  modifiers: {
    disabled: false,
    highlight: {
      on: "dragover",
      class: "redrop-active-dropzone-highlight",
    },
    strictMatch: true,
  },
} as const;

export const DEFAULT_GLOBAL_OPTIONS: BaseGlobalType = {
  draggableOptions: DEFAULT_DRAGGABLE_OPTIONS,
  droppableOptions: DEFAULT_DROPPABLE_OPTIONS,
};
