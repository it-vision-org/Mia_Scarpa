"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Pencil, Loader2, FolderTree, Check, X } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categoryActions";
import type { CategoryNode, Gender } from "@/types";
import { ConfirmDialog } from "./ConfirmDialog";

const inp =
  "w-full rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 transition";

function NewCategoryForm({
  gender,
  parentId,
  onDone,
}: {
  gender: Gender;
  parentId: string | null;
  onDone: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    startTransition(async () => {
      const res = await createCategory({ name: name.trim(), gender, parentId });
      if (res.success) {
        setName("");
        onDone();
        router.refresh();
      } else {
        setError(res.error ?? "Failed to create category");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={parentId ? "Sub-category name" : "Category name"}
        className={inp}
      />
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-3 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-green-mid)] disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="shrink-0 rounded-xl border border-[var(--color-border)] p-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </form>
  );
}

function CategoryRow({ category, gender, depth }: { category: CategoryNode; gender: Gender; depth: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [addingChild, setAddingChild] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await updateCategory(category.id, { name: name.trim() });
      setEditing(false);
      router.refresh();
    });
  }

  function handleDelete() {
    setConfirmOpen(false);
    startTransition(async () => {
      await deleteCategory(category.id);
      router.refresh();
    });
  }

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3">
        <FolderTree className="h-4 w-4 shrink-0 text-[var(--color-muted)]" />

        {editing ? (
          <form onSubmit={handleRename} className="flex flex-1 items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inp}
            />
            <button type="submit" disabled={pending} className="text-[var(--color-accent)]">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button type="button" onClick={() => { setEditing(false); setName(category.name); }} className="text-[var(--color-muted)]">
              <X className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <>
            <p className="flex-1 text-sm font-semibold text-[var(--color-text)]">{category.name}</p>
            <div className="flex shrink-0 items-center gap-1.5">
              {depth === 0 && (
                <button
                  type="button"
                  onClick={() => setAddingChild((v) => !v)}
                  title="Add sub-category"
                  className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setEditing(true)}
                title="Rename"
                className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                title="Delete"
                className="rounded-lg border border-[var(--color-border)] p-1.5 text-[var(--color-muted)] transition hover:border-red-200 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
      </div>

      {addingChild && (
        <div className="mt-2" style={{ marginLeft: 24 }}>
          <NewCategoryForm gender={gender} parentId={category.id} onDone={() => setAddingChild(false)} />
        </div>
      )}

      {category.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {category.children.map((child) => (
            <CategoryRow key={child.id} category={child} gender={gender} depth={depth + 1} />
          ))}
        </div>
      )}

      {confirmOpen && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${category.name}" will be removed. Products and sub-categories in it are kept, just unassigned from it.`}
          confirmLabel="Delete"
          isPending={pending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </div>
  );
}

function CategoryGenderSection({ gender, label, tree }: { gender: Gender; label: string; tree: CategoryNode[] }) {
  const [showNewForm, setShowNewForm] = useState(false);

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[var(--color-text)]">{label}</h2>
          <p className="text-xs text-[var(--color-muted)]">
            {tree.length} top-level {tree.length === 1 ? "category" : "categories"}
          </p>
        </div>
        {!showNewForm && (
          <button
            onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--color-green-mid)] active:scale-95"
          >
            <Plus className="h-4 w-4" />
            New {label} Category
          </button>
        )}
      </div>

      {showNewForm && (
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-white p-4">
          <NewCategoryForm gender={gender} parentId={null} onDone={() => setShowNewForm(false)} />
        </div>
      )}

      {tree.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-border)] bg-white py-12 text-center">
          <p className="text-sm text-[var(--color-muted)]">No {label.toLowerCase()} categories yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tree.map((cat) => (
            <CategoryRow key={cat.id} category={cat} gender={gender} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoriesClient({
  menTree,
  womenTree,
}: {
  menTree: CategoryNode[];
  womenTree: CategoryNode[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CategoryGenderSection gender="MEN" label="Men" tree={menTree} />
      <CategoryGenderSection gender="WOMEN" label="Women" tree={womenTree} />
    </div>
  );
}
