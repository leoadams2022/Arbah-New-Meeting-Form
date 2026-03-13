export default function CheckboxGroup({
  title,
  options,
  selectedValues,
  onChange,
}) {
  const toggleValue = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-lg">{title}</h3>

      <div className="grid gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedValues.includes(option)}
              onChange={() => toggleValue(option)}
              className="w-4 h-4"
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
