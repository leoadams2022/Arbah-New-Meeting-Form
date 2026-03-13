import { FloatingLabel } from "flowbite-react";
import React from "react";

/**
 * A controlled or uncontrolled input text component.
 *
 * @param {string} [variant="standard"] - the variant to use for the floating label
 * @param {string} [label="Label"] - the label to display
 * @param {string|undefined} [value] - the value to set the input to (undefined means uncontrolled)
 * @param {(next: string) => void} [onValueChange] - function to call when the value changes
 * @param {(next: string) => boolean} [validationfunction=() => true] - function to validate the value
 * @param {(e: React.ChangeEvent<HTMLInputElement>) => void} [onChange] - function to call when the input changes
 * @param {...object} [props] - additional props to pass to the underlying FloatingLabel component
 * @returns {React.ReactElement} the TextInput component
 */
export default function TextInput({
  variant = "standard",
  label = "Label",
  value, // undefined => uncontrolled, defined => controlled
  onValueChange,
  validationfunction = () => true,
  onChange,
  ...props
}) {
  const isControlled = value !== undefined;

  const [internal, setInternal] = React.useState(value ?? "");
  const text = isControlled ? (value ?? "") : internal;

  const isValid = React.useMemo(
    () => validationfunction(text),
    [text, validationfunction],
  );

  // keep internal in sync if parent switches or updates value
  React.useEffect(() => {
    if (isControlled) setInternal(value ?? "");
  }, [isControlled, value]);

  return (
    <FloatingLabel
      variant={variant}
      label={label}
      value={text}
      onChange={(e) => {
        const next = e.target.value ?? "";

        if (!isControlled) setInternal(next);
        onValueChange?.(next);

        onChange?.(e);
      }}
      isValid={isValid}
      {...props}
    />
  );
}

TextInput.displayName = "TextInput";
