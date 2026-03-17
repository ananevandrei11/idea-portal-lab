import Link from "next/link";
import { cn } from "@/lib/cn";
import { Tag } from "@/components/Tag/Tag";
import styles from "./IdeaCard.module.css";

interface IdeaCardProps {
  parentListName?: string;
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
}

export function IdeaCard({ id, title, content, tags, createdAt, parentListName }: IdeaCardProps) {
  return (
    <details
      name={parentListName}
      className={cn(
        styles.card,
        "group bg-white dark:bg-zinc-900 rounded-xl shadow-sm",
        "border border-zinc-200 dark:border-zinc-800 open:border-zinc-400 dark:open:border-zinc-600",
        "transition-colors",
      )}
    >
      <summary className={cn(
        styles.summary,
        "flex items-start gap-3 p-5 cursor-pointer",
        "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
        "rounded-xl open:rounded-b-none transition-colors",
      )}>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((tag) => <Tag key={tag} label={tag} />)}
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-400">
            {new Date(createdAt).toLocaleDateString("en-US", { timeZone: "UTC", dateStyle: "medium" })}
          </p>
        </div>

        {/* chevron — rotates 180° when details is open */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className="mt-1 shrink-0 text-zinc-400 transition-transform duration-200 group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      {/* ::details-content is the grid container (see CSS).
          .content is the single grid item: overflow:hidden + min-height:0
          so 0fr collapses it to zero. Padding lives on the inner div. */}
      <div className={styles.content}>
        <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800">
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {content}
          </p>
          <div className="mt-4 flex justify-end">
            <Link
              href={`/ideas/${id}`}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Open idea →
            </Link>
          </div>
        </div>
      </div>
    </details>
  );
}
