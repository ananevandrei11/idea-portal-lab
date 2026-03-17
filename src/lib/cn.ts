/**
 * Merges class names, filtering out falsy values.
 * Use when combining CSS module classes with Tailwind or conditional classes.
 *
 * @example
 * cn(styles.card, "bg-white", isOpen && "border-blue-500")
 */
export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}
