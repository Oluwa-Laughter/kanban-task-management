"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ModalType =
  | { kind: "none" }
  | { kind: "add-board" }
  | { kind: "edit-board"; boardId: string }
  | { kind: "delete-board"; boardId: string; boardName: string }
  | { kind: "add-task"; defaultColumnId?: string }
  | { kind: "edit-task"; taskId: string }
  | { kind: "view-task"; taskId: string }
  | { kind: "delete-task"; taskId: string; taskTitle: string };

type UiContextValue = {
  modal: ModalType;
  openModal: (m: ModalType) => void;
  closeModal: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
};

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalType>({ kind: "none" });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const openModal = useCallback((m: ModalType) => setModal(m), []);
  const closeModal = useCallback(() => setModal({ kind: "none" }), []);

  const value = useMemo(
    () => ({
      modal,
      openModal,
      closeModal,
      sidebarOpen,
      setSidebarOpen,
      mobileSidebarOpen,
      setMobileSidebarOpen,
    }),
    [modal, openModal, closeModal, sidebarOpen, mobileSidebarOpen]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used inside UiProvider");
  return ctx;
}
