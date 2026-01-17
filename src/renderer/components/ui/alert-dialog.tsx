"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { buttonVariants } from "./button";

export const AlertDialog = ({
  title,
  description,
  trigger,
  action,
}: {
  title: string;
  description: string;
  trigger: React.ReactNode;
  action: () => void;
}) => {
  return (
    <AlertDialogPrimitive.Root>
      <AlertDialogPrimitive.Trigger asChild>
        {trigger}
      </AlertDialogPrimitive.Trigger>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50" />
        <AlertDialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed top-8 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-xl bg-gray-50 duration-200 focus-within:outline-none">
          <div className="flex flex-col gap-4 p-4">
            <AlertDialogPrimitive.Title className="text-lg font-semibold">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="text-gray-500">
              {description}
            </AlertDialogPrimitive.Description>
          </div>
          <div className="border-alpha/5 grid grid-cols-2 gap-4 border-t px-4 py-6">
            <AlertDialogPrimitive.Cancel
              className={buttonVariants({ size: "lg", variant: "subtle" })}
            >
              Cancel
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={action}
              className={buttonVariants({ size: "lg", variant: "red-subtle" })}
            >
              Confirm
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
};
