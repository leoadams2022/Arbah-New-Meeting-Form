import { Label } from "flowbite-react";
import SelectInput from "./SelectInput";

/**
 * A controlled select input component.
 *
 * @param {string} containerClassName - className to apply to the container
 * @param {string|null} label - label to display above the select input
 * @param {object} labelProps - additional props to pass to the underlying Label component
 * @param {boolean} required - whether the select input is required
 * @param {string} selectLabel - label to display next to the select input
 * @param {...object} props - additional props to pass to the underlying SelectInput component
 * @returns {React.ReactElement} the InputSelect component
 */
function InputSelect({
  containerClassName,
  label,
  labelProps = {},
  required,
  selectLabel,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${containerClassName}`}>
      {label && (
        <Label
          {...labelProps}
          className={[required ? "required" : "", labelProps.className || ""]
            .filter(Boolean)
            .join(" ")}
        >
          {label}
        </Label>
      )}
      <SelectInput label={selectLabel || label || ""} {...props} />
    </div>
  );
}

export default InputSelect;
