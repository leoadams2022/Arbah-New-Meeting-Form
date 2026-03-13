import { useCallback } from "react";

function useCopyMarkdown() {
  const copyMarkdown = useCallback(async (markdown) => {
    if (!markdown) {
      console.error("No markdown text to copy");
      return false;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      console.log("Markdown copied to clipboard successfully!");
      return true;
    } catch (err) {
      console.error("Failed to copy markdown: ", err);

      // Fallback method
      const textArea = document.createElement("textarea");
      textArea.value = markdown;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch (fallbackErr) {
        document.body.removeChild(textArea);
        console.error("Fallback copy failed: ", fallbackErr);
        return false;
      }
    }
  }, []);

  return copyMarkdown;
}

export default useCopyMarkdown;
// Usage in component:
// const copyMarkdown = useCopyMarkdown();
// copyMarkdown(markdown);
