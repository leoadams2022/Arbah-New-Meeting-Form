const ARCHIVE_KEY = "meeting_notes_archive";

export function getArchive() {
  return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
}

export function saveMeeting(entry) {
  const archive = getArchive();
  archive.push(entry);

  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}

export function deleteMeeting(id) {
  const archive = getArchive().filter((m) => m.id !== id);

  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
}
