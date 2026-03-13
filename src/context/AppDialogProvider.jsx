// src/ui/dialogs/AppDialogProvider.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import {
  Alert,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";

const AppDialogContext = createContext(null);

const VARIANT_TO_FLOWBITE_COLOR = {
  alternative: "alternative",
  dark: "dark",
  light: "light",
  green: "green",
  red: "red",
  yellow: "yellow",
  purple: "purple",
};

const variantAccentClasses = {
  alternative: "border-gray-200 dark:border-gray-700",
  dark: "border-gray-700 dark:border-gray-600",
  light: "border-gray-200 dark:border-gray-700",
  green: "border-green-200 dark:border-green-800",
  red: "border-red-200 dark:border-red-800",
  yellow: "border-yellow-200 dark:border-yellow-800",
  purple: "border-purple-200 dark:border-purple-800",
};

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AppDialogProvider({ children }) {
  /**
   * =========================
   * Alerts (STACKED)
   * =========================
   */
  const [alerts, setAlerts] = useState([]);
  const alertTimersRef = useRef(new Map()); // id -> timeoutId

  const removeAlert = useCallback((id) => {
    const t = alertTimersRef.current.get(id);
    if (t) {
      window.clearTimeout(t);
      alertTimersRef.current.delete(id);
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const alert = useCallback((options) => {
    return new Promise((resolve) => {
      const {
        title,
        message,
        variant = "alternative",
        dismissible = true,
        durationMs = 0,
      } = options || {};

      const id = makeId();

      setAlerts((prev) => [
        ...prev,
        { id, title, message, variant, dismissible, resolve },
      ]);

      if (durationMs && durationMs > 0) {
        const timeoutId = window.setTimeout(() => {
          setAlerts((prev) => {
            const found = prev.find((x) => x.id === id);
            if (found?.resolve) found.resolve();
            return prev.filter((x) => x.id !== id);
          });
          alertTimersRef.current.delete(id);
        }, durationMs);

        alertTimersRef.current.set(id, timeoutId);
      }
    });
  }, []);

  /**
   * =========================
   * Confirm (QUEUED + SAFE)
   * =========================
   */
  const confirmQueueRef = useRef([]); // [{ options, resolve }]
  const confirmBusyRef = useRef(false);
  const confirmResolveRef = useRef(null);

  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "Confirm",
    message: null,
    variant: "alternative",
    confirmText: "Confirm",
    cancelText: "Cancel",
    closeOnBackdrop: true,
  });

  // We'll store the "open next confirm" function in a ref to avoid TDZ/self-reference issues
  const openNextConfirmRef = useRef(null);

  useEffect(() => {
    openNextConfirmRef.current = () => {
      if (confirmBusyRef.current) return;

      const next = confirmQueueRef.current.shift();
      if (!next) return;

      confirmBusyRef.current = true;

      // resolver for this confirm; when done, open the next one via ref
      confirmResolveRef.current = (value) => {
        next.resolve(value);
        confirmResolveRef.current = null;
        confirmBusyRef.current = false;

        // open next, if any
        if (openNextConfirmRef.current) openNextConfirmRef.current();
      };

      const {
        title = "Confirm",
        message,
        variant = "alternative",
        confirmText = "Confirm",
        cancelText = "Cancel",
        closeOnBackdrop = true,
      } = next.options || {};

      setConfirmState({
        open: true,
        title,
        message,
        variant,
        confirmText,
        cancelText,
        closeOnBackdrop,
      });
    };
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmQueueRef.current.push({ options, resolve });
      if (openNextConfirmRef.current) openNextConfirmRef.current();
    });
  }, []);

  const resolveConfirm = useCallback((value) => {
    setConfirmState((s) => ({ ...s, open: false }));
    const r = confirmResolveRef.current;
    if (r) r(value);
  }, []);

  const value = useMemo(() => ({ alert, confirm }), [alert, confirm]);

  return (
    <AppDialogContext.Provider value={value}>
      {children}

      {/* ALERT STACK (toast-like) */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 w-[calc(100%-2rem)] max-w-md space-y-3 ">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`border rounded-lg shadow ${
                variantAccentClasses[a.variant] ||
                variantAccentClasses.alternative
              }`}
            >
              <Alert
                color={VARIANT_TO_FLOWBITE_COLOR[a.variant] || "alternative"}
                onDismiss={
                  a.dismissible
                    ? () => {
                        if (a.resolve) a.resolve();
                        removeAlert(a.id);
                      }
                    : undefined
                }
              >
                <div className="flex flex-col gap-1 float-left">
                  {a.title && (
                    <span className="font-semibold" dir="rtl">
                      {a.title}
                    </span>
                  )}
                  <div className="text-sm" dir="rtl">
                    {a.message}
                  </div>

                  {!a.dismissible && (
                    <div className="pt-2">
                      <Button
                        size="xs"
                        onClick={() => {
                          if (a.resolve) a.resolve();
                          removeAlert(a.id);
                        }}
                      >
                        OK
                      </Button>
                    </div>
                  )}
                </div>
              </Alert>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRM MODAL (queued) */}
      <Modal
        show={confirmState.open}
        onClose={() =>
          confirmState.closeOnBackdrop ? resolveConfirm(false) : undefined
        }
        dismissible={confirmState.closeOnBackdrop}
        dir="rtl"
      >
        <ModalHeader className="text-pop grid grid-cols-[auto_20px] items-center ">
          {confirmState.title}
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2 text-sm text">{confirmState.message}</div>
        </ModalBody>
        <ModalFooter className="justify-end gap-2">
          <Button
            className="text-lg font-semibold cursor-pointer"
            color="alternative"
            onClick={() => resolveConfirm(false)}
          >
            {confirmState.cancelText}
          </Button>

          <Button
            className="text-lg font-semibold cursor-pointer"
            color={
              VARIANT_TO_FLOWBITE_COLOR[confirmState.variant] || "alternative"
            }
            onClick={() => resolveConfirm(true)}
          >
            {confirmState.confirmText}
          </Button>
        </ModalFooter>
      </Modal>
    </AppDialogContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppDialog() {
  const ctx = useContext(AppDialogContext);
  if (!ctx)
    throw new Error("useAppDialog must be used within <AppDialogProvider>");
  return ctx;
}
