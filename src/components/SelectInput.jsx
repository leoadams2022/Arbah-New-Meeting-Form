import React from "react";
import { Button, Dropdown, DropdownItem } from "flowbite-react";

/**
 * SelectInput
 * - Keeps internal state (uncontrolled by default)
 * - If `value` is provided (non-null/undefined), it becomes controlled (display follows `value`)
 * - Calls parent `setValue` ONLY when user/logic changes internal value via `safeSetVal`
 *
 * Notes:
 * - Normalizes option values to strings for stable comparison and hidden input submission
 * - Prevents loops by:
 *   1) NOT propagating via useEffect
 *   2) Avoiding no-op updates (won't set same value again)
 */

/**
 * A controlled or uncontrolled select input component.
 *
 * @param {string|null} value - the value to set the input to (undefined means uncontrolled)
 * @param {(nextRaw: string|number|boolean) => void} setValue - function to call when the value changes
 * @param {string} label - the label to display
 * @param {Array<{value: string|number|boolean, label: string}>} options - options to show in the dropdown
 * @param {string} [DropdownClassName] - className to apply to the dropdown
 * @param {boolean} [showClearOption=false] - show option to clear the input
 * @param {string} [DropdownItemClassName] - className to apply to each dropdown item
 * @param {string} [id] - id to use for the hidden input (if no `name` is provided)
 * @param {string} [name] - name to use for the hidden input (if no `id` is provided)
 * @param {(nextRaw: string|number|boolean) => boolean} [validationfunction=() => true] - function to validate values before setting them
 * @param {boolean} [allowClear=true] - allow clearing the value even if it would fail validation
 */
export default function SelectInput({
  value = null,
  setValue = null,
  label = "Label",
  options = [],
  DropdownClassName = "",
  showClearOption = false,
  DropdownItemClassName = "",
  id,
  name = "",
  validationfunction = () => true,
  allowClear = true,
}) {
  // Normalize values for comparisons (prevents "1" vs 1 mismatches)
  const norm = React.useCallback(
    (v) => (v === null || v === undefined ? "" : String(v)),
    [],
  );

  const hasExternalValue = value !== null && value !== undefined;
  const isControlled = hasExternalValue; // controlled whenever `value` is provided

  // Internal state is used when uncontrolled
  const [internalVal, setInternalVal] = React.useState("");

  // The actual value used for display/selection/hidden input
  const currentVal = isControlled ? norm(value) : internalVal;

  // Selected option (safe)
  const selected = React.useMemo(() => {
    const n = currentVal;
    return options.find((o) => norm(o?.value) === n);
  }, [options, norm, currentVal]);

  // Update helper: updates internal state (if uncontrolled) and calls parent setter
  // ONLY when the value actually changes.
  const commitValue = React.useCallback(
    (nextNorm) => {
      // prevent pointless repeats (important for avoiding loops)
      if (nextNorm === currentVal) return;

      if (!isControlled) setInternalVal(nextNorm);
      if (typeof setValue === "function") setValue(nextNorm);
    },
    [currentVal, isControlled, setValue],
  );

  const safeSetVal = React.useCallback(
    (nextRaw) => {
      const next = norm(nextRaw);

      // Always allow clearing if requested
      if (next === "" && allowClear) {
        commitValue("");
        return;
      }

      if (validationfunction(nextRaw)) {
        commitValue(next);
        return;
      }

      console.error(
        `value ${String(nextRaw)} is not valid, the first option will be set if any`,
      );

      // Fallback to first option if present, else clear
      if (options?.[0] && "value" in options[0]) {
        commitValue(norm(options[0].value));
      } else {
        commitValue("");
      }
    },
    [allowClear, commitValue, norm, options, validationfunction],
  );

  /**
   * Reconcile external `value` with options (and validate) when controlled.
   * - If incoming value not found in options, fallback to first option.
   * - This may call parent `setValue` (only if it actually changes).
   */
  React.useEffect(() => {
    if (!isControlled) return;
    if (!options?.length) return;

    const incoming = norm(value);
    let inOptions = options.some((o) => norm(o?.value) === incoming);
    if (incoming === "" && allowClear) inOptions = true;

    if (inOptions) {
      // Ensure validity rules are applied (and allow fallback if invalid)
      safeSetVal(value);
    } else {
      console.error(
        `value ${String(value)} is not in the options, the first option will be set`,
      );
      safeSetVal(options[0].value);
    }
    // safeSetVal includes everything it uses and is stable enough here.
  }, [isControlled, value, options, norm, allowClear, safeSetVal]);

  /**
   * Optional: when uncontrolled, if options change and current internal value
   * is no longer present, fall back to first option.
   */
  React.useEffect(() => {
    if (isControlled) return;
    if (!options?.length) return;

    if (internalVal === "") return; // allow empty as-is

    const stillExists = options.some((o) => norm(o?.value) === internalVal);
    if (!stillExists) {
      // Set to first option (goes through normal commit path)
      commitValue(norm(options[0].value));
    }
  }, [isControlled, options, norm, internalVal, commitValue]);

  const hiddenName = name || id || undefined;
  const hiddenId = id || undefined;

  // Nothing to render if no options
  if (!options?.length) return null;

  return (
    <div>
      {/* Hidden input for HTML form submission */}
      {hiddenName ? (
        <input
          type="hidden"
          id={hiddenId || ""}
          name={hiddenName || ""}
          value={currentVal}
        />
      ) : null}

      <Dropdown
        label={""}
        renderTrigger={() => (
          <Button
            color="alternative"
            type="button"
            aria-haspopup="listbox"
            aria-expanded="false"
            className="w-full text-left   "
            onKeyDown={(e) => {
              if (e.key === "Delete" || e.key === "Backspace") {
                safeSetVal("");
              }
            }}
          >
            <span className="line-clamp-1 whitespace-nowrap overflow-hidden">
              {selected ? selected.label : label}
            </span>
          </Button>
        )}
        className={DropdownClassName}
      >
        <div className="max-h-60 overflow-y-auto">
          {showClearOption && (
            <DropdownItem
              className={DropdownItemClassName}
              onClick={() => safeSetVal("")}
            >
              Clear
            </DropdownItem>
          )}

          {options.map((option) => {
            const optionValueNorm = norm(option.value);
            const isSelected = optionValueNorm === currentVal;

            return (
              <DropdownItem
                key={optionValueNorm} // stable even for numeric/bool values
                onClick={() => safeSetVal(option.value)}
                selected={isSelected}
                className={`text-start line-clamp-1 whitespace-nowrap overflow-hidden ${DropdownItemClassName}`}
              >
                {option.label}
              </DropdownItem>
            );
          })}
        </div>
      </Dropdown>
    </div>
  );
}
