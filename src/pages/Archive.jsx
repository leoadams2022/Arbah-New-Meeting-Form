import { useMemo, useState } from "react";
import { getArchive, deleteMeeting } from "../storage/archiveService";
import SelectInput from "../components/SelectInput";
import InputText from "../components/InputText";
import MarkdownViewer from "../components/MarkdownViewer";
import { Button, Dropdown, DropdownItem } from "flowbite-react";
import { LuScanText } from "react-icons/lu";
import { FaFileArrowDown } from "react-icons/fa6";
import { BiSolidCopyAlt } from "react-icons/bi";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useAppDialog } from "../context/AppDialogProvider";

const sortOptions = [
  { value: "desc", label: "الأحدث أولاً" },
  { value: "asc", label: "الأقدم أولاً" },
];

export default function Archive() {
  const [meetings, setMeetings] = useState(getArchive());
  const [searchPhone, setSearchPhone] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const { alert, confirm } = useAppDialog();
  const filteredMeetings = useMemo(() => {
    let result = meetings;

    if (searchPhone) {
      result = result.filter((m) => m.phone.includes(searchPhone));
    }

    result = [...result].sort((a, b) => {
      if (sortOrder === "desc") {
        return b.timestamp - a.timestamp;
      }
      return a.timestamp - b.timestamp;
    });

    return result;
  }, [meetings, searchPhone, sortOrder]);

  const redownload = (meeting) => {
    const blob = new Blob([meeting.markdown], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = meeting.filename;
    a.click();

    URL.revokeObjectURL(url);
    alert({
      title: "تم تحميل الملف",
      message: `تم تحميل ملف الملاحظات بنجاح! اسم الملف: ${meeting.filename}`,
      variant: "green",
      durationMs: 4000,
    });
  };

  const handleDelete = async (id, closeOpenFile = false) => {
    const ok = await confirm({
      title: "هل أنت متأكد أنك تريد حذف هذا الاجتماع؟",
      message:
        "سيتم حذف جميع البيانات المتعلقة بهذا الاجتماع ولن تتمكن من استعادتها.",
      variant: "red",
      confirmText: "نعم، امسح البيانات",
      cancelText: "لا، احتفظ بالبيانات",
    });
    if (!ok) {
      console.log("User cancelled reset");
      return;
    }
    deleteMeeting(id);
    setMeetings(getArchive());
    if (closeOpenFile) {
      setSelectedMeeting(null);
    }
  };

  if (selectedMeeting) {
    return (
      <MarkdownViewer
        markdown={selectedMeeting.markdown}
        filename={selectedMeeting.filename}
        onBack={() => setSelectedMeeting(null)}
        onDownload={() => redownload(selectedMeeting)}
        onDelete={() => {
          handleDelete(selectedMeeting.id, true);
        }}
      />
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 h-svh" dir="rtl">
      <h1 className="text-2xl font-bold text-center">أرشيف الاجتماعات</h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-evenly items-center gap-4 z-20 sticky">
        <InputText
          placeholder="البحث برقم الهاتف"
          value={searchPhone}
          onChange={(e) => setSearchPhone(e.target.value)}
          containerClassName="w-64"
        />

        <SelectInput
          label="ترتيب حسب التاريخ"
          value={sortOrder}
          setValue={(v) => setSortOrder(v)}
          options={sortOptions}
          DropdownClassName="w-48"
        />
      </div>

      {/* Table */}
      <div className="overflow-auto h-[calc(100%-130px)]">
        <table className="w-full border border-t-0 border-black dark:border-white text-sm">
          <thead className="bg-pop text-pop shadow-[inset_0_0_0_1px_#000] dark:shadow-[inset_0_0_0_1px_#fff] sticky top-0 z-10">
            <tr>
              <th className="p-3 ">الاسم</th>
              <th className="p-3 ">الهاتف</th>
              <th className="p-3 ">التاريخ</th>
              <th className="p-3 ">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filteredMeetings.map((meeting) => (
              <tr
                key={meeting.id}
                className="border-t text-center hover-bg-pop"
              >
                <td className="p-3">{meeting.name}</td>
                <td className="p-3">{meeting.phone}</td>
                <td className="p-3">{meeting.date}</td>

                <td className="p-2 flex justify-center gap-2 ">
                  <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-0 ">
                    <Button
                      outline={true}
                      // color="light"
                      size="sm"
                      onClick={() => setSelectedMeeting(meeting)}
                      className="cursor-pointer rounded-sm md:rounded-none md:rounded-tr-md md:rounded-br-md"
                      title="عرض"
                    >
                      <span className="hidden md:inline">عرض</span>

                      <LuScanText className="mr-2 h-5 w-5" />
                    </Button>

                    <Button
                      outline={true}
                      // color="light"
                      size="sm"
                      onClick={() => redownload(meeting)}
                      className="cursor-pointer rounded-sm md:rounded-none"
                      title="تحميل"
                    >
                      <span className="hidden md:inline">تحميل</span>

                      <FaFileArrowDown className="mr-2 h-5 w-5" />
                    </Button>

                    <Button
                      outline={true}
                      // color="light"
                      size="sm"
                      onClick={() => redownload(meeting)}
                      className="cursor-pointer rounded-sm md:rounded-none"
                      title="نسخ"
                    >
                      <span className="hidden md:inline">نسخ</span>

                      <BiSolidCopyAlt className="mr-2 h-5 w-5" />
                    </Button>

                    <Button
                      outline={true}
                      color={"red"}
                      size="sm"
                      onClick={() => handleDelete(meeting.id)}
                      className="cursor-pointer rounded-sm md:rounded-none md:rounded-tl-md md:rounded-bl-md"
                      title="حذف"
                    >
                      <span className="hidden md:inline">حذف</span>

                      <MdOutlineDeleteSweep className="mr-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className="sm:hidden">
                    <Dropdown label="⠇" inline size="s">
                      <DropdownItem>
                        <Button
                          outline={true}
                          // color="light"
                          size="sm"
                          onClick={() => setSelectedMeeting(meeting)}
                          className="cursor-pointer rounded-sm md:rounded-none md:rounded-tr-md md:rounded-br-md"
                          title="عرض"
                        >
                          <span className="hidden md:inline">عرض</span>

                          <LuScanText className=" size-4" />
                        </Button>
                      </DropdownItem>
                      <DropdownItem>
                        <Button
                          outline={true}
                          // color="light"
                          size="sm"
                          onClick={() => redownload(meeting)}
                          className="cursor-pointer rounded-sm md:rounded-none"
                          title="تحميل"
                        >
                          <span className="hidden md:inline">تحميل</span>

                          <FaFileArrowDown className=" size-4" />
                        </Button>
                      </DropdownItem>

                      <DropdownItem>
                        <Button
                          outline={true}
                          // color="light"
                          size="sm"
                          onClick={() => redownload(meeting)}
                          className="cursor-pointer rounded-sm md:rounded-none"
                          title="نسخ"
                        >
                          <span className="hidden md:inline">نسخ</span>

                          <BiSolidCopyAlt className=" size-4" />
                        </Button>
                      </DropdownItem>

                      <DropdownItem>
                        <Button
                          outline={true}
                          color={"red"}
                          size="sm"
                          onClick={() => handleDelete(meeting.id)}
                          className="cursor-pointer rounded-sm md:rounded-none md:rounded-tl-md md:rounded-bl-md"
                          title="حذف"
                        >
                          <span className="hidden md:inline">حذف</span>

                          <MdOutlineDeleteSweep className=" size-4" />
                        </Button>
                      </DropdownItem>
                    </Dropdown>
                  </div>
                </td>
              </tr>
            ))}

            {filteredMeetings.length === 0 && (
              <tr>
                <td colSpan="4" className="p-4 text-center">
                  لا توجد نتائج
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
