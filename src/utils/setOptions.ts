/* eslint-disable no-param-reassign */
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
    const { customPreview } = globalDraggableOptions.modifiers.dragPreview;
    if (customPreview !== null) {
      globalDraggableOptions.modifiers.dragPreview.customPreview = null;
    }
    const finalOptions = structuredClone(globalDraggableOptions);
    finalOptions.modifiers.dragPreview.customPreview = customPreview;
    globalDraggableOptions.modifiers.dragPreview.customPreview = customPreview;
    return finalOptions;
  }
  return {
    identifier: {
      id: options?.identifier?.id ?? globalDraggableOptions?.identifier?.id,
      type: options?.identifier?.type ?? globalDraggableOptions?.identifier?.type,
    },
    modifiers: {
      disabled: options?.modifiers?.disabled ?? globalDraggableOptions?.modifiers?.disabled,
      cursor: {
        offset: {
          x:
            options?.modifiers?.cursor?.offset?.x ??
            globalDraggableOptions?.modifiers?.cursor?.offset?.x,
          y:
            options?.modifiers?.cursor?.offset?.y ??
            globalDraggableOptions?.modifiers?.cursor?.offset?.y,
          preset:
            options?.modifiers?.cursor?.offset?.preset ??
            globalDraggableOptions?.modifiers?.cursor?.offset?.preset,
        },
        dragEffect:
          options?.modifiers?.cursor?.dragEffect ??
          globalDraggableOptions?.modifiers?.cursor?.dragEffect,
      },
      autoRemove: options?.modifiers?.autoRemove ?? globalDraggableOptions?.modifiers?.autoRemove,
      dragPreview: {
        customPreview:
          options?.modifiers?.dragPreview?.customPreview ??
          globalDraggableOptions?.modifiers?.dragPreview?.customPreview,
        ghost:
          options?.modifiers?.dragPreview?.ghost ??
          globalDraggableOptions?.modifiers?.dragPreview?.ghost,
        class:
          options?.modifiers?.dragPreview?.class ??
          globalDraggableOptions?.modifiers?.dragPreview?.class,
        scale:
          options?.modifiers?.dragPreview?.scale ??
          globalDraggableOptions?.modifiers?.dragPreview?.scale,
      },
      tolerance: {
        disabled:
          options?.modifiers?.tolerance?.disabled ??
          globalDraggableOptions?.modifiers?.tolerance?.disabled,
        time:
          options?.modifiers?.tolerance?.time ?? globalDraggableOptions?.modifiers?.tolerance?.time,
        distance:
          options?.modifiers?.tolerance?.distance ??
          globalDraggableOptions?.modifiers?.tolerance?.distance,
        strictMatch:
          options?.modifiers?.tolerance?.strictMatch ??
          globalDraggableOptions?.modifiers?.tolerance?.strictMatch,
      },

      dragHandleClass:
        options?.modifiers?.dragHandleClass ?? globalDraggableOptions?.modifiers?.dragHandleClass,
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
      sorting: {
        isEnabled:
          options?.modifiers?.sorting?.isEnabled ??
          globalDroppableOptions?.modifiers?.sorting?.isEnabled,
        action:
          options?.modifiers?.sorting?.action ?? globalDroppableOptions?.modifiers?.sorting?.action,
        elmClass:
          options?.modifiers?.sorting?.elmClass ??
          globalDroppableOptions?.modifiers?.sorting?.elmClass,
        highlightClass:
          options?.modifiers?.sorting?.highlightClass ??
          globalDroppableOptions?.modifiers?.sorting?.highlightClass,
      },
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
