"use client";

import { useState, useRef } from "react";
import { Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 shrink-0 text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value || "-"}</span>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? label}
        className="h-8 text-sm"
      />
    </div>
  );
}

export function SearchCombobox({
  value,
  placeholder,
  searchPlaceholder,
  items,
  onSelect,
  displayValue,
  disabled,
}: {
  value: string | null;
  placeholder: string;
  searchPlaceholder: string;
  items: { id: string; label: string; sub?: string }[];
  onSelect: (id: string) => void;
  displayValue: string | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = items.filter((item) =>
    `${item.label} ${item.sub ?? ""}`.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(id: string) {
    onSelect(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/5"
        )}
        onClick={() => !disabled && setOpen((prev) => !prev)}
      >
        <span className={cn(displayValue ? "text-foreground" : "text-muted-foreground")}>
          {displayValue ?? placeholder}
        </span>
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-md border bg-popover shadow-lg">
          <div className="p-2 border-b">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(item.id); }}
                >
                  <Check className={cn("h-4 w-4 shrink-0", value === item.id ? "opacity-100" : "opacity-0")} />
                  <div className="text-left">
                    <div>{item.label}</div>
                    {item.sub && <div className="text-xs text-muted-foreground">{item.sub}</div>}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
