import * as React from "react";
import { cn } from "~/lib/utils";

// Context to share state between FormField components
interface FormFieldContextValue {
  error?: string;
  id: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null);

function useFormFieldContext() {
  const context = React.useContext(FormFieldContext);
  if (!context) {
    throw new Error("FormField components must be used within a FormField");
  }
  return context;
}

// Main FormField wrapper
interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: string;
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, children, error, ...props }, ref) => {
    const id = React.useId();

    return (
      <FormFieldContext.Provider value={{ error, id }}>
        <div ref={ref} className={cn("group flex flex-col", className)} {...props}>
          {children}
        </div>
      </FormFieldContext.Provider>
    );
  },
);
FormField.displayName = "FormField";

// FormField container with border and background styling
const FormFieldContainer = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { error } = useFormFieldContext();

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-1 overflow-hidden rounded-lg bg-gray-50/70 p-1.5 transition-colors duration-200",
          // Default border - transparent
          "border",
          // Hover state
          "hover:bg-gray-100/70",
          // Focus state (when any input inside has focus)
          "focus-within:border-blue-500 focus-within:bg-gray-50/70",
          // Error state
          error && "border-red-500/70",
          // No error - subtle border by default
          !error && "border-alpha/5",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
FormFieldContainer.displayName = "FormFieldContainer";

// Label component
interface FormFieldLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormFieldLabel = React.forwardRef<HTMLLabelElement, FormFieldLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    const { id } = useFormFieldContext();

    return (
      <label
        ref={ref}
        htmlFor={id}
        className={cn(
          "inline-flex items-center gap-0.5 px-1 py-0.5 text-xs font-medium text-gray-950 transition-opacity duration-200",
          // On focus-within, label becomes muted
          "group-focus-within:opacity-40",
          className,
        )}
        {...props}
      >
        {children}
        {required && (
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  },
);
FormFieldLabel.displayName = "FormFieldLabel";

// Control wrapper for the input element
const FormFieldControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex items-center px-1", className)} {...props}>
        {children}
      </div>
    );
  },
);
FormFieldControl.displayName = "FormFieldControl";

// Error message component
const FormFieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error } = useFormFieldContext();

  if (!error && !children) return null;

  return (
    <p ref={ref} className={cn("px-0.5 text-sm text-red-500", className)} role="alert" {...props}>
      {error || children}
    </p>
  );
});
FormFieldError.displayName = "FormFieldError";

// Styled input for use inside FormFieldControl
const FormFieldInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, id: propId, ...props }, ref) => {
  const context = React.useContext(FormFieldContext);
  const id = propId ?? context?.id;

  return (
    <input
      ref={ref}
      id={id}
      className={cn(
        "w-full flex-1 bg-transparent text-sm font-medium text-gray-950 placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
FormFieldInput.displayName = "FormFieldInput";

// Styled textarea for use inside FormFieldControl
const FormFieldTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, id: propId, ...props }, ref) => {
  const context = React.useContext(FormFieldContext);
  const id = propId ?? context?.id;

  return (
    <textarea
      ref={ref}
      id={id}
      className={cn(
        "w-full flex-1 resize-none bg-transparent text-sm font-medium text-gray-950 placeholder:opacity-40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
FormFieldTextarea.displayName = "FormFieldTextarea";

export {
  FormField,
  FormFieldContainer,
  FormFieldLabel,
  FormFieldControl,
  FormFieldError,
  FormFieldInput,
  FormFieldTextarea,
};
