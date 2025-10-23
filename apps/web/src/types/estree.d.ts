// Minimal estree typings to satisfy packages referencing 'estree' types in this workspace.
// This is intentionally small — expand if real estree types are required by a dependency.

declare namespace estree {
  interface Node {
    type: string;
    [key: string]: any;
  }
}

export as namespace estree;
