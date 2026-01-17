import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { buttonVariants } from "./button";

interface AlertOptions {
  title: string;
  description: string;
  action: () => void;
  actionLabel?: string;
  cancelLabel?: string;
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions | null;
}

// Global state for alerts
let alertState: AlertState = {
  isOpen: false,
  options: null,
};

// Listeners for state changes
const listeners = new Set<() => void>();

// Function to notify all listeners
const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

// Function to trigger an alert
export const showAlert = (options: AlertOptions) => {
  alertState = {
    isOpen: true,
    options,
  };
  notifyListeners();
};

// Hook to subscribe to alert state
export const useAlertState = () => {
  const [state, setState] = React.useState(alertState);

  React.useEffect(() => {
    const listener = () => setState({ ...alertState });
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return state;
};

// Alert container component that renders the dialog
export const AlertContainer = () => {
  const { isOpen, options } = useAlertState();

  const handleAction = () => {
    if (options?.action) {
      options.action();
    }
    alertState = { isOpen: false, options: null };
    notifyListeners();
  };

  const handleCancel = () => {
    alertState = { isOpen: false, options: null };
    notifyListeners();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleCancel();
    }
  };

  return (
    <AlertDialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <AlertDialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed top-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-xl bg-gray-50 duration-200 focus-within:outline-none">
          {options ? (
            <>
              <div className="flex flex-col gap-4 p-4">
                <AlertDialogPrimitive.Title className="text-lg font-semibold">
                  {options.title}
                </AlertDialogPrimitive.Title>
                <AlertDialogPrimitive.Description className="text-gray-500">
                  {options.description}
                </AlertDialogPrimitive.Description>
              </div>
              <div className="border-alpha/5 grid grid-cols-2 gap-4 border-t px-4 py-6">
                <AlertDialogPrimitive.Cancel
                  onClick={handleCancel}
                  className={buttonVariants({ size: "lg", variant: "subtle" })}
                >
                  {options.cancelLabel || "Cancel"}
                </AlertDialogPrimitive.Cancel>
                <AlertDialogPrimitive.Action
                  onClick={handleAction}
                  className={buttonVariants({
                    size: "lg",
                    variant: "red-subtle",
                  })}
                >
                  {options.actionLabel || "Confirm"}
                </AlertDialogPrimitive.Action>
              </div>
            </>
          ) : null}
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
