/**
 * Visual UI editor (optional feature).
 * Owner: code-generation engine + backend. STATUS: DRAFT — NOT AGREED.
 *
 * Every edit must round-trip through source code: the backend parses the
 * Compose/XML source into a component tree, applies a typed edit, and
 * returns a ChangeSet that the user reviews like any other agent change.
 * The frontend must not mutate a static preview on its own.
 */
import type { ID } from "./common";
import type { ChangeSet } from "./agent";

export interface UiNode {
  id: ID;
  /** e.g. "Column", "Text", "Button", "LinearLayout", "TextView" */
  component: string;
  /** Source location this node maps to. */
  source: { path: string; startLine: number; endLine: number };
  props: Record<string, string | number | boolean | null>;
  children: UiNode[];
}

export interface UiScreen {
  id: ID;
  name: string;
  path: string;
  toolkit: "compose" | "xml";
  root: UiNode;
  /** Rendered preview image, produced by the backend (e.g. Paparazzi/layoutlib). */
  previewUrl: string | null;
}

export type UiEdit =
  | { kind: "setProp"; nodeId: ID; prop: string; value: string | number | boolean | null }
  | { kind: "insert"; parentId: ID; index: number; component: string }
  | { kind: "remove"; nodeId: ID }
  | { kind: "move"; nodeId: ID; parentId: ID; index: number }
  | { kind: "prompt"; nodeId: ID | null; instruction: string };

/** POST /projects/{id}/ui/screens/{screenId}/edits */
export interface ApplyUiEditsRequest {
  edits: UiEdit[];
}

export interface ApplyUiEditsResponse {
  changeSet: ChangeSet;
  screen: UiScreen;
}
