/* eslint-disable no-param-reassign */
import {
  DEFAULT_DRAGGABLE_OPTIONS,
  DEFAULT_GLOBAL_OPTIONS,
  TRANSFER_OPTIONS,
} from "@/consts/index.ts";
import { setDraggableOptions, setDroppableOptions, setGlobalOptions } from "@/utils/setOptions.ts";
import type {
  DndState,
  SetState,
  Draggables,
  Droppables,
  DraggableInfo,
  DroppableInfo,
  DragListeners,
  DropListeners,
  DragEventName,
  DropEventName,
  GlobalOptions,
  BaseGlobalType,
  DraggableOptions,
  DroppableOptions,
  DraggableElement,
  DroppableElement,
  BaseDraggableType,
  BaseDroppableType,
  DragEventCallback,
  DropEventCallback,
  OnDraggablesEvent,
  OnDroppablesEvent,
  DroppableElements,
  DraggableElements,
  EventAbortController,
  TransferOptions,
} from "@/types/index.ts";

export class Redrop {
  readonly #globalOptions: BaseGlobalType;
  #draggedElement: DraggableElement | null;
  #draggedPreview: {
    element: HTMLElement | null;
    class: string;
    scale: number;
  };
  #initialPosition: { x: number; y: number };
  #simulatedDragEnter: boolean = false;
  #lastDropElement: DroppableElement | null = null;
  #DndState: DndState;
  readonly #targetDropzones: DroppableElement[];
  static #isFirstInstanceCreated: boolean;

  readonly #internalState = {
    activeCords: { x: 0, y: 0 },
    initialCords: { x: 0, y: 0 },
  };

  readonly #elementIds: Record<string, HTMLElement> = {};

  #dragTolerance: {
    disabled: boolean;
    startTime: number | null;
    startPosition: {
      x: number;
      y: number;
    };
    isToleranceReached: boolean;
    toleranceCheckElement: DraggableElement | null;
  };

  constructor(initialGlobalOptions: GlobalOptions = DEFAULT_GLOBAL_OPTIONS) {
    if (initialGlobalOptions === DEFAULT_GLOBAL_OPTIONS) {
      this.#globalOptions = initialGlobalOptions as BaseGlobalType;
    } else {
      this.#globalOptions = setGlobalOptions(initialGlobalOptions);
    }
    this.#draggedElement = null;
    this.#draggedPreview = {
      element: null,
      class: "redrop-drag-preview",
      scale: 1,
    };
    this.#initialPosition = { x: 0, y: 0 };
    this.#DndState = {
      active: null,
      over: null,
      data: null,
    };

    this.#targetDropzones = [];

    if (!Redrop.#isFirstInstanceCreated) {
      Redrop.#isFirstInstanceCreated = true;
      document.addEventListener("DOMContentLoaded", this.#initMutationObserver.bind(this));
    }

    this.#dragTolerance = {
      disabled: false,
      startTime: 0,
      startPosition: {
        x: 0,
        y: 0,
      },
      isToleranceReached: false,
      toleranceCheckElement: null,
    };

    window.addEventListener("pointermove", this.#onPointerMove.bind(this));
    window.addEventListener("pointerup", this.#onPointerUp.bind(this));
    window.addEventListener("pointercancel", (event) => {
      this.#onPointerUp(event);
    });
    window.addEventListener("contextmenu", (event) => {
      if (this.#draggedElement !== null) {
        event.preventDefault();
      } else {
        this.#onPointerUp(new PointerEvent("pointerup", event));
      }
    });
  }

  // abort controllers for events
  readonly #EventAbortController: EventAbortController = {
    dragEvents: new Map(),
    dropEvents: new Map(),
  };

  // draggables and droppables
  static readonly #draggables: Draggables = new Map();
  static readonly #droppables: Droppables = new Map();

  static #setDraggables(instance: Redrop, element: DraggableElement, options: BaseDraggableType) {
    if (Redrop.#draggables.has(instance)) {
      Redrop.#draggables.get(instance)?.set(element, options);
    } else {
      Redrop.#draggables.set(instance, new Map([[element, options]]));
    }
  }

  static #setDroppables(instance: Redrop, element: DroppableElement, options: BaseDroppableType) {
    if (Redrop.#droppables.has(instance)) {
      Redrop.#droppables.get(instance)?.set(element, options);
    } else {
      Redrop.#droppables.set(instance, new Map([[element, options]]));
    }
  }

  static getDraggables(): Draggables;
  static getDraggables(instance: Redrop): DraggableInfo[];
  static getDraggables(instance: Redrop, element: Element | DraggableElement | null): DraggableInfo;
  static getDraggables(instance?: Redrop, element?: Element | DraggableElement | null) {
    if (instance === undefined) {
      return Redrop.#draggables;
    }
    if (element === null || element === undefined) {
      const draggables: DraggableInfo[] = [];
      Redrop.#draggables.get(instance)?.forEach((_, key) => {
        const draggable = {
          draggableOptions: Redrop.#draggables.get(instance)?.get(key),
          element: key,
        };
        draggables.push(draggable as DraggableInfo);
      });
      return draggables;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!Redrop.#draggables.get(instance)?.has(element)) return undefined;

    return {
      draggableOptions: Redrop.#draggables.get(instance)?.get(element),
      element,
    };
  }

  static getDroppables(): Droppables;
  static getDroppables(instance: Redrop): DroppableInfo[];
  static getDroppables(instance: Redrop, element: Element | DroppableElement | null): DroppableInfo;
  static getDroppables(instance?: Redrop, element?: Element | DroppableElement | null) {
    if (instance === undefined) {
      return Redrop.#droppables;
    }
    if (element === null || element === undefined) {
      const droppables: DroppableInfo[] = [];
      Redrop.#droppables.get(instance)?.forEach((_, key) => {
        const droppable = {
          droppableOptions: Redrop.#droppables.get(instance)?.get(key),
          element: key,
        };
        droppables.push(droppable as DroppableInfo);
      });
      return droppables;
    }

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!Redrop.#droppables.get(instance)?.has(element)) return undefined;

    return {
      droppableOptions: Redrop.#droppables.get(instance)?.get(element),
      element,
    };
  }

  // for adding and firing events
  readonly #dragListeners: DragListeners = {
    drag: new Map(),
    dragstart: new Map(),
    dragend: new Map(),
  };

  readonly #dropListeners: DropListeners = {
    dragenter: new Map(),
    dragleave: new Map(),
    dragover: new Map(),
    drop: new Map(),
  };

  #onDragEvent(
    element: DraggableElement,
    eventName: DragEventName,
    callback: DragEventCallback,
  ): DraggableElement {
    const eventAllowed: DragEventName[] = ["drag", "dragstart", "dragend"];
    if (!eventAllowed.includes(eventName)) {
      throw new Error(`Event ${eventName} not allowed on draggable element`);
    }
    if (this.#dragListeners[eventName].has(element)) {
      this.#dragListeners[eventName].get(element)?.push(callback);
    } else {
      this.#dragListeners[eventName].set(element, [callback]);
    }
    return element;
  }

  // add single drag event to multiple draggables
  #onDraggablesEvent(
    elements: DraggableElement[],
    eventName: DragEventName,
    callback: DragEventCallback,
  ): {
    on: OnDraggablesEvent;
  } {
    elements.forEach((element) => {
      this.#onDragEvent(element, eventName, callback);
    });

    return { on: this.#onDraggablesEvent.bind(this, elements) };
  }

  #onDropEvent(
    element: DroppableElement,
    eventName: DropEventName,
    callback: DropEventCallback,
  ): DroppableElement {
    const eventAllowed: DropEventName[] = ["dragenter", "dragleave", "dragover", "drop"];
    if (!eventAllowed.includes(eventName)) {
      throw new Error(`Event ${eventName} not allowed on droppable element`);
    }
    if (this.#dropListeners[eventName].has(element)) {
      this.#dropListeners[eventName].get(element)?.push(callback);
    } else {
      this.#dropListeners[eventName].set(element, [callback]);
    }
    return element;
  }

  // add single drop event to multiple draggables
  #onDroppablesEvent(
    elements: DroppableElement[],
    eventName: DropEventName,
    callback: DropEventCallback,
  ): {
    on: OnDroppablesEvent;
  } {
    elements.forEach((element) => {
      this.#onDropEvent(element, eventName, callback);
    });

    return { on: this.#onDroppablesEvent.bind(this, elements) };
  }

  #fireDragEvent(element: DraggableElement, eventName: DragEventName, eventData: PointerEvent) {
    if (this.#dragListeners[eventName].has(element)) {
      this.#dragListeners[eventName].get(element)?.forEach((callback) => {
        callback(eventData, this.#DndState, element);
      });
    }
  }

  #fireDropEvent(element: DroppableElement, eventName: DropEventName, eventData: PointerEvent) {
    if (this.#dropListeners[eventName].has(element)) {
      this.#dropListeners[eventName].get(element)?.forEach((callback) => {
        callback(eventData, this.#DndState, element);
      });
    }
  }

  #reuseListeners(
    transferElement: DraggableElement,
    listeners: {
      [key in DragEventName | DropEventName]: DragEventCallback[] | DropEventCallback[] | undefined;
    },
  ) {
    Object.keys(this.#dragListeners).forEach((dragEventName) => {
      const eventName = dragEventName as DragEventName;
      if (listeners[eventName] !== undefined) {
        if (this.#dragListeners[eventName].has(transferElement)) {
          this.#dragListeners[eventName]
            .get(transferElement)
            ?.push(...(listeners[eventName] as DragEventCallback[]));
        } else {
          this.#dragListeners[eventName].set(
            transferElement,
            listeners[eventName] as DragEventCallback[],
          );
        }
      }
    });

    Object.keys(this.#dropListeners).forEach((dropEventName) => {
      const eventName = dropEventName as DropEventName;
      if (listeners[eventName] !== undefined) {
        if (this.#dropListeners[eventName].has(transferElement)) {
          this.#dropListeners[eventName]
            .get(transferElement)
            ?.push(...(listeners[eventName] as DropEventCallback[]));
        } else {
          this.#dropListeners[eventName].set(
            transferElement,
            listeners[eventName] as DropEventCallback[],
          );
        }
      }
    });
  }

  transferElm(
    element: DraggableElement,
    targetContainer: DroppableElement,
    configOptions: Partial<TransferOptions> = TRANSFER_OPTIONS,
  ) {
    const options = { ...TRANSFER_OPTIONS, ...configOptions };
    let transferElm = element;
    const listeners: {
      [key in DragEventName | DropEventName]: DragEventCallback[] | DropEventCallback[] | undefined;
    } = {
      dragenter: undefined,
      dragleave: undefined,
      dragover: undefined,
      drop: undefined,
      drag: undefined,
      dragstart: undefined,
      dragend: undefined,
    };
    let dragOptions: DraggableOptions = DEFAULT_DRAGGABLE_OPTIONS;

    if (options.makeDraggable) {
      if (options.reuseOptions) {
        dragOptions = Redrop.getDraggables(this, element)?.draggableOptions;
      }

      if (options.reuseListeners) {
        Object.keys(this.#dragListeners).forEach((dragEventName) => {
          const eventName = dragEventName as DragEventName;
          if (this.#dragListeners[eventName].has(element)) {
            listeners[eventName] = this.#dragListeners[eventName].get(element);
          }
        });

        Object.keys(this.#dropListeners).forEach((dropEventName) => {
          const eventName = dropEventName as DropEventName;
          if (this.#dropListeners[eventName].has(element)) {
            listeners[eventName] = this.#dropListeners[eventName].get(element);
          }
        });
      }
    }

    if (options.action === "copy") {
      transferElm = element.cloneNode(true) as DraggableElement;
      this.#makeUnDraggable(transferElm, true);

      if (options.makeDraggable) {
        // @ts-expect-error id is never undefined in this case
        dragOptions.identifier.id = "";
        transferElm = this.makeDraggable(
          transferElm,
          options.reuseOptions ? dragOptions : options.options,
        );
      }
    }

    if (options.makeDraggable) {
      if (options.reActivate && options.action === "move") {
        this.#makeUnDraggable(element);
        transferElm = this.makeDraggable(
          transferElm,
          options.reuseOptions ? dragOptions : options.options,
        );
      }

      if (options.reuseListeners) {
        this.#reuseListeners(transferElm, listeners);
      }
    } else if (!options.makeDraggable && options.action === "move") {
      setTimeout(() => {
        this.#makeUnDraggable(element);
      }, 0);
    }

    if (options.position === "prepend") {
      targetContainer.prepend(transferElm);
    } else if (options.position === "append") {
      targetContainer.append(transferElm);
    } else if (options.position === "index") {
      if (options.index === null) {
        throw new Error("Index not provided for transfering element");
      } else if (options.index > targetContainer.children.length) {
        throw new Error("Index out of bounds for transfering element");
      }
      targetContainer.insertBefore(transferElm, targetContainer.children[options.index]);
    }
  }

  // for making elements draggable and droppable
  makeDraggable(element: Element | string | null, options?: DraggableOptions) {
    if (typeof element === "string") {
      const elementSelector = document.querySelector(element);
      element = elementSelector as DraggableElement;
    }

    if (element === null) {
      throw new Error("Draggable element cannot be null");
    }
    if (Redrop.getDraggables(this, element) !== undefined) return element as DraggableElement;

    if (!(element instanceof HTMLElement)) {
      console.error("Draggable element not valid: ", element);
      throw new Error("Draggable element must be an instance of HTMLElement");
    }

    const draggableOptions = setDraggableOptions(this.#globalOptions.draggableOptions, options);

    if (draggableOptions.identifier.id === "") {
      const randomId = `${Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
      draggableOptions.identifier.id = randomId;
    }

    if (this.#elementIds[draggableOptions.identifier.id] !== undefined) {
      throw new Error(`Duplicate draggable id: ${draggableOptions.identifier.id}`);
    } else {
      this.#elementIds[draggableOptions.identifier.id] = element;
    }

    const dragElement = element as DraggableElement;

    const redropProps = {
      draggableOptions,
    };

    Object.defineProperties(dragElement, {
      _Redrop: {
        value: redropProps,
        configurable: true,
      },
      on: {
        value: this.#onDragEvent.bind(this, dragElement),
        configurable: true,
      },
    });

    Redrop.#setDraggables(this, dragElement, draggableOptions);

    // if any new attributes are added please also make sure to remove them in the unmakeDraggable function
    const attributes = {
      draggable: draggableOptions.modifiers.disabled ? "false" : "true",
      role: draggableOptions.accessibility.role,
      tabIndex: String(draggableOptions.accessibility.tabIndex),
      "data-redrop-drag-id": draggableOptions.identifier.id,
      "data-redrop-drag-type": draggableOptions.identifier.type,
      "aria-grabbed": "false",
      "aria-roledescription": draggableOptions.accessibility["aria-roledescription"],
    };
    element.classList.add(
      "redrop-draggable-item",
      `redrop-draggable-type-${draggableOptions.identifier.type}`,
    );

    Redrop.#setAttributes(dragElement, attributes);

    const dragHandleElement = dragElement.querySelector(
      `.${draggableOptions.modifiers.dragHandleClass}`,
    ) as unknown as HTMLElement | null;

    if (dragHandleElement !== null) {
      dragHandleElement.style.touchAction = "none";
    } else {
      dragElement.style.touchAction = "none";
    }

    if (!draggableOptions.modifiers.disabled) {
      this.#onPointerDown(dragElement);
    }
    return dragElement;
  }

  makeDroppable(element: Element | string | null, options?: DroppableOptions) {
    if (typeof element === "string") {
      const elementSelector = document.querySelector(element);

      element = elementSelector as DraggableElement;
    }

    if (element === null) {
      throw new Error("Droppable element cannot be null");
    }

    if (!(element instanceof HTMLElement)) {
      console.error("Droppable element not valid: ", element);
      throw new Error("Droppable element must be an instance of HTMLElement");
    }

    if (Redrop.getDroppables(this, element) !== undefined) return element as DroppableElement;

    const droppableOptions = setDroppableOptions(this.#globalOptions.droppableOptions, options);
    droppableOptions.modifiers.disabled = false;

    if (droppableOptions.identifier.id === "") {
      const randomId = `${Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
      droppableOptions.identifier.id = randomId;
    }

    if (this.#elementIds[droppableOptions.identifier.id] !== undefined) {
      throw new Error(`Duplicate draggable id: ${droppableOptions.identifier.id}`);
    } else {
      this.#elementIds[droppableOptions.identifier.id] = element;
    }

    const dropElement = element as DroppableElement;
    const redropProps = {
      droppableOptions,
    };

    Object.defineProperties(dropElement, {
      _Redrop: {
        value: redropProps,
        configurable: true,
      },
      on: {
        value: this.#onDropEvent.bind(this, dropElement),
        configurable: true,
      },
    });

    // dropElement._Redrop = redropProps;
    // dropElement.on = this.#onDropEvent.bind(this, dropElement);

    Redrop.#setDroppables(this, dropElement, droppableOptions);

    let droppableType: string;

    if ("accept" in droppableOptions.identifier.type) {
      droppableType = `accept:${droppableOptions.identifier.type.accept.join("-")}`;
    } else {
      droppableType = `reject:${droppableOptions.identifier.type.reject.join("-")}`;
    }

    // if any new attributes are added please also make sure to remove them in the unmakeDroppable function
    const attributes = {
      "data-redrop-droppable": "true",
      "data-redrop-drop-id": droppableOptions.identifier.id,
      "data-redrop-drop-type": droppableType,
    };
    dropElement.classList.add("redrop-droppable-item");

    Redrop.#setAttributes(dropElement, attributes);

    this.#initDropEvents(dropElement);

    return dropElement;
  }

  makeDraggables(
    elements: NodeListOf<Element> | HTMLCollectionOf<Element> | string[] | string,
    options?: DraggableOptions,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let elementsArray: DraggableElement[] = [];

    if (elements instanceof NodeList || elements instanceof HTMLCollection) {
      elementsArray = this.#getDraggableDroppableElements(
        "drag",
        elements,
        options,
      ) as DraggableElement[];
    } else if (Array.isArray(elements) && typeof elements[0] === "string") {
      elements.forEach((element) => {
        const dragElement = document.querySelector(element);
        if (dragElement !== null) {
          elementsArray.push(dragElement as DraggableElement);
        }
      });

      if (elementsArray.length === 0) {
        throw new Error("Invalid selector passed to makeDraggables. Selector not found");
      }
      elementsArray = this.#getDraggableDroppableElements(
        "drag",
        elementsArray,
        options,
      ) as DraggableElement[];
    } else if (typeof elements === "string") {
      if (elements === "") {
        throw new Error("Invalid selector passed to makeDraggables. Selector cannot be empty");
      }

      const dragElement = document.querySelectorAll(elements);
      elementsArray = this.#getDraggableDroppableElements(
        "drag",
        dragElement,
        options,
      ) as DraggableElement[];
    }
    Object.defineProperty(elementsArray, "on", {
      value: this.#onDraggablesEvent.bind(this, elementsArray),
    });

    const draggables = elementsArray as DraggableElements;

    return draggables;
  }

  makeDroppables(
    elements: NodeListOf<Element> | HTMLCollectionOf<Element> | string[] | string,
    options?: DroppableOptions,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let elementsArray: DroppableElement[] = [];

    if (elements instanceof NodeList || elements instanceof HTMLCollection) {
      elementsArray = this.#getDraggableDroppableElements(
        "drop",
        elements,
        options,
      ) as DroppableElement[];
    } else if (Array.isArray(elements) && typeof elements[0] === "string") {
      elements.forEach((element) => {
        if (typeof element !== "string") {
          throw new Error("Invalid selector passed to makeDroppables");
        }
        const dropElement = document.querySelector(element);
        if (dropElement !== null) {
          elementsArray.push(dropElement as DroppableElement);
        }
      });
      elementsArray = this.#getDraggableDroppableElements(
        "drop",
        elementsArray,
        options,
      ) as DroppableElement[];
    } else if (typeof elements === "string") {
      if (elements === "") {
        throw new Error("Invalid selector passed to makeDraggables. Selector cannot be empty");
      }

      const dropElement = document.querySelectorAll(elements);
      elementsArray = this.#getDraggableDroppableElements(
        "drop",
        dropElement,
        options,
      ) as DroppableElement[];
    }
    Object.defineProperty(elementsArray, "on", {
      value: this.#onDroppablesEvent.bind(this, elementsArray),
    });

    const draggables = elementsArray as DroppableElements;

    return draggables;
  }

  static #setDndId(
    type: "drag" | "drop",
    element: Element,
    options: DraggableOptions | DroppableOptions | undefined,
  ) {
    const dndOptions = options;
    const randomId = `${Date.now().toString(36) + Math.random().toString(36).slice(2)}`;
    if (dndOptions?.identifier?.id === "id-attribute") {
      dndOptions.identifier.id = element?.id ?? randomId;
    } else if (dndOptions?.identifier?.id === "data-attribute") {
      dndOptions.identifier.id = element?.getAttribute(`data-${type}-id`) ?? randomId;
    }
    return dndOptions;
  }

  #getDraggableDroppableElements(
    type: "drag" | "drop",
    elements: NodeListOf<Element> | HTMLCollectionOf<Element> | Element[],
    options?: DraggableOptions | DroppableOptions,
  ) {
    const elementsArray: HTMLElement[] = [];
    let dndOptions = options;
    Array.from(elements).forEach((element) => {
      dndOptions = Redrop.#setDndId(type, element, options);
      if (type === "drag") {
        const dragElement = this.makeDraggable(element, dndOptions as DraggableOptions);
        elementsArray.push(dragElement);
      } else {
        const dropElement = this.makeDroppable(element, dndOptions as DroppableOptions);
        elementsArray.push(dropElement);
      }
    });
    return elementsArray;
  }

  #makeUnDraggable(element: DraggableElement, onlyRemoveProps: boolean = false) {
    if (element === null) {
      throw new Error("Can not make non-draggable element null");
    }

    const draggableElm = Redrop.getDraggables(this, element);

    if (draggableElm === undefined && !onlyRemoveProps) {
      throw new Error("Can not make non-draggable element that is not draggable");
    }

    const draggableOptions = draggableElm?.draggableOptions ?? undefined;
    const elementId = draggableOptions?.identifier.id;
    if (this.#elementIds[elementId] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.#elementIds[elementId];
    }

    Redrop.#draggables.get(this)?.delete(element);
    this.#EventAbortController.dragEvents.get(element)?.abort();
    this.#EventAbortController.dragEvents.delete(element);
    this.#dragListeners.dragstart.delete(element);
    this.#dragListeners.dragend.delete(element);
    this.#dragListeners.drag.delete(element);

    // @ts-expect-error error expected
    delete element?.on;

    // @ts-expect-error error expected
    delete element?._Redrop;

    element.classList.remove(
      "redrop-draggable-item",
      `redrop-draggable-type-${draggableOptions?.identifier?.type ?? element.getAttribute("data-redrop-drag-type")}`,
    );

    element.style.touchAction = "auto";

    Redrop.#removeAttributes(element, [
      "draggable",
      "role",
      "tabIndex",
      "data-redrop-drag-id",
      "data-redrop-drag-type",
      "aria-grabbed",
      "aria-roledescription",
    ]);
  }

  #makeUnDroppable(element: DroppableElement) {
    if (element === null) {
      throw new Error("Can not make non-droppable element null");
    }

    const droppableElm = Redrop.getDroppables(this, element);

    if (droppableElm === undefined) {
      throw new Error("Can not make non-droppable element that is not droppable");
    }

    const { droppableOptions } = droppableElm;
    const elementId = droppableOptions.identifier.id;
    if (this.#elementIds[elementId] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete this.#elementIds[elementId];
    }

    Redrop.#droppables.get(this)?.delete(element);
    this.#EventAbortController.dropEvents.get(element)?.abort();
    this.#EventAbortController.dropEvents.delete(element);
    this.#dropListeners.dragenter.delete(element);
    this.#dropListeners.dragleave.delete(element);
    this.#dropListeners.dragover.delete(element);
    this.#dropListeners.drop.delete(element);

    // @ts-expect-error error expected
    delete element?.on;

    // @ts-expect-error error expected
    delete element?._Redrop;

    element.classList.remove("redrop-droppable-item");

    Redrop.#removeAttributes(element, [
      "data-redrop-droppable",
      "data-redrop-drop-id",
      "data-redrop-drop-type",
    ]);
  }

  unregister(element: DraggableElement | DroppableElement, type: "draggable" | "droppable") {
    if (element === undefined || !["draggable", "droppable"].includes(type)) {
      throw new Error("Invalid element or type passed to unregister");
    }
    if (type === "draggable") {
      this.#makeUnDraggable(element as DraggableElement);
    } else if (type === "droppable") {
      this.#makeUnDroppable(element as DroppableElement);
    }

    return element;
  }

  // initiase mutation observer
  // eslint-disable-next-line class-methods-use-this
  #initMutationObserver() {
    const body = document.querySelector("body") as unknown as Node;
    const mutationObserver = new MutationObserver((entries) => {
      // console.log("mutationObserver: ", entries);

      entries.forEach((entry) => {
        if (entry.type === "childList") {
          if (entry.removedNodes.length > 0) {
            entry.removedNodes.forEach(() => {
              // console.log("element: ", element);
            });
          }
        }
      });
    });

    mutationObserver.observe(body, {
      childList: true,
      subtree: true,
    });
  }

  // drag pointer events
  #onPointerDown(dragElement: DraggableElement) {
    const dragEventAbortController = new AbortController();
    this.#EventAbortController.dragEvents.set(dragElement, dragEventAbortController);
    dragElement.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();
        // event.stopPropagation(); fix the event bubbling

        this.#internalState.activeCords = {
          x: event.clientX,
          y: event.clientY,
        };

        this.#internalState.initialCords = {
          x: event.clientX,
          y: event.clientY,
        };

        const {
          modifiers: {
            dragHandleClass,
            tolerance: { disabled: isDragToleranceDisabled, time },
          },
        } = Redrop.getDraggables(this, dragElement).draggableOptions;

        const dragHandleElement = dragElement.querySelector(`.${dragHandleClass}`);
        if (dragHandleElement !== null && !dragHandleElement.contains(event.target as Node)) return;

        this.#dragTolerance = {
          disabled: isDragToleranceDisabled,
          startTime: Date.now(),
          startPosition: {
            x: event.clientX,
            y: event.clientY,
          },
          isToleranceReached: false,
          toleranceCheckElement: dragElement,
        };

        if (isDragToleranceDisabled) {
          this.#dragStart(event, dragElement);
        } else {
          setTimeout(() => {
            this.#checkDragTolerance(event);
          }, time);
          this.#checkDragTolerance(event);
        }
      },
      {
        signal: dragEventAbortController.signal,
      },
    );
  }

  #onPointerMove(event: PointerEvent) {
    event.preventDefault();

    this.#internalState.activeCords = {
      x: event.clientX,
      y: event.clientY,
    };

    if (
      this.#dragTolerance.toleranceCheckElement !== null &&
      !this.#dragTolerance.isToleranceReached &&
      !this.#dragTolerance.disabled
    ) {
      this.#checkDragTolerance(event);
    }

    if (this.#draggedElement === null) return;
    this.#drag(event);

    // for mobile/touch devices we need to manually trigger pointer events
    // because in touch devices event only triggers when it took place
    // inside the element boundary so pointer enter, over, leave and drop
    // events are not registered as the dragged element is dragged from outside
    if (event.pointerType === "touch") {
      this.#onTouchMove(event);
    }
  }

  #onTouchMove(event: PointerEvent) {
    const element = Redrop.#getDragOverElement(event);

    if (element !== null) {
      this.#lastDropElement = element;
      if (!this.#simulatedDragEnter && !this.#lastDropElement?.contains(this.#draggedElement)) {
        this.#simulatedDragEnter = true;
        this.#lastDropElement.dispatchEvent(new PointerEvent("pointerenter", event));
      }

      const pointerMoveEvent = Redrop.#createNewPointerEventWithBubbleDisabled(
        event,
        "pointermove",
      );
      element.dispatchEvent(pointerMoveEvent);
    } else if (this.#simulatedDragEnter) {
      this.#simulatedDragEnter = false;
      this.#lastDropElement?.dispatchEvent(new PointerEvent("pointerleave", event));
    }
  }

  static #getDragOverElement(event: PointerEvent) {
    const elements = document.elementsFromPoint(event.clientX, event.clientY) as DroppableElements;
    return elements.find((elm) => elm.hasAttribute("data-redrop-droppable")) ?? null;
  }

  #onPointerUp(event: PointerEvent) {
    if (
      this.#dragTolerance.toleranceCheckElement !== null &&
      !this.#dragTolerance.isToleranceReached
    ) {
      this.#resetToleranceCheckState();
    }

    if (this.#draggedElement === null) return;
    // trigger drop event for touch devices
    if (event.pointerType === "touch") {
      if (
        this.#simulatedDragEnter &&
        this.#lastDropElement?.contains(this.#draggedElement) === false // prevent double drop
      ) {
        const pointerupEvent = Redrop.#createNewPointerEventWithBubbleDisabled(event, "pointerup");
        this.#lastDropElement?.dispatchEvent(pointerupEvent);
        this.#simulatedDragEnter = false;
      }
    }
    this.#dragEnd(event);
    this.#resetDndState();
  }

  // drop pointer events
  #initDropEvents(dropElement: DroppableElement) {
    const dropEventAbortController = new AbortController();
    this.#EventAbortController.dropEvents.set(dropElement, dropEventAbortController);

    dropElement.addEventListener(
      "pointerenter",
      (event) => {
        this.#dragEnter(event, dropElement);
      },
      {
        signal: dropEventAbortController.signal,
      },
    );

    dropElement.addEventListener(
      "pointerleave",
      (event) => {
        this.#dragLeave(event, dropElement);
      },
      {
        signal: dropEventAbortController.signal,
      },
    );

    dropElement.addEventListener(
      "pointermove",
      (event) => {
        if (this.#draggedElement === null) return;
        this.#lastDropElement = dropElement;
        this.#dragOver(event, dropElement);
      },
      {
        signal: dropEventAbortController.signal,
      },
    );

    dropElement.addEventListener(
      "pointerup",
      (event) => {
        if (dropElement !== this.#lastDropElement || this.#draggedElement === null) return;
        this.#drop(event, dropElement);
        if (event.pointerType === "mouse") {
          dropElement.dispatchEvent(new PointerEvent("pointerleave", event));
        }
      },
      {
        signal: dropEventAbortController.signal,
      },
    );
  }

  // events
  // ***  Drag Events  ***
  #drag(event: PointerEvent) {
    if (this.#draggedElement === null || this.#draggedPreview === null) return;

    this.#translateDragPreview();
    this.#fireDragEvent(this.#draggedElement, "drag", event);
  }

  #dragStart(event: PointerEvent, element: DraggableElement) {
    if (this.#draggedElement !== null) return;
    this.#draggedElement = element;
    const { draggableOptions } = Redrop.getDraggables(this, element);

    this.#resetToleranceCheckState();

    Redrop.#setAttributes(element, {
      "aria-grabbed": "true",
    });

    Redrop.#setAttributes(document.body, {
      "data-redrop-dragging": "true",
      class: `${document.body.classList.toString()} redrop-dragging`,
    });

    document.body.style.setProperty("--cursor-type", draggableOptions.modifiers.cursor.dragEffect);

    this.#lastDropElement = Redrop.#getDragOverElement(event);
    if (this.#lastDropElement !== null) {
      this.#lastDropElement.dispatchEvent(new PointerEvent("pointerenter", event));
    }
    this.#highlightDropzones("dragmove");

    this.#setActiveState(element, draggableOptions, false, event);

    const { customPreview: previewElement } = draggableOptions.modifiers.dragPreview;
    this.#draggedPreview.scale = draggableOptions.modifiers.dragPreview.scale;
    this.#draggedPreview.class = draggableOptions.modifiers.dragPreview.class;

    if (previewElement !== null) {
      this.#createCustomPreview(previewElement);
    } else {
      this.#createDefaultPreview(element);
    }

    this.#setCursorOffset(
      this.#draggedPreview.element ?? this.#draggedElement,
      event,
      draggableOptions.modifiers.cursor.offset,
    );
    this.#translateDragPreview();

    this.#fireDragEvent(element, "dragstart", event);
  }

  #dragEnd(event: PointerEvent) {
    if (this.#draggedElement === null) return;
    this.#removeDraggedPreview();
    this.#fireDragEvent(this.#draggedElement, "dragend", event);
    this.#draggedElement = null;
  }

  // ***  Drop Events  ***
  #isDropEventAllowed(isDropEvent: boolean, dropElement: DroppableElement) {
    const draggableType = Redrop.getDraggables(this, this.#draggedElement).draggableOptions
      .identifier.type;
    const droppable = Redrop.getDroppables(this, dropElement).droppableOptions.identifier.type;
    const isStrictMatch = Redrop.getDroppables(this, dropElement).droppableOptions.modifiers
      .strictMatch;

    if ("accept" in droppable) {
      const isAccepted = droppable.accept.includes(draggableType ?? "");
      if (isStrictMatch) {
        return !isAccepted;
      }
      return isDropEvent ? !isAccepted : false;
    }
    const isRejected = droppable.reject.includes(draggableType ?? "");
    if (isStrictMatch) {
      return isRejected;
    }
    return isDropEvent ? isRejected : false;
  }

  #dragEnter(event: PointerEvent, dropElement: DroppableElement) {
    if (this.#draggedElement === null) return;

    if (this.#isDropEventAllowed(false, dropElement)) return;
    this.#lastDropElement = dropElement;
    this.#highlightDropzones("dragover");
    this.#setOverState(
      dropElement,
      Redrop.getDroppables(this, dropElement).droppableOptions,
      false,
      event,
    );
    this.#fireDropEvent(dropElement, "dragenter", event);
  }

  #dragOver(event: PointerEvent, dropElement: DroppableElement) {
    if (this.#draggedElement === null) return;
    if (this.#isDropEventAllowed(false, dropElement)) return;
    this.#fireDropEvent(dropElement, "dragover", event);
  }

  #dragLeave(event: PointerEvent, dropElement: DroppableElement) {
    if (this.#draggedElement === null) return;
    if (this.#isDropEventAllowed(false, dropElement)) return;

    if (
      this.#lastDropElement === dropElement &&
      Redrop.getDroppables(this, dropElement).droppableOptions.modifiers.highlight.on === "dragover"
    ) {
      this.#targetDropzones.forEach((dropzone) => {
        const highlightClass = dropzone._Redrop.droppableOptions.modifiers.highlight.class;
        dropzone.classList.remove(highlightClass);
      });
    }
    this.#fireDropEvent(dropElement, "dragleave", event);
  }

  #drop(event: PointerEvent, dropElement: DroppableElement) {
    if (this.#draggedElement === null) return;

    const isDropAllowed = this.#isDropEventAllowed(true, dropElement);
    if (isDropAllowed) return;

    this.#fireDropEvent(dropElement, "drop", event);
  }

  // other utility methods

  #checkDragTolerance(event: PointerEvent) {
    if (this.#dragTolerance?.toleranceCheckElement === null) return;

    const {
      modifiers: { tolerance },
    } = Redrop.getDraggables(this, this.#dragTolerance.toleranceCheckElement).draggableOptions;

    const currentTime = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const timeDiff = currentTime - this.#dragTolerance.startTime!;

    const distanceDiff = Math.sqrt(
      (event.clientX - this.#dragTolerance.startPosition.x) ** 2 +
        (event.clientY - this.#dragTolerance.startPosition.y) ** 2,
    );

    const isToleranceReached = tolerance.strictMatch
      ? timeDiff >= tolerance.time && distanceDiff >= tolerance.distance
      : timeDiff >= tolerance.time || distanceDiff >= tolerance.distance;

    if (isToleranceReached) {
      this.#dragTolerance.isToleranceReached = true;
      if (this.#dragTolerance.toleranceCheckElement !== null) {
        this.#dragStart(event, this.#dragTolerance.toleranceCheckElement);
      }
    }
  }

  #resetToleranceCheckState() {
    this.#dragTolerance.startTime = null;
    this.#dragTolerance.startPosition = { x: 0, y: 0 };
    this.#dragTolerance.isToleranceReached = false;
    this.#dragTolerance.toleranceCheckElement = null;
  }

  #setCursorOffset(
    dragElement: HTMLElement,
    event: PointerEvent,
    offset: BaseDraggableType["modifiers"]["cursor"]["offset"],
  ) {
    const cursorOffset = offset;
    const rect = dragElement.getBoundingClientRect();
    const { scale } = this.#draggedPreview;

    const clickX = this.#internalState.initialCords.x - rect.left;
    const clickY = this.#internalState.initialCords.y - rect.top;

    const adjustRect: (value: number) => number = (value) => value + (value - value / scale);
    const adjustedRect = {
      left: rect.left / scale,
      right: adjustRect(rect.right),
      top: adjustRect(rect.top),
      bottom: adjustRect(rect.bottom),
      width: adjustRect(rect.width),
      height: adjustRect(rect.height),
    };

    const presetOffset = {
      "top-left": {
        x: adjustedRect.left - cursorOffset.x,
        y: adjustedRect.top - cursorOffset.y,
      },
      "top-right": {
        x: adjustedRect.right + cursorOffset.x,
        y: adjustedRect.top - cursorOffset.y,
      },
      "bottom-left": {
        x: adjustedRect.left - cursorOffset.x,
        y: adjustedRect.bottom + cursorOffset.y,
      },
      "bottom-right": {
        x: adjustedRect.right + cursorOffset.x,
        y: adjustedRect.bottom + cursorOffset.y,
      },
      center: {
        x: adjustedRect.left + adjustedRect.width / 2 + cursorOffset.x - 4,
        y: adjustedRect.top + adjustedRect.height / 2 + cursorOffset.y - 2,
      },
      auto: {
        x: adjustedRect.left + clickX + cursorOffset.x,
        y: adjustedRect.top + clickY + cursorOffset.y,
      },
    };

    this.#initialPosition = presetOffset[cursorOffset.preset];
  }

  static #setAttributes(element: Element, attributes: Record<string, string>) {
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  static #removeAttributes(element: Element, attributes: string[]) {
    attributes.forEach((key) => {
      element.removeAttribute(key);
    });
  }

  #highlightDropzones(on: "dragmove" | "dragover") {
    const element = this.#draggedElement;
    const { draggableOptions } = Redrop.getDraggables(this, element);
    const draggableType = draggableOptions.identifier.type;
    const dropzones = Redrop.getDroppables(this);
    dropzones.forEach((dropzone) => {
      const { droppableOptions } = dropzone;
      const dropzoneType = droppableOptions.identifier.type;
      const { highlight } = droppableOptions.modifiers;

      const isAcceptDropzone =
        "accept" in dropzoneType && dropzoneType.accept.includes(draggableType);
      const isRejectDropzone =
        "reject" in dropzoneType && !dropzoneType.reject.includes(draggableType);
      if (
        highlight.on === on &&
        !droppableOptions.modifiers.disabled &&
        (isAcceptDropzone || isRejectDropzone)
      ) {
        if (highlight.on === "dragover" && this.#lastDropElement !== null) {
          if (this.#lastDropElement === dropzone.element) {
            this.#lastDropElement?.classList.add(highlight.class);
            this.#targetDropzones.push(this.#lastDropElement);
          }
        } else {
          this.#targetDropzones.push(dropzone.element);
          dropzone.element.classList.add(highlight.class);
        }
      }
    });
  }

  #createDefaultPreview(element: DraggableElement) {
    this.#draggedPreview.element = element.cloneNode(true) as HTMLElement;

    const preview = this.#draggedPreview.element;
    preview.id = `redrop-drag-preview-${preview.id}`;
    preview.classList.add(
      "redrop-drag-preview",
      "redrop-default-drag-preview",
      this.#draggedPreview.class,
    );
    preview.style.width = `${element.getBoundingClientRect().width}px`;
    preview.style.height = `${element.getBoundingClientRect().height}px`;
    preview.style.left = `${element.getBoundingClientRect().left}px`;
    preview.style.top = `${element.getBoundingClientRect().top}px`;
    document.body.appendChild(preview);
  }

  #createCustomPreview(element: HTMLElement | ((element: DraggableElement) => HTMLElement)) {
    if (this.#draggedElement === null || element === null) return;
    if (typeof element === "function") {
      this.#draggedPreview.element = element(this.#draggedElement);
    } else {
      this.#draggedPreview.element = element.cloneNode(true) as HTMLElement;
    }

    const preview = this.#draggedPreview.element;
    preview.classList.add("redrop-drag-preview", this.#draggedPreview.class);
    preview.style.left = `${this.#draggedElement?.getBoundingClientRect().left}px`;
    preview.style.top = `${this.#draggedElement?.getBoundingClientRect().top}px`;
    document.body.appendChild(preview);
  }

  #translateDragPreview(x?: number, y?: number) {
    if (this.#draggedPreview.element === null) return;
    const cords = {
      x: x ?? this.#internalState.activeCords.x,
      y: y ?? this.#internalState.activeCords.y,
    };

    const initialX = this.#initialPosition.x / this.#draggedPreview.scale;
    const initialY = this.#initialPosition.y / this.#draggedPreview.scale;

    this.#draggedPreview.element.style.transform = `translate(
    ${cords.x - initialX}px, 
    ${cords.y - initialY}px) 
    scale(${this.#draggedPreview.scale})`;
  }

  #removeDraggedPreview() {
    if (this.#draggedPreview.element != null && this.#draggedElement != null) {
      document.body.classList.remove("redrop-dragging");
      this.#targetDropzones.forEach((dropzone) => {
        const highlightClass = dropzone._Redrop.droppableOptions.modifiers.highlight.class;
        dropzone.classList.remove(highlightClass);
      });
      Redrop.#setAttributes(document.body, {
        "data-redrop-dragging": "false",
      });
      document.body.removeChild(this.#draggedPreview.element);
      this.#draggedPreview = {
        element: null,
        scale: 1,
        class: "redrop-drag-preview",
      };
      Redrop.#setAttributes(this.#draggedElement, {
        "aria-grabbed": "false",
      });
    }
  }

  static #getPosition(event: PointerEvent) {
    return { x: event.clientX, y: event.clientY };
  }

  // note: manually triggered pointermove event should not bubble because it will again trigger the global
  // pointermove which will again call this function and create an infinite loop
  static #createNewPointerEventWithBubbleDisabled(event: PointerEvent, eventName: string) {
    const eventOptions = event;
    Object.defineProperty(eventOptions, "bubbles", {
      value: false,
    });
    return new PointerEvent(eventName, eventOptions);
  }

  #setActiveState(
    element: DraggableElement,
    options: BaseDraggableType,
    isDisabled: boolean,
    event: PointerEvent,
  ) {
    this.#DndState.active = this.#setState(element, options, isDisabled, event);
  }

  #setOverState(
    element: DroppableElement,
    options: BaseDroppableType,
    isDisabled: boolean,
    event: PointerEvent,
  ) {
    this.#DndState.over = this.#setState(element, options, isDisabled, event);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setData(data: any, element: DraggableElement) {
    this.#DndState.data = data;
    const draggable = Redrop.#draggables.get(this)?.get(element);

    if (draggable !== undefined) {
      Redrop.#draggables.get(this)?.set(element, {
        ...draggable,
        data,
      });
    }
  }

  #resetDndState() {
    this.#DndState = {
      active: null,
      over: null,
      data: null,
    };
    this.#resetToleranceCheckState();
  }

  // eslint-disable-next-line class-methods-use-this
  #setState<T extends DraggableElement | DroppableElement>(
    element: T,
    options: BaseDraggableType | BaseDroppableType,
    isDisabled: boolean,
    event: PointerEvent,
  ): SetState<T> {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      element,
      options,
      isDisabled,
      info: {
        rect: element.getBoundingClientRect(),
        target: event.target as HTMLElement,
        position: {
          page: { x: event.pageX, y: event.pageY },
          client: { x: event.clientX, y: event.clientY },
          offset: { x: event.offsetX, y: event.offsetY },
          screen: { x: event.screenX, y: event.screenY },
        },
      },
    } as SetState<T>;
  }

  updateOptions(
    options: DraggableOptions | DroppableOptions,
    reference:
      | DraggableElement
      | DroppableElement
      | DraggableElements
      | DroppableElements
      | "drag"
      | "drop",
  ) {
    let dndOption = options;
    if (reference === "drag") {
      const draggables = Redrop.getDraggables(this);

      reference = draggables.map((draggable) => draggable.element) as DraggableElements;
    } else if (reference === "drop") {
      const droppables = Redrop.getDroppables(this);

      reference = droppables.map((droppable) => droppable.element) as DroppableElements;
    }

    if (Array.isArray(reference)) {
      if (reference.length === 0) return;
      let referenceType: "drag" | "drop";
      if (Redrop.getDraggables(this, reference[0]).draggableOptions !== undefined) {
        referenceType = "drag";
      } else if (Redrop.getDroppables(this, reference[0]).droppableOptions !== undefined) {
        referenceType = "drop";
      }
      reference.forEach((element) => {
        dndOption = Redrop.#setDndId(referenceType, element, dndOption) as unknown as
          | DraggableOptions
          | DroppableOptions;

        this.#updateDndOptions(element, dndOption);
      });
      return;
    }

    if (reference instanceof HTMLElement) {
      this.#updateDndOptions(reference, dndOption);
    }
  }

  #updateDndOptions(
    element: DraggableElement | DroppableElement,
    options: DraggableOptions | DroppableOptions,
  ) {
    if (Redrop.getDraggables(this, element as Element).draggableOptions !== undefined) {
      const { draggableOptions } = Redrop.getDraggables(this, element as Element);
      if (options?.modifiers?.disabled !== undefined) {
        if (options.modifiers.disabled && !draggableOptions.modifiers.disabled) {
          this.#disableDraggable(element);
        } else if (!options.modifiers.disabled && draggableOptions.modifiers.disabled) {
          this.#enableDraggable(element);
        }
      }
      const finalOptions = setDraggableOptions(draggableOptions, options as DraggableOptions);
      Redrop.#setDraggables(this, element as DraggableElement, finalOptions);
    } else if (Redrop.getDroppables(this, element as Element).droppableOptions !== undefined) {
      const { droppableOptions } = Redrop.getDroppables(this, element as Element);
      if (options?.modifiers?.disabled !== undefined) {
        if (options.modifiers.disabled && !droppableOptions.modifiers.disabled) {
          this.#disableDroppable(element);
        } else if (!options.modifiers.disabled && droppableOptions.modifiers.disabled) {
          this.#enableDroppable(element);
        }
      }
      const finalOptions = setDroppableOptions(droppableOptions, options as DroppableOptions);
      Redrop.#setDroppables(this, element as DroppableElement, finalOptions);
    }
  }

  disable(
    reference?:
      | DraggableElement
      | DroppableElement
      | DraggableElements
      | DroppableElements
      | "drag"
      | "drop",
  ) {
    if (reference !== undefined) {
      this.updateOptions(
        {
          modifiers: {
            disabled: true,
          },
        },
        reference,
      );

      if (reference === "drag" || reference === "drop") {
        const elements =
          reference === "drag" ? Redrop.getDraggables(this) : Redrop.getDroppables(this);
        elements.forEach((DndElement) => {
          if (reference === "drag") {
            this.#disableDraggable(DndElement.element);
          } else if (reference === "drop") {
            this.#disableDroppable(DndElement.element);
          }
        });
      } else if (reference instanceof HTMLElement) {
        if (Redrop.getDraggables(this, reference).draggableOptions !== undefined) {
          this.#disableDraggable(reference);
        } else if (Redrop.getDroppables(this, reference).droppableOptions !== undefined) {
          this.#disableDroppable(reference);
        }
      } else if (Array.isArray(reference)) {
        reference.forEach((element) => {
          if (Redrop.getDraggables(this, element).draggableOptions !== undefined) {
            this.#disableDraggable(element);
          } else if (Redrop.getDroppables(this, element).droppableOptions !== undefined) {
            this.#disableDroppable(element);
          }
        });
      }

      this.#resetDndState();
      return;
    }

    // if reference is empty disable all drag and drop elements
    const dragEventControllers = this.#EventAbortController.dragEvents;
    const dropEventControllers = this.#EventAbortController.dropEvents;

    dropEventControllers.forEach((controller) => {
      controller.abort();
    });

    dragEventControllers.forEach((controller) => {
      controller.abort();
    });

    Redrop.getDraggables(this).forEach((DndElement) => {
      Redrop.#setAttributes(DndElement.element, { draggable: "false", "aria-grabbed": "false" });
    });

    Redrop.getDroppables(this).forEach((DndElement) => {
      Redrop.#setAttributes(DndElement.element, { "data-redrop-droppable": "false" });
    });

    this.#resetDndState();
  }

  enable(
    reference?:
      | DraggableElement
      | DroppableElement
      | DraggableElements
      | DroppableElements
      | "drag"
      | "drop",
  ) {
    if (reference !== undefined) {
      this.updateOptions(
        {
          modifiers: {
            disabled: false,
          },
        },
        reference,
      );

      if (reference === "drag" || reference === "drop") {
        const elements =
          reference === "drag" ? Redrop.getDraggables(this) : Redrop.getDroppables(this);
        elements.forEach((DndElement) => {
          if (reference === "drag") {
            this.#enableDraggable(DndElement.element);
          } else if (reference === "drop") {
            this.#enableDroppable(DndElement.element);
          }
        });
      } else if (reference instanceof HTMLElement) {
        if (Redrop.getDraggables(this, reference).draggableOptions !== undefined) {
          this.#enableDraggable(reference);
        } else {
          this.#enableDroppable(reference);
        }
      } else if (Array.isArray(reference)) {
        reference.forEach((element) => {
          if (Redrop.getDraggables(this, element).draggableOptions !== undefined) {
            Redrop.#setAttributes(element, { draggable: "true" });
            this.#onPointerDown(element as DraggableElement);
          } else {
            this.#initDropEvents(element as DroppableElement);
          }
        });
      }
      return;
    }

    Redrop.getDraggables(this).forEach((DndElement) => {
      Redrop.#setAttributes(DndElement.element, { draggable: "true" });
      this.#onPointerDown(DndElement.element);
    });

    Redrop.getDroppables(this).forEach((DndElement) => {
      Redrop.#setAttributes(DndElement.element, { "data-redrop-droppable": "true" });
      this.#initDropEvents(DndElement.element);
    });
  }

  // utility functions for disable and enable
  #disableDraggable(element: HTMLElement) {
    Redrop.#setAttributes(element, { draggable: "false", "aria-grabbed": "false" });

    element.style.touchAction = "auto";
    this.#EventAbortController.dragEvents.get(element)?.abort();
  }

  #disableDroppable(element: HTMLElement) {
    Redrop.#setAttributes(element, { "data-redrop-droppable": "false" });
    this.#EventAbortController.dropEvents.get(element)?.abort();
  }

  #enableDraggable(element: HTMLElement) {
    Redrop.#setAttributes(element, { draggable: "true" });

    element.style.touchAction = "none";
    this.#onPointerDown(element as DraggableElement);
  }

  #enableDroppable(element: HTMLElement) {
    Redrop.#setAttributes(element, { "data-redrop-droppable": "true" });
    this.#initDropEvents(element as DroppableElement);
  }

  // end of the class
}
