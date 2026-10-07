/**
 * Session-held flags, so a hot reload or plugin update never forgets that the
 * successor already exists and starts a second handoff.
 */
export type HandoffFlag = boolean

declare module 'claude-code' {
  interface PluginState {
    'context-handoff': { hasHandedOff: HandoffFlag; hasWarned: HandoffFlag }
  }
}
