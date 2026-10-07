/**
 * Where a finished handoff went and who continues it; recorded by the
 * handoff_complete tool. Session-held, so a hot reload or plugin update never
 * forgets it and starts a second handoff.
 */
export type Handoff = { location: string; successor: string }

/**
 * isHandingOff: the configured skill is running (cleared when the turn ends).
 * hasWarned: the threshold toast was shown (cleared once context drops below it).
 */
export type HandoffFlag = boolean

declare module 'claude-code' {
  interface PluginState {
    'context-handoff': { handoff: Handoff | null; isHandingOff: HandoffFlag; hasWarned: HandoffFlag }
  }
}
