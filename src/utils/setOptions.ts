import type {
  BaseDraggableType,
  BaseDroppableType,
  BaseGlobalType,
  DraggableOptions,
  DroppableOptions,
  GlobalOptions,
} from "@/types/index.ts";
import { DEFAULT_GLOBAL_OPTIONS } from "@/consts/index.ts";

export function setDraggableOptions(
  globalDraggableOptions: BaseDraggableType,
  options?: DraggableOptions,
): BaseDraggableType {
  if (options === undefined) {
    return structuredClone(globalDraggableOptions);
  }
  return {
    identifier: {
      id: options?.identifier?.id ?? globalDraggableOptions?.identifier?.id,
      type: options?.identifier?.type ?? globalDraggableOptions?.identifier?.type,
    },
    modifiers: {
      disabled: options?.modifiers?.disabled ?? globalDraggableOptions?.modifiers?.disabled,
      dragEffect: options?.modifiers?.dragEffect ?? globalDraggableOptions?.modifiers?.dragEffect,
    },
    accessibility: {
      role: options?.accessibility?.role ?? globalDraggableOptions?.accessibility?.role,
      tabIndex: options?.accessibility?.tabIndex ?? globalDraggableOptions?.accessibility?.tabIndex,
      "aria-roledescription":
        options?.accessibility?.["aria-roledescription"] ??
        globalDraggableOptions?.accessibility?.["aria-roledescription"],
    },
    data: options?.data ?? globalDraggableOptions?.data,
  };
}

export function setDroppableOptions(
  globalDroppableOptions: BaseDroppableType,
  options?: DroppableOptions,
): BaseDroppableType {
  if (options === undefined) {
    return structuredClone(globalDroppableOptions);
  }
  return {
    identifier: {
      id: options?.identifier?.id ?? globalDroppableOptions?.identifier?.id,
      // @ts-expect-error error expected
      type: options?.identifier?.type ?? globalDroppableOptions?.identifier?.type,
    },
    modifiers: {
      disabled: options?.modifiers?.disabled ?? globalDroppableOptions?.modifiers?.disabled,
      highlight: {
        on: options?.modifiers?.highlight?.on ?? globalDroppableOptions?.modifiers?.highlight?.on,
        class:
          options?.modifiers?.highlight?.class ??
          globalDroppableOptions?.modifiers?.highlight?.class,
      },
      strictMatch:
        options?.modifiers?.strictMatch ?? globalDroppableOptions?.modifiers?.strictMatch,
    },
  };
}

export function setGlobalOptions(options: GlobalOptions): BaseGlobalType {
  return {
    draggableOptions: setDraggableOptions(
      DEFAULT_GLOBAL_OPTIONS.draggableOptions,
      options?.draggableOptions,
    ),
    droppableOptions: setDroppableOptions(
      DEFAULT_GLOBAL_OPTIONS.droppableOptions,
      options?.droppableOptions,
    ),
  };
}
