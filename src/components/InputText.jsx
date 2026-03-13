import { Label, TextInput } from "flowbite-react";

/**
 * A controlled or uncontrolled input text component.
 *
 * @param {string} containerClassName - className to apply to the container
 * @param {string} label - the label to display
 * @param {object} labelProps - additional props to pass to the underlying Label component
 * @param {boolean} required - whether the input is required
 * @param {...object} props - additional props to pass to the underlying TextInput component
 * @returns {React.ReactElement} the TextInput component
 */
function InputText({
  containerClassName,
  label,
  labelProps = {},
  required,
  ...props
}) {
  const labProps = {
    ...labelProps,
    className: [required ? "required " : "", labelProps.className || ""]
      .filter(Boolean)
      .join(" "),
  };

  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      <Label {...labProps}>{label}</Label>
      <TextInput {...props} />
    </div>
  );
}

export default InputText;
