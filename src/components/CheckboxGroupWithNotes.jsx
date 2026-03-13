import { Label } from "flowbite-react";
import InputText from "./InputText";

export default function CheckboxGroupWithNotes({
  title,
  options,
  values,
  onChange,
  placeholder = "ملاحظة / اسم الشخص",
  required = false,
}) {
  const toggleCheckbox = (option) => {
    onChange({
      ...values,
      [option]: {
        ...values[option],
        checked: !values[option]?.checked,
      },
    });
  };

  const updateNote = (option, note) => {
    onChange({
      ...values,
      [option]: {
        ...values[option],
        note,
      },
    });
  };

  return (
    <div className="space-y-3">
      <h3
        className={`text-lg font-semibold ${required ? "after:content-['*'] after:mr-1 after:text-red-500" : ""}`}
      >
        {title}
      </h3>

      <div className="space-y-1">
        {options.map((option) => {
          const optionState = values[option] || {
            checked: false,
            note: "",
          };

          return (
            <div key={option} className="flex flex-col gap-1">
              <div className="flex  items-center gap-1">
                <input
                  type="checkbox"
                  checked={optionState.checked}
                  onChange={() => toggleCheckbox(option)}
                  className="w-4 h-4"
                  id={`checkbox-${option}`}
                  name={`checkbox-${option}`}
                />

                {/* <span className="min-w-50">{option}</span> */}
                <Label
                  htmlFor={`checkbox-${option}`}
                  className={`text-pop cursor-pointer `}
                >
                  {option}
                </Label>
              </div>

              {/* {!showNotes && (
                <Badge
                  onClick={() => setShowNotes(!showNotes)}
                  icon={RiStickyNoteAddLine}
                />
              )} */}

              {optionState.checked && (
                <div className="flex-1">
                  <InputText
                    // label={option}
                    // labelProps={{
                    //   htmlFor: `checkbox-${option}`,
                    //   className: "w-fit text-pop cursor-pointer",
                    // }}
                    placeholder={placeholder}
                    value={optionState.note}
                    onChange={(e) => updateNote(option, e.target.value)}
                    className="bg"
                    // addon={
                    //   <Label
                    //     htmlFor={`checkbox-${option}`}
                    //     className="w-fit text-pop cursor-pointer"
                    //   >
                    //     {option}
                    //   </Label>
                    // }
                    dir="rtl"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
