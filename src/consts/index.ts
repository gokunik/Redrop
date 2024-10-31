import type {
  BaseDraggableType,
  BaseDroppableType,
  BaseGlobalType,
  TransferOptions,
} from "@/types/index.ts";

export const DEFAULT_DRAGGABLE_OPTIONS: BaseDraggableType = {
  identifier: {
    id: "",
    type: "draggableItem",
  },
  modifiers: {
    disabled: false,
    cursor: {
      offset: {
        x: 0,
        y: 0,
        preset: "auto",
      },
      dragEffect: "grabbing",
    },
    autoRemove: true,
    dragPreview: {
      customPreview: null,
      ghost: true,
      class: "redrop-drag-preview",
      scale: 0.95,
    },
    tolerance: {
      disabled: false,
      time: 100,
      distance: 8,
      strictMatch: true,
    },
    dragHandleClass: "redrop-drag-handle",
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
    sorting: {
      isEnabled: true,
      action: "swap",
      highlightClass: "redrop-active-dropzone",
    },
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

export const TRANSFER_OPTIONS: TransferOptions = {
  action: "copy",
  position: "append",
  index: null,
  makeDraggable: false,
  reActivate: true,
  reuseOptions: false,
  reuseListeners: false,
  options: DEFAULT_DRAGGABLE_OPTIONS,
} as const;
