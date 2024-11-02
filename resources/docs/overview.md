# Redrop

This is a quick overview of the Redrop library and its features. Redrop is a lightweight, customizable drag and drop library for JavaScript applications. It provides an easy-to-use API for creating draggable and droppable elements with extensive configuration options.

This is just a quick overview for more details please visit docs.

## Table of Contents

<!-- - [Installation](#installation) -->

- [Usage](#usage)
- [API Reference](#api-reference)
  - [Redrop Class](#redrop-class)
  - [DraggableElement and DroppableElement](#draggableelement-and-droppableelement)
- [Examples](#examples)
- [Type Definitions](#type-definitions)

<!-- ## Installation

To install Redrop, use npm:

```bash
npm install redrop
``` -->

## Usage

Here's a basic example of how to use Redrop:

```javascript
import { Redrop } from "redrop";

// Initialize Redrop
const redrop = new Redrop();

// Make an element draggable
const draggable = redrop.makeDraggable("#draggable-element");

// Make an element droppable
const droppable = redrop.makeDroppable("#droppable-element");

// Add event listeners
draggable.on("dragstart", (event, state, element) => {
  console.log("Drag started!");
});

droppable.on("drop", (event, state, element) => {
  console.log("Item dropped!");
});
```

## API Reference

### Redrop Class

The main class for initializing drag and drop functionality.

#### Constructor

```typescript
constructor(initialGlobalOptions?: GlobalOptions)
```

- `initialGlobalOptions`: Optional. Global options for draggable and droppable elements.

#### Methods

##### makeDraggable

```typescript
makeDraggable(element: Element | string | null, options?: DraggableOptions): DraggableElement
```

Makes an element draggable.

##### makeDroppable

```typescript
makeDroppable(element: Element | string | null, options?: DroppableOptions): DroppableElement
```

Makes an element droppable.

##### makeDraggables

```typescript
makeDraggables(elements: NodeListOf<Element> | HTMLCollectionOf<Element> | string[] | string, options?: DraggableOptions): DraggableElements
```

Makes multiple elements draggable.

##### makeDroppables

```typescript
makeDroppables(elements: NodeListOf<Element> | HTMLCollectionOf<Element> | string[] | string, options?: DroppableOptions): DroppableElements
```

Makes multiple elements droppable.

##### updateOptions

```typescript
updateOptions(options: DraggableOptions | DroppableOptions, reference: DraggableElement | DroppableElement | DraggableElements | DroppableElements | "drag" | "drop"): void
```

Updates options for draggable or droppable elements.

##### disable

```typescript
disable(reference?: DraggableElement | DroppableElement | DraggableElements | DroppableElements | "drag" | "drop"): void
```

Disables dragging or dropping for specified elements.

##### enable

```typescript
enable(reference?: DraggableElement | DroppableElement | DraggableElements | DroppableElements | "drag" | "drop"): void
```

Enables dragging or dropping for specified elements.

##### setData

```typescript
setData(data: any, element: DraggableElement): void
```

Sets data for a draggable element.

### DraggableElement and DroppableElement

These are enhanced HTML elements with additional methods:

#### on

```typescript
on(eventName: string, callback: Function): Element
```

Adds an event listener to the element.

## Examples

### Basic Drag and Drop

```javascript
const redrop = new Redrop();

const draggable = redrop.makeDraggable("#drag-me");
const droppable = redrop.makeDroppable("#drop-here");

draggable.on("dragstart", () => console.log("Started dragging"));
droppable.on("drop", () => console.log("Item dropped"));
```

### Multiple Draggables and Droppables

```javascript
const redrop = new Redrop();

const draggables = redrop.makeDraggables(".draggable-items");
const droppables = redrop.makeDroppables(".drop-zones");

draggables.on("dragstart", () => console.log("Started dragging an item"));
droppables.on("drop", () => console.log("Dropped on a zone"));
```

### Customizing Options

```javascript
const redrop = new Redrop({
  draggableOptions: {
    modifiers: {
      dragPreview: {
        scale: 0.9,
      },
      cursor: {
        offset: {
          preset: "bottom-left",
          x: 0,
          y: 0,
        },
      },
    },
  },
  droppableOptions: {
    modifiers: {
      highlight: {
        on: "dragmove",
        class: "my-highlight-class",
      },
    },
  },
});

const draggable = redrop.makeDraggable("#drag-me", {
  identifier: {
    type: "custom-type",
  },
});

const droppable = redrop.makeDroppable("#drop-here", {
  identifier: {
    type: {
      accept: ["custom-type"],
    },
  },
});
```

### Updating Options and Disabling/Enabling

```javascript
const redrop = new Redrop();
const draggable = redrop.makeDraggable("#drag-me");

// Update options
redrop.updateOptions({ modifiers: { dragEffect: "copy" } }, draggable);

// Disable dragging
redrop.disable(draggable);

// Enable dragging
redrop.enable(draggable);

// Disable all draggables
redrop.disable("drag");

// Enable all droppables
redrop.enable("drop");
```

## Type Definitions

### Base Types

#### BaseDraggableType

```typescript
type BaseDraggableType = {
  identifier: {
    id: string;
    type: string;
  };
  modifiers: {
    disabled: boolean;
    cursor: {
      offset: {
        x: number;
        y: number;
        preset: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "auto";
      };
      dragEffect: string;
    };
    autoRemove: boolean;
    dragPreview: {
      customPreview: HTMLElement | ((element?: DraggableElement) => HTMLElement) | null;
      ghost: boolean;
      class: string;
      scale: number;
    };
    tolerance: {
      disabled: boolean;
      time: number;
      distance: number;
      strictMatch: boolean;
    };
    dragHandleClass: string;
  };
  accessibility: {
    role: string;
    tabIndex: number;
    "aria-roledescription": string;
  };
  data: any;
};
```

Describes the base configuration for draggable elements.

#### BaseDroppableType

```typescript
type BaseDroppableType = {
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
    sorting: {
      isEnabled: boolean;
      elmClass: string;
      action: "swap" | "highlight";
      highlightClass: string;
    };
    highlight: {
      on: "dragmove" | "dragover" | "none";
      class: string;
    };
    strictMatch: boolean;
  };
};
```

Describes the base configuration for droppable elements.

#### DndState

```typescript
type DndState = {
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
  data: any;
};

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
```

### Option Types

#### DraggableOptions

```typescript
export type DraggableOptions = RecursiveAtLeastOne<BaseDraggableType>;
```

Describes the options for draggable elements, requiring at least one property from `BaseDraggableType`.

#### DroppableOptions

```typescript
export type DroppableOptions = RecursiveAtLeastOne<BaseDroppableType>;
```

Describes the options for droppable elements, requiring at least one property from `BaseDroppableType`.

### Element Types

#### DraggableElement

```typescript
export type DraggableElement = HTMLElement & {
  _Redrop: {
    draggableOptions: BaseDraggableType;
  };
  on: OnDragEvent;
};
```

Extends `HTMLElement` to include draggable-specific properties and methods.

#### DroppableElement

```typescript
export type DroppableElement = HTMLElement & {
  _Redrop: {
    droppableOptions: BaseDroppableType;
  };
  on: OnDropEvent;
};
```

Extends `HTMLElement` to include droppable-specific properties and methods.

### Collection Types

#### DraggableElements

```typescript
export type DraggableElements = (DraggableElement[] | []) & { on: OnDraggablesEvent };
```

Represents a collection of draggable elements.

#### DroppableElements

```typescript
export type DroppableElements = (DroppableElement[] | []) & { on: OnDroppablesEvent };
```

Represents a collection of droppable elements.

### Global Options

This [file](../../src/consts/index.ts) contains all the default options for draggableOptions, droppableOptions and globalOptions

#### GlobalOptions

```typescript
export type GlobalOptions = RecursiveAtLeastOne<{
  draggableOptions: DraggableOptions;
  droppableOptions: DroppableOptions;
}>;
```

Describes global options for both draggable and droppable elements, requiring at least one property from either `DraggableOptions` or `DroppableOptions`.

---

This README provides a quick overview of the Redrop library, including basic usage, API reference, examples, and type definitions. As the library evolves, expand on certain sections or add more complex examples to help users get the most out of Redrop.
