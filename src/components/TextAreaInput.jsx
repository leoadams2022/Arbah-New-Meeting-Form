import { Label, Textarea } from "flowbite-react";
import React from "react";

/**
 * A controlled or uncontrolled textarea component.
 *
 * @param {string|null} value - the value to set the textarea to (undefined means uncontrolled)
 * @param {(next: string) => void} setValue - function to call when the value changes
 * @param {(next: string) => boolean} validationfunction - function to validate the value
 * @param {(e: React.ChangeEvent<HTMLTextAreaElement>) => void} onChange - function to call when the textarea changes
 * @param {string} label - the label to display
 * @param {string} containerClassName - the class name to apply to the container
 * @param {object} labelProps - additional props to pass to the underlying Label component
 * @param {boolean} required - whether the textarea is required
 * @param {...object} props - additional props to pass to the underlying Textarea component
 * @returns {React.ReactElement} the TextAreaInput component
 */
export default function TextAreaInput({
  value = null,
  setValue = null,
  validationfunction = () => true,
  onChange,
  label,
  containerClassName = "",
  labelProps = {},
  required,
  ...props
}) {
  const isControlled = value !== null;

  const [val, setValLocal] = React.useState(value ?? "");

  const setVal = React.useCallback(
    (nextRaw) => {
      const next = String(nextRaw);
      if (!validationfunction(next)) return;

      setValLocal(next);
      if (isControlled && typeof setValue === "function") setValue(next);
    },
    [isControlled, setValue, validationfunction],
  );
  const labProps = {
    ...labelProps,
    className: [required ? "required" : "", labelProps.className || ""]
      .filter(Boolean)
      .join(" "),
  };

  // If parent changes value, sync local state
  React.useEffect(() => {
    if (isControlled) {
      if (!validationfunction(value)) return;
      setValLocal(value ?? "");
    }
  }, [isControlled, validationfunction, value]);

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <Label {...labProps}>{label}</Label>
      <Textarea
        value={val}
        onChange={(e) => {
          setVal(e.target.value);
          onChange?.(e);
        }}
        {...props}
      />
    </div>
  );
}
