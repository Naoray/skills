/**
 * Where a finished handoff went and who continues it; recorded by the
 * handoff_complete tool.
 */
export type Handoff = { location: string; successor: string }

/**
 * The plugin's whole session state, read once per tool call. Session-held, so
 * a hot reload or plugin update never forgets a finished handoff and starts a
 * second one.
 */
export type Guard = {
  handoff: Handoff | null
  /** The configured handoff skill is running; cleared when the turn ends. */
  isHandingOff: boolean
  /** The threshold toast was shown; cleared once context drops below it. */
  hasWarned: boolean
}

declare module 'claude-code' {
  interface PluginState {
    'context-handoff': { guard: Guard }
  }
}
