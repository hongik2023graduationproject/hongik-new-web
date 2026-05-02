"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTab, removeTab, switchTab, renameTab } from "@/store/playgroundSlice";
import { Plus, X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

export function TabBar() {
  const dispatch = useAppDispatch();
  const tabs = useAppSelector((state) => state.playground.tabs);
  const activeTabId = useAppSelector((state) => state.playground.activeTabId);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const commitRename = useCallback(() => {
    if (editingId) {
      const trimmed = editValue.trim();
      if (trimmed) {
        dispatch(renameTab({ id: editingId, name: trimmed }));
      }
      setEditingId(null);
    }
  }, [editingId, editValue, dispatch]);

  const handleDoubleClick = (id: string, name: string) => {
    setEditingId(id);
    setEditValue(name);
  };

  return (
    <div className="flex items-center border-b bg-muted/30 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            className={`group flex items-center gap-1 border-r px-3 py-1.5 text-sm cursor-pointer select-none shrink-0 ${
              isActive
                ? "bg-background text-foreground border-b-2 border-b-primary"
                : "text-muted-foreground hover:bg-muted/50"
            }`}
            onClick={() => dispatch(switchTab(tab.id))}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                dispatch(switchTab(tab.id));
              }
            }}
            onDoubleClick={() => handleDoubleClick(tab.id, tab.name)}
          >
            {editingId === tab.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-20 bg-transparent border-b border-primary outline-none text-sm"
              />
            ) : (
              <span className="max-w-[120px] truncate">{tab.name}</span>
            )}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeTab(tab.id));
                }}
                className="ml-1 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-muted-foreground/20 transition-opacity"
                title="탭 닫기"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      <button
        onClick={() => dispatch(addTab())}
        className="flex items-center justify-center shrink-0 px-2 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        title="새 탭 추가"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
