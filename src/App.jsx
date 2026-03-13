import React, { useState } from "react";
import ThemeToggleButton from "./components/ThemeToggleButton";
import MeetingForm from "./pages/MeetingForm";
import Archive from "./pages/Archive";
import { GiArchiveResearch } from "react-icons/gi";
import { MdNoteAdd } from "react-icons/md";

export default function App() {
  const [page, setPage] = useState(localStorage.getItem("lastPage") || "form");
  const goToPage = (p) => {
    setPage(p);
    localStorage.setItem("lastPage", p);
  };

  return (
    <div className="min-h-svh bg text">
      <div className="fixed top-4 left-2 flex flex-col justify-center items-center gap-4">
        <ThemeToggleButton />
        <div className="flex flex-col justify-center items-center gap-4">
          {page !== "archive" && (
            <button
              className=" cursor-pointer "
              onClick={() => goToPage("archive")}
            >
              <GiArchiveResearch className="size-6" />
            </button>
          )}
          {page !== "form" && (
            <button
              className=" cursor-pointer"
              onClick={() => goToPage("form")}
            >
              <MdNoteAdd className="size-6" />
            </button>
          )}
        </div>
      </div>

      {page === "form" && <MeetingForm />}
      {page === "archive" && <Archive />}
    </div>
  );
}
