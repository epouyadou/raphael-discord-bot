export const DURATION_PARSER_SYMBOL = Symbol('IDurationParser');

export interface IDurationParser {
  /**
   * Parses a duration string into milliseconds.
   * @param duration The duration string to parse.
   * @returns The duration in milliseconds.
   */
  parse(duration?: string): number;
}
