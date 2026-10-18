/** Tiny className joiner. Falsy values (false, 0, null, undefined, "") are skipped. */
export const cn = (...classes: (string | number | false | null | undefined)[]) =>
  classes.filter((c): c is string => typeof c === "string" && c.length > 0).join(" ");
