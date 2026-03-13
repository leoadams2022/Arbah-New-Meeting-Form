import { Button } from "flowbite-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useCopyMarkdown from "../hooks/useCopyMarkdown";
import { FaFileArrowDown } from "react-icons/fa6";
import { BiSolidCopyAlt } from "react-icons/bi";
import { MdOutlineDeleteSweep } from "react-icons/md";
import { useAppDialog } from "../context/AppDialogProvider";
import { IoArrowBack } from "react-icons/io5";

export default function MarkdownViewer({
  markdown,
  filename,
  onBack,
  onDownload,
  onDelete,
}) {
  const { alert } = useAppDialog();

  const copyFunc = useCopyMarkdown();
  const onCopy = async () => {
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
  };
  return (
    <div dir="rtl" className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-evenly items-center">
        <Button
          outline={true}
          color="dark"
          size="sm"
          onClick={onBack}
          className="cursor-pointer rounded-sm "
          title="رجوع"
        >
          <span className="hidden md:inline">رجوع</span>

          <IoArrowBack className="mr-2 h-5 w-5" />
        </Button>

        <h2 className="text-xl font-bold text-center">{filename}</h2>

        <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-0 ">
          <Button
            outline={true}
            // color="light"
            size="sm"
            onClick={onDownload}
            className="cursor-pointer rounded-sm md:rounded-none md:rounded-tr-md md:rounded-br-md"
            title="تحميل"
          >
            <span className="hidden md:inline">تحميل</span>

            <FaFileArrowDown className="mr-2 h-5 w-5" />
          </Button>

          <Button
            outline={true}
            // color="light"
            size="sm"
            onClick={onCopy}
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
            onClick={onDelete}
            className="cursor-pointer rounded-sm md:rounded-none md:rounded-tl-md md:rounded-bl-md"
            title="حذف"
          >
            <span className="hidden md:inline">حذف</span>

            <MdOutlineDeleteSweep className="mr-2 h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="prose prose-lg max-w-none dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
      </div>
    </div>
  );
}
