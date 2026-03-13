import { useEffect, useRef, useState } from "react";
import InputText from "../components/InputText";
// import TextAreaInput from "../components/TextAreaInput";
import CheckboxGroupWithNotes from "../components/CheckboxGroupWithNotes";
import { generateMarkdown } from "../utils/markdownGenerator";
import { saveMeeting } from "../storage/archiveService";
import { useAppDialog } from "../context/AppDialogProvider";
import {
  List,
  ListItem,
  Tooltip,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "flowbite-react";

import Editor, {
  Toolbar,
  BtnRedo,
  BtnUndo,
  BtnClearFormatting,
  BtnStrikeThrough,
  BtnBold,
} from "react-simple-wysiwyg";

import useCopyMarkdown from "../hooks/useCopyMarkdown";

import useTurndown from "../hooks/useTurndownMarkdown";

const DRAFT_STORAGE_KEY = "meeting_form_draft";

const initialFormState = {
  name: "",
  phone: "",
  city: "",
  employees: "",
  transactions: "",
  // accountingSystemName: "",
  notes: "",
  htmlNotes: "",

  roles: {},
  businessFields: {},
  activityStatus: {},
  accountantStatus: {},
  accountingSystemStatus: {},
  result: {},
};

const roleOptions = [
  "مالك",
  "مدير عام",
  "مدير قسم",
  "مدير مالي",
  "محاسب",
  "موظف",
  "غير معروف",
];

const businessFieldOptions = [
  "متجر إلكتروني",
  "تجارة تجزئة او جملة",
  "خدمات لوجستية",
  "ورش تصينع",
  "مشاريع خدمية",
  "مقاولات",
  "مطاعم/كافيهات",
  "صالونات",
  "غير مدرج",
];

const activityStatusOptions = [
  "نشط و لديه مبيعات",
  "نشط ولكن مبيعاته ضعيفة",
  "نشط و لكن لاتوجد مبيعات",
  "لم يبداء بعد",
  "مغلق مؤقتاً",
  "مغلق بشكل نهائي",
];

const accountantOptions = [
  "عنده محاسب داخلي أو شركة",
  "لا يوجد محاسب نهائيًا",
  "يعتمد على محاسب فريلانسر-جزئي",
];

const accountingSystemOptions = [
  "لا يوجد نظام",
  "موجود لكن استخدامه ضعيف",
  "موجود ويستخدم بكفاءة",
];

const resultOptions = [
  "أرسل السجل وطلب مسودة العقد",
  "سيرسل السجل التجاري",
  "طلب عرض او خطة عمل",
  "طلب الباقات والملف التعريفي",
  "يحتاج استشارة الشريك",
  "يحتاج للتفكير بالموضوع",
  "سيتواصل عند الحاجة",
  "سيتواصل عند تحسن المبيعات",
  "سيتواصل عند فتح المشروع",
  "غير مهتم",
  "غير مؤهل",
];

// const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
export default function MeetingForm() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!saved) return initialFormState;

    try {
      return JSON.parse(saved);
    } catch {
      console.warn("Invalid saved draft");
      return initialFormState;
    }
  });
  const [markdown, setMarkdown] = useState("");
  const { alert, confirm } = useAppDialog();
  // Create refs for each title section
  const sectionRefs = useRef({});
  const [showResultModal, setShowResultModal] = useState(false);
  const copyFunc = useCopyMarkdown();
  const { convert } = useTurndown();

  // Function to handle clicking on a title in the second div
  const handleTitleClick = (sectionId) => {
    const targetSection = sectionRefs.current[sectionId];

    if (!targetSection) return;

    // Scroll to the section
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Try to find and focus an input
    const input = targetSection.querySelector(
      "input, textarea, select, button",
    );

    if (
      input &&
      input.type !== "checkbox" &&
      input.type !== "radio" &&
      input.type !== "hidden" &&
      !input.disabled
    ) {
      // Small delay to allow scroll to complete before focusing
      setTimeout(() => {
        input.focus();
      }, 300);
    } else {
      // Add visual feedback to the section
      targetSection.style.outline = "2px solid blue";

      // Remove the animation classes after a delay
      setTimeout(() => {
        targetSection.style.outline = "";
      }, 1000);

      // Optional: Show a tooltip or message
      console.log("No input field found in this section");
    }
  };

  const handleOpenResultModal = () => {
    // validation
    if (!formData.name.trim()) {
      alert({
        title: "الاسم مطلوب",
        message: "يرجى إدخال اسم العميل قبل إنشاء ملف الملاحظات.",
        variant: "red",
        durationMs: 4000,
      });
      return;
    }

    if (!formData.phone.trim()) {
      alert({
        title: "رقم الهاتف مطلوب",
        message: "يرجى إدخال رقم الهاتف قبل إنشاء ملف الملاحظات.",
        variant: "red",
        durationMs: 4000,
      });
      return;
    }

    if (Object.keys(formData.result).length === 0) {
      alert({
        title: "النتيجة مطلوبة",
        message: "يرجى اختيار النتيجة قبل إنشاء ملف الملاحظات.",
        variant: "red",
        durationMs: 4000,
      });
      return;
    }
    // updateField("notes", convert(formData.notes));
    // setFormData((prev) => ({
    //   ...prev,
    //   notes: convert(formData.notes),
    // }));
    console.log("formData.notes:", formData.notes);
    // console.log("convert(formData.notes)  :", convert(formData.notes));
    const { markdown } = generateMarkdown(formData, {
      roleOptions,
      businessFieldOptions,
      activityStatusOptions,
      accountantOptions,
      accountingSystemOptions,
      resultOptions,
    });
    setMarkdown(markdown);
    setShowResultModal(true);
  };

  const handleSaveFile = () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${formData.phone}—${formData.name}—${date}.md`;

    // download file
    const blob = new Blob([markdown], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);

    alert({
      title: "تم تحميل الملف",
      message: `تم تحميل ملف الملاحظات بنجاح! اسم الملف: ${filename}`,
      variant: "green",
      durationMs: 4000,
    });

    // save archive
    saveMeeting({
      id: crypto.randomUUID(),
      filename, // <-- added
      name: formData.name,
      phone: formData.phone,
      date,
      markdown,
      data: formData,
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now(),
    });

    // clear form and localStorage and reset to initial state
    handleReset(false);
  };

  const handleCopyMarkdown = async () => {
    const date = new Date().toISOString().slice(0, 10);
    const filename = `${formData.phone}—${formData.name}—${date}.md`;

    const success = await copyFunc(markdown);
    if (success) {
      alert({
        title: "تم نسخ الملاحظات",
        message: "تم نسخ الملاحظات بنجاح! يمكنك الآن لصقها في أي مكان.",
        variant: "green",
        durationMs: 4000,
      });
    } else {
      alert({
        title: "فشل نسخ الملاحظات",
        message: "حدث خطأ أثناء نسخ الملاحظات. يرجى المحاولة مرة أخرى.",
        variant: "red",
        durationMs: 4000,
      });
    }

    // save archive
    saveMeeting({
      id: crypto.randomUUID(),
      filename, // <-- added
      name: formData.name,
      phone: formData.phone,
      date,
      markdown,
      data: formData,
      // eslint-disable-next-line react-hooks/purity
      timestamp: Date.now(),
    });

    // clear form and localStorage and reset to initial state
    handleReset(false);
  };

  const handleReset = async (con = true) => {
    if (con) {
      const ok = await confirm({
        title: "هل أنت متأكد؟",
        message: "سيتم مسح جميع البيانات المدخلة ولن تتمكن من استعادتها.",
        variant: "red",
        confirmText: "نعم، امسح البيانات",
        cancelText: "لا، احتفظ بالبيانات",
      });
      if (!ok) {
        console.log("User cancelled reset");
        return;
      } else {
        console.log("User confirmed reset");
        if (showResultModal) setShowResultModal(false);
        setFormData(initialFormState);
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } else {
      if (showResultModal) setShowResultModal(false);
      setFormData(initialFormState);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  };
  // autosave whenever formData changes
  useEffect(() => {
    // on load this is saving empty form to storage on load so the saved draft is always empty. To fix this, we can add a check to only save to localStorage if formData is not equal to the initialFormState. This way, we won't overwrite any existing saved draft with an empty form on load.
    if (JSON.stringify(formData) !== JSON.stringify(initialFormState)) {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div dir="rtl" className="mx-auto px-12 xl:h-svh space-y-6 py-6">
      {/* <h1 className="text-pop text-2xl font-bold ">نموذج ملاحظات الاجتماع</h1> */}
      <div className="w-full relative space-y-6 xl:space-x-6 grid grid-cols-1 xl:grid-cols-[1fr_1.1fr] xl:h-[calc(100svh-120px)] ">
        {/* col 1 Notes */}
        <div className="xl:h-[calc(100svh-170px)] block xl:block md:grid grid-cols-[4fr_1fr] gap-4">
          <Editor
            value={formData.htmlNotes}
            onChange={(e) => {
              updateField("htmlNotes", e.target.value);
              updateField("notes", convert(e.target.value));
            }}
            className="w-full h-[calc(100svh-100px)] xl:h-[calc(100svh-170px)]  resize-none focus:text-xl transition-all duration-1000 ease-[linear(0,0.008_1.1%,0.034_2.3%,0.134_4.9%,0.264_7.3%,0.683_14.3%,0.797_16.5%,0.89_18.6%,0.967_20.7%,1.027_22.8%,1.073_25%,1.104_27.3%,1.123_30.6%,1.119_34.3%,1.018_49.5%,0.988_58.6%,0.985_65.2%,1_84.5%,1)]"
            dir="rtl"
          >
            <Toolbar>
              <BtnRedo />
              <BtnUndo />
              <BtnClearFormatting />
              <BtnStrikeThrough />
              <BtnBold />
            </Toolbar>
          </Editor>

          {/* <TextAreaInput
            label="الملاحظات"
            labelProps={{
              className:
                " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
            }}
            value={formData.notes}
            setValue={(v) => updateField("notes", v)}
            className="w-full h-[calc(100svh-100px)] xl:h-[calc(100svh-170px)]  resize-none focus:text-xl transition-all duration-1000 ease-[linear(0,0.008_1.1%,0.034_2.3%,0.134_4.9%,0.264_7.3%,0.683_14.3%,0.797_16.5%,0.89_18.6%,0.967_20.7%,1.027_22.8%,1.073_25%,1.104_27.3%,1.123_30.6%,1.119_34.3%,1.018_49.5%,0.988_58.6%,0.985_65.2%,1_84.5%,1)]"
          /> */}
          {/* col 2 titles container on sm screens */}
          <div className="hidden md:block xl:hidden ">
            <List ordered dir="rtl">
              {[
                ["name", "الاسم", true],
                ["phone", "الموبايل", true],
                ["roles", "الأدوار", false],
                ["activityStatus", "وضع النشاط", false],
                ["businessFields", "مجال العمل", false],
                ["accountantStatus", "المحاسب", false],
                ["accountingSystemStatus", "النظام المحاسبي", false],
                ["transactions", "متوسط عدد الحركات", false],
                ["employees", "عدد الموظفين", false],
                ["city", "المدينة", false],
                // ["accountingSystemName", "اسم النظام المحاسبي", false],
                ["result", "نتيجة الاحتماع", true],
              ].map((section) => {
                //
                let value = formData[section[0]];
                if (typeof value === "object" && value !== null) {
                  value = Object.keys(value)
                    .filter((key) => value[key].checked)
                    .join(", ");
                } else if (typeof value === "string") {
                  value = value.trim();
                } else {
                  value = "انتقل إلى القسم";
                }

                if (!value) {
                  value = "انتقل إلى القسم";
                }
                return (
                  <Tooltip
                    content={value}
                    key={section[0]}
                    className="bg-pop text-pop"
                    placement="right"
                  >
                    <ListItem
                      onClick={() => handleTitleClick(section[0])}
                      dir="rtl"
                      className={`cursor-pointer dark:hover:bg-gray-100 dark:hover:text-slate-900 hover:bg-slate-900  hover:text-gray-100 rounded-md px-2 py-1 ${section[2] && "after:content-['*'] after:mr-1 after:text-red-500"}`}
                    >
                      {section[1] || section[0]}
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
          </div>
        </div>

        {/* col 2 inputs*/}
        <div className="grid grid-cols-1 xl:grid-cols-[4.5fr_1fr] xl:overflow-y-auto xl:h-[calc(100svh-135px)] ">
          {/* col 1 inputs, container   */}
          <div className="w-full space-y-6 px-2 xl:overflow-y-auto xl:h-[calc(100%-50px)]">
            {/* row 1  Name, Phone*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              {/* Name */}
              <div
                // className="md:w-1/2"
                ref={(el) => (sectionRefs.current["name"] = el)}
              >
                <InputText
                  label="الاسم"
                  labelProps={{
                    className:
                      " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
                  }}
                  required
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                />
              </div>

              {/* Phone */}
              <div
                // className="md:w-1/2"
                ref={(el) => (sectionRefs.current["phone"] = el)}
              >
                <InputText
                  label="الموبايل"
                  required
                  labelProps={{
                    className:
                      " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
                  }}
                  value={formData.phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/[^\d\s]/g, "");
                    updateField("phone", val);
                  }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* row 2  Roles, Activity Status, Business Field*/}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ">
              {/* Roles */}
              <div ref={(el) => (sectionRefs.current["roles"] = el)}>
                <CheckboxGroupWithNotes
                  title="الأدوار"
                  options={roleOptions}
                  values={formData.roles}
                  onChange={(v) => updateField("roles", v)}
                  placeholder="ملاحظة / اسم الشخص"
                />
              </div>

              {/* Activity Status */}
              <div ref={(el) => (sectionRefs.current["activityStatus"] = el)}>
                <CheckboxGroupWithNotes
                  title="وضع النشاط"
                  options={activityStatusOptions}
                  values={formData.activityStatus}
                  onChange={(v) => updateField("activityStatus", v)}
                  placeholder="ملاحظة / اسم النشاط او المشروع"
                />
              </div>

              {/* Business Field */}
              <div ref={(el) => (sectionRefs.current["businessFields"] = el)}>
                <CheckboxGroupWithNotes
                  title="مجال العمل"
                  options={businessFieldOptions}
                  values={formData.businessFields}
                  onChange={(v) => updateField("businessFields", v)}
                  placeholder="ملاحظة / اسم النشاط او المشروع"
                />
              </div>
            </div>

            {/* row 3  Accountant, Accounting System*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Accountant */}
              <div ref={(el) => (sectionRefs.current["accountantStatus"] = el)}>
                <CheckboxGroupWithNotes
                  title="المحاسب"
                  options={accountantOptions}
                  values={formData.accountantStatus}
                  onChange={(v) => updateField("accountantStatus", v)}
                  placeholder="ملاحظة / اسم المحاسب او الشركة"
                />
              </div>

              {/* Accounting System */}
              <div
                ref={(el) =>
                  (sectionRefs.current["accountingSystemStatus"] = el)
                }
              >
                <CheckboxGroupWithNotes
                  title="النظام المحاسبي"
                  options={accountingSystemOptions}
                  values={formData.accountingSystemStatus}
                  onChange={(v) => updateField("accountingSystemStatus", v)}
                  placeholder="ملاحظة / اسم النظام "
                />
              </div>
            </div>

            {/* row 4  Transactions, Employees, City, Result*/}
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] xl:grid-cols-2 gap-4">
              {/* col 1  Transactions, Employees, City */}
              <div className="flex flex-col gap-4 w-full">
                {/* Transactions */}
                <div ref={(el) => (sectionRefs.current["transactions"] = el)}>
                  <InputText
                    label="متوسط عدد الحركات"
                    labelProps={{
                      className:
                        " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
                    }}
                    value={formData.transactions}
                    onChange={(e) =>
                      updateField("transactions", e.target.value)
                    }
                  />
                </div>

                {/* Employees */}
                <div ref={(el) => (sectionRefs.current["employees"] = el)}>
                  <InputText
                    label="عدد الموظفين"
                    labelProps={{
                      className:
                        " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
                    }}
                    value={formData.employees}
                    onChange={(e) => updateField("employees", e.target.value)}
                  />
                </div>

                {/* City */}
                <div ref={(el) => (sectionRefs.current["city"] = el)}>
                  <InputText
                    label="المدينة"
                    labelProps={{
                      className:
                        " text-lg font-semibold text-slate-800 dark:text-slate-300 ",
                    }}
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </div>
              </div>

              {/* col 2 Result */}
              <div ref={(el) => (sectionRefs.current["result"] = el)}>
                <CheckboxGroupWithNotes
                  title="نتيحة الاجتماع"
                  options={resultOptions}
                  values={formData.result}
                  onChange={(v) => updateField("result", v)}
                  placeholder="ملاحظة / تفاصيل إضافية"
                  required={true}
                />
              </div>
            </div>
          </div>
          {/* col 2 titles container on xl screens */}
          <div className="hidden xl:block">
            <List ordered dir="rtl">
              {[
                ["name", "الاسم", true],
                ["phone", "الموبايل", true],
                ["roles", "الأدوار", false],
                ["activityStatus", "وضع النشاط", false],
                ["businessFields", "مجال العمل", false],
                ["accountantStatus", "المحاسب", false],
                ["accountingSystemStatus", "النظام المحاسبي", false],
                ["transactions", "متوسط عدد الحركات", false],
                ["employees", "عدد الموظفين", false],
                ["city", "المدينة", false],
                // ["accountingSystemName", "اسم النظام المحاسبي", false],
                ["result", "نتيجة الاحتماع", true],
              ].map((section) => {
                //
                let value = formData[section[0]];
                if (typeof value === "object" && value !== null) {
                  value = Object.keys(value)
                    .filter((key) => value[key].checked)
                    .join(", ");
                } else if (typeof value === "string") {
                  value = value.trim();
                } else {
                  value = "انتقل إلى القسم";
                }

                if (!value) {
                  value = "انتقل إلى القسم";
                }
                return (
                  <Tooltip
                    content={value}
                    key={section[0]}
                    className="bg-pop text-pop"
                    placement="right"
                  >
                    <ListItem
                      onClick={() => handleTitleClick(section[0])}
                      dir="rtl"
                      className={`cursor-pointer dark:hover:bg-gray-100 dark:hover:text-slate-900 hover:bg-slate-900  hover:text-gray-100 rounded-md px-2 py-1 ${section[2] && "after:content-['*'] after:mr-1 after:text-red-500"}`}
                    >
                      {section[1] || section[0]}
                    </ListItem>
                  </Tooltip>
                );
              })}
            </List>
          </div>
        </div>
      </div>
      {/* Buttons  */}
      <div className="flex justify-end gap-8  items-end box-border ">
        <Button
          outline={true}
          color={"green"}
          onClick={handleOpenResultModal}
          className="text-lg font-semibold cursor-pointer"
        >
          إنشاء ملف الملاحظات
        </Button>
        <Button
          outline={true}
          color={"red"}
          onClick={() => handleReset(true)}
          className="text-lg font-semibold cursor-pointer"
        >
          مسح البيانات
        </Button>
      </div>
      {/* results modal */}
      <Modal
        show={showResultModal}
        // onClose={() =>
        //   confirmState.closeOnBackdrop ? resolveConfirm(false) : undefined
        // }
        // dismissible={confirmState.closeOnBackdrop}
        dir="rtl"
      >
        <ModalHeader className="text-pop grid grid-cols-[auto_20px] items-center ">
          {/* {confirmState.title}
           */}
          الملاحظات النهائية
        </ModalHeader>
        <ModalBody>
          <div className="space-y-2 text-sm text">
            بامكانك حفظ الملاحظات ك ملف بصيغة markdown او يمكنك نسخها لاستخدامها
            في أي مكان اخر.
          </div>
        </ModalBody>
        <ModalFooter className="justify-end gap-2">
          <Button
            className="text-lg font-semibold cursor-pointer"
            onClick={handleCopyMarkdown}
          >
            نسخ الملاحظات
          </Button>

          <Button
            className="text-lg font-semibold cursor-pointer"
            onClick={handleSaveFile}
          >
            تحميل ملف الملاحظات
          </Button>

          <Button
            className="text-lg font-semibold cursor-pointer"
            color="alternative"
            onClick={() => setShowResultModal(false)}
          >
            الغاء
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
