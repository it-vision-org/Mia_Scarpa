"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Eye, EyeOff, Star, Pencil, X } from "lucide-react";

import {
  deleteProduct,
  toggleProductPublished,
  toggleProductFeatured,
  updateProductQuickFields,
  bulkDeleteProducts,
  bulkSetPublished,
  bulkSetFeatured,
} from "@/actions/adminActions";
import { formatPrice } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";
import type { AdminProductDetail } from "@/types";

type Row = AdminProductDetail & { brandName: string | null };

function thumbnailUrl(product: Row): string | null {
  // main product photos take priority; fall back to the first color's first
  // photo so products defined only through color variants still show a thumbnail.
  return product.images[0] ?? product.colorImages[0]?.imageUrls[0] ?? null;
}

export function ProductsTable({ products: initial }: { products: Row[] }) {
  const t = useTranslations("Admin");
  const [products, setProducts] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [editing, setEditing] = useState<{ id: string; field: "name" | "price" } | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const allSelected = products.length > 0 && selected.size === products.length;

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected(allSelected ? new Set() : new Set(products.map((p) => p.id)));
  }

  function startEdit(product: Row, field: "name" | "price") {
    setEditing({ id: product.id, field });
    setDraft(field === "name" ? product.name : String(product.priceCents / 100));
  }

  function cancelEdit() {
    setEditing(null);
    setDraft("");
  }

  function commitEdit() {
    if (!editing) return;
    const { id, field } = editing;
    const product = products.find((p) => p.id === id);
    if (!product) {
      cancelEdit();
      return;
    }

    if (field === "name") {
      const name = draft.trim();
      if (!name || name === product.name) {
        cancelEdit();
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
      cancelEdit();
      startTransition(async () => {
        const res = await updateProductQuickFields(id, { name });
        if (!res.success) {
          setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, name: product.name } : p)));
        }
      });
    } else {
      const priceNum = parseFloat(draft);
      if (isNaN(priceNum) || priceNum < 0) {
        cancelEdit();
        return;
      }
      const priceCents = Math.round(priceNum * 100);
      if (priceCents === product.priceCents) {
        cancelEdit();
        return;
      }
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, priceCents } : p)));
      cancelEdit();
      startTransition(async () => {
        const res = await updateProductQuickFields(id, { priceCents });
        if (!res.success) {
          setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, priceCents: product.priceCents } : p)));
        }
      });
    }
  }

  function handleTogglePublished(product: Row) {
    const value = !product.isPublished;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isPublished: value } : p)));
    startTransition(async () => {
      const res = await toggleProductPublished(product.id, value);
      if (!res.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isPublished: !value } : p)));
      }
    });
  }

  function handleToggleFeatured(product: Row) {
    const value = !product.isFeatured;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isFeatured: value } : p)));
    startTransition(async () => {
      const res = await toggleProductFeatured(product.id, value);
      if (!res.success) {
        setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isFeatured: !value } : p)));
      }
    });
  }

  function handleDelete(id: string) {
    setError("");
    startTransition(async () => {
      const res = await deleteProduct(id);
      setDeleteConfirmId(null);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        setError(res.error ?? t("ErrGeneric"));
      }
    });
  }

  function handleBulkDelete() {
    setError("");
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkDeleteProducts(ids);
      setBulkDeleteConfirm(false);

      if (!res.success) {
        setError(res.error ?? t("ErrGeneric"));
        return;
      }

      // Some selected products may have existing orders and be skipped — remove
      // only the ones that were actually deleted, keep the rest selected, and
      // surface why they're still there.
      const deletedIds = new Set(res.data?.deletedIds ?? []);
      if (deletedIds.size > 0) {
        setProducts((prev) => prev.filter((p) => !deletedIds.has(p.id)));
        setSelected((prev) => {
          const next = new Set(prev);
          for (const id of deletedIds) next.delete(id);
          return next;
        });
      }
      if (res.error) setError(res.error);
    });
  }

  function handleBulkSetPublished(value: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkSetPublished(ids, value);
      if (res.success) {
        setProducts((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, isPublished: value } : p)));
      }
    });
  }

  function handleBulkSetFeatured(value: boolean) {
    const ids = Array.from(selected);
    startTransition(async () => {
      const res = await bulkSetFeatured(ids, value);
      if (res.success) {
        setProducts((prev) => prev.map((p) => (selected.has(p.id) ? { ...p, isFeatured: value } : p)));
      }
    });
  }

  const deletingProduct = useMemo(
    () => products.find((p) => p.id === deleteConfirmId) ?? null,
    [products, deleteConfirmId],
  );

  // shared render helpers — keep the inline-edit / badges / actions markup identical
  // between the desktop table row and the mobile card layout below.
  function renderName(product: Row) {
    const isEditingName = editing?.id === product.id && editing.field === "name";
    if (isEditingName) {
      return (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          onBlur={commitEdit}
          className="w-full max-w-[200px] rounded-lg border border-[var(--color-accent)] bg-white px-2 py-1 text-sm font-semibold text-[var(--color-text)] outline-none"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => startEdit(product, "name")}
        title={t("TipClickToEdit")}
        className="group flex items-center gap-1.5 text-left font-semibold text-[var(--color-text)]"
      >
        <span className="truncate">{product.name}</span>
        <Pencil className="h-3 w-3 shrink-0 text-[var(--color-muted)] opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  }

  function renderPrice(product: Row) {
    const isEditingPrice = editing?.id === product.id && editing.field === "price";
    if (isEditingPrice) {
      return (
        <input
          autoFocus
          type="number"
          min="0"
          step="0.001"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          onBlur={commitEdit}
          className="w-24 rounded-lg border border-[var(--color-accent)] bg-white px-2 py-1 text-sm font-semibold text-[var(--color-text)] outline-none"
        />
      );
    }
    return (
      <button
        type="button"
        onClick={() => startEdit(product, "price")}
        title={t("TipClickToEdit")}
        className="group flex items-center gap-1.5"
      >
        {formatPrice(product.priceCents / 100)}
        <Pencil className="h-3 w-3 shrink-0 text-[var(--color-muted)] opacity-0 transition group-hover:opacity-100" />
      </button>
    );
  }

  function renderColorSwatches(product: Row) {
    return (
      <div className="flex gap-1">
        {product.colorImages.slice(0, 4).map((c, i) =>
          c.imageUrls[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={c.imageUrls[0]}
              alt={c.name}
              title={c.name}
              className="h-7 w-7 rounded-full border-2 border-white object-cover shadow-sm"
            />
          ) : (
            <span
              key={i}
              title={c.name}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] text-[9px] font-bold text-[var(--color-muted)]"
              style={{ backgroundColor: c.hex }}
            />
          ),
        )}
        {product.colorImages.length > 4 && (
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[9px] font-bold text-[var(--color-muted)]">
            +{product.colorImages.length - 4}
          </span>
        )}
      </div>
    );
  }

  function renderStatusBadges(product: Row) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            product.isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {product.isPublished ? t("StatePublished") : t("StateDraft")}
        </span>
        {product.isFeatured && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {t("StateFeatured")}
          </span>
        )}
      </div>
    );
  }

  function renderRowActions(product: Row) {
    return (
      <>
        <Link
          href={`/admin/products/${product.slug}/edit`}
          title={t("TipEditShoe")}
          className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-accent)]"
        >
          <Pencil className="h-4 w-4" />
        </Link>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleTogglePublished(product)}
          title={product.isPublished ? t("TipUnpublish") : t("TipPublish")}
          className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-[var(--color-bg)] hover:text-[var(--color-text)] disabled:opacity-40"
        >
          {product.isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => handleToggleFeatured(product)}
          title={product.isFeatured ? t("TipRemoveFeatured") : t("TipMarkFeatured")}
          className={`rounded-lg p-1.5 transition hover:bg-[var(--color-bg)] disabled:opacity-40 ${
            product.isFeatured
              ? "text-amber-500 hover:text-amber-600"
              : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Star className="h-4 w-4" fill={product.isFeatured ? "currentColor" : "none"} />
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={() => setDeleteConfirmId(product.id)}
          title={t("TipDeleteShoe")}
          className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[var(--color-border)] py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]">
          <svg className="h-8 w-8 text-[var(--color-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <p className="font-semibold text-[var(--color-text)]">{t("NoShoesYet")}</p>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{t("NoShoesYetDesc")}</p>
        <Link
          href="/admin/products/new"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> {t("AddShoe")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 rounded-lg p-0.5 text-red-500 transition hover:bg-red-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-4 py-3">
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {t("NSelected", { count: selected.size })}
          </span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkSetPublished(true)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              {t("TipPublish")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkSetPublished(false)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              {t("TipUnpublish")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkSetFeatured(true)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              {t("BulkFeature")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleBulkSetFeatured(false)}
              className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-bg)] disabled:opacity-40"
            >
              {t("BulkUnfeature")}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setBulkDeleteConfirm(true)}
              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40"
            >
              {t("Delete")}
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="rounded-lg p-1.5 text-[var(--color-muted)] transition hover:bg-white hover:text-[var(--color-text)]"
              title={t("TipClearSelection")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop table — lg and up */}
      <div className="hidden overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded accent-[var(--color-accent)]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("ColShoe")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("ColPrice")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("ColColors")}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("ColStatus")}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">{t("ColActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {products.map((product) => {
                const thumbnail = thumbnailUrl(product);

                return (
                  <tr key={product.id} className="transition hover:bg-[var(--color-bg)]">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="h-4 w-4 rounded accent-[var(--color-accent)]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnail}
                            alt={product.name}
                            className="h-12 w-12 shrink-0 rounded-xl border border-[var(--color-border)] object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
                        )}
                        {renderName(product)}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[var(--color-text)]">{renderPrice(product)}</td>
                    <td className="px-4 py-3">{renderColorSwatches(product)}</td>
                    <td className="px-4 py-3">{renderStatusBadges(product)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">{renderRowActions(product)}</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/tablet card list — below lg */}
      <div className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm lg:hidden">
        {products.map((product) => {
          const thumbnail = thumbnailUrl(product);
          return (
            <div key={product.id} className="flex gap-3 p-4">
              <input
                type="checkbox"
                checked={selected.has(product.id)}
                onChange={() => toggleSelect(product.id)}
                className="mt-1 h-4 w-4 shrink-0 rounded accent-[var(--color-accent)]"
              />
              {thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={thumbnail}
                  alt={product.name}
                  className="h-14 w-14 shrink-0 rounded-xl border border-[var(--color-border)] object-cover"
                />
              ) : (
                <div className="h-14 w-14 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">{renderName(product)}</div>
                  <div className="flex shrink-0 items-center gap-1">{renderRowActions(product)}</div>
                </div>
                <div className="mt-1 text-sm">{renderPrice(product)}</div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {renderColorSwatches(product)}
                  {renderStatusBadges(product)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {deletingProduct && (
        <ConfirmDialog
          title={t("DeleteShoeTitle")}
          message={t("DeleteShoeMessage", { name: deletingProduct.name })}
          isPending={isPending}
          onConfirm={() => handleDelete(deletingProduct.id)}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {bulkDeleteConfirm && (
        <ConfirmDialog
          title={t("DeleteNShoesTitle", { count: selected.size })}
          message={t("DeleteNShoesMessage")}
          isPending={isPending}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
