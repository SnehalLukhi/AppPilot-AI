/**
 * Live app preview (POST/DELETE /api/v1/projects/{id}/preview/session).
 * Owner: build workers (emulator pool). STATUS: DRAFT — NOT AGREED.
 *
 * Preview sources, best first:
 *   1. emulator stream  - this contract. A real, running build in an emulator.
 *   2. rendered screens - `UiScreen.previewUrl` from GET .../ui/screens (see visual-editor.ts).
 *   3. nothing          - the frontend explains why; it never fakes the user's app.
 *
 * The frontend never runs the app. It only embeds what the backend serves.
 */
import type { ID, ISODate } from "./common";

export interface PreviewDevice {
  name: string;
  apiLevel: number;
  /** Logical screen size in px. Used for the frame's aspect ratio. */
  width: number;
  height: number;
}

/** POST /projects/{id}/preview/session */
export interface StartPreviewSessionRequest {
  /** Defaults to the project's latest successful debug build. */
  buildId?: ID;
  /** Device profile id; the backend picks a default. */
  device?: string;
}

export interface EmulatorStreamSession {
  sessionId: ID;
  buildId: ID;
  /**
   * Short-lived, signed HTTPS URL of a viewer page served by the emulator host.
   * The frontend embeds it in a sandboxed iframe; the viewer page itself
   * handles video, touch and keyboard input. Must not outlive `expiresAt`.
   */
  viewerUrl: string;
  state: "starting" | "running";
  device: PreviewDevice;
  expiresAt: ISODate;
}

/**
 * Error codes (ApiErrorBody.error.code) the preview endpoint may return so the
 * frontend can show an accurate, actionable message.
 */
export type PreviewErrorCode =
  | "no_build" // 409: nothing has been built yet
  | "build_failed" // 409: the latest build failed
  | "build_in_progress" // 409: a build is running; try again when it finishes
  | "emulator_unavailable" // 503: no free emulator right now
  | "unsupported_project"; // 422: e.g. APK analysis projects
