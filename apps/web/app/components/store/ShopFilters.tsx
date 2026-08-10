import Link from "next/link";
import type { CategoryNode } from "@/types";

type ShopFiltersProps = {
  categories: CategoryNode[];
  current: {
    category?: string;
    gender?: string;
    search?: string;
  };
};

function buildShopUrl(params: Record<string, string | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `/shop?${s}` : "/shop";
}

export function ShopFilters({ categories, current }: ShopFiltersProps) {
  const linkClass = (active: boolean) =>
    [
      "block rounded-lg px-3 py-2 text-sm transition",
      active
        ? "bg-[var(--color-accent)] font-semibold text-white"
        : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]",
    ].join(" ");

  return (
    <aside className="space-y-6">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Gender
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({ category: current.category, search: current.search })}
            className={linkClass(!current.gender)}
          >
            All
          </Link>
          <Link
            href={buildShopUrl({ gender: "men", category: current.category, search: current.search })}
            className={linkClass(current.gender === "men")}
          >
            Men
          </Link>
          <Link
            href={buildShopUrl({ gender: "women", category: current.category, search: current.search })}
            className={linkClass(current.gender === "women")}
          >
            Women
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Category
        </h2>
        <div className="space-y-0.5">
          <Link
            href={buildShopUrl({ gender: current.gender, search: current.search })}
            className={linkClass(!current.category)}
          >
            All categories
          </Link>
          {categories.map((c) => (
            <div key={c.id}>
              <Link
                href={buildShopUrl({ category: c.slug, gender: current.gender, search: current.search })}
                className={linkClass(current.category === c.slug)}
              >
                {c.name}
              </Link>
              {c.children.length > 0 && (
                <div className="ml-3 space-y-0.5 border-l border-[var(--color-border)] pl-2">
                  {c.children.map((child) => (
                    <Link
                      key={child.id}
                      href={buildShopUrl({ category: child.slug, gender: current.gender, search: current.search })}
                      className={linkClass(current.category === child.slug)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
