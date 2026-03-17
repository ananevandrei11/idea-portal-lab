interface TagProps {
  label: string;
}

export function Tag({ label }: TagProps) {
  return (
    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs text-zinc-600 dark:text-zinc-400">
      {label}
    </span>
  );
}
