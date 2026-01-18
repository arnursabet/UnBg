import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster, toast } from "sonner";
import { DropZone } from "./components/DropZone";
import { ImagePreview } from "./components/ImagePreview";
import { ResultDisplay } from "./components/ResultDisplay";

type AppState = "idle" | "preview" | "processing" | "result";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const MAX_FILE_SIZE_MB = 10;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

function App() {
  const [state, setState] = useState<AppState>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [imageId, setImageId] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);

  const reset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setShareUrl("");
    setImageId(null);
    setIsMirrored(true);
    setState("idle");
  }, [previewUrl]);

  const handleImageSelect = useCallback((file: File) => {
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setState("preview");
  }, []);

  // Keyboard paste support (Cmd+V / Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (state !== "idle") return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            handleImageSelect(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [state, handleImageSelect]);

  const handleProcess = useCallback(async () => {
    if (!selectedFile) return;

    setState("processing");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("mirror", String(isMirrored));

      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Processing failed");

      const data = await response.json();
      await preloadImage(data.processedUrl);

      setProcessedUrl(data.processedUrl);
      setShareUrl(data.shareUrl);
      setImageId(data.id);
      setState("result");
    } catch (error) {
      console.error("Processing error:", error);
      toast.error("Failed to process image");
      setState("preview");
    }
  }, [selectedFile, isMirrored]);

  const handleDelete = useCallback(async () => {
    if (!imageId) return;

    try {
      const response = await fetch(`${API_URL}/api/images/${imageId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");

      toast.success("Image deleted");
      reset();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete image");
    }
  }, [imageId, reset]);

  const handleBack = useCallback(() => {
    if (state === "preview") {
      reset();
    } else if (state === "result") {
      setState("preview");
    }
  }, [state, reset]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-6">
        <h1 className="text-xl font-semibold text-white font-display">UnBG</h1>
        {state !== "idle" && state !== "processing" && (
          <motion.button
            onClick={handleBack}
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {state === "preview" ? "Cancel" : "Back"}
          </motion.button>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <DropZone key="dropzone" onImageSelect={handleImageSelect} />
          )}

          {state === "preview" && previewUrl && (
            <ImagePreview
              key="preview"
              src={previewUrl}
              isMirrored={isMirrored}
              onMirrorToggle={() => setIsMirrored((m) => !m)}
              onProcess={handleProcess}
            />
          )}

          {state === "processing" && (
            <motion.div
              key="processing"
              className="flex-1 flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div
                className="w-6 h-6 border-2 border-zinc-700 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              />
              <p className="text-zinc-500 text-sm">Removing background...</p>
            </motion.div>
          )}

          {state === "result" && processedUrl && (
            <ResultDisplay
              key="result"
              imageSrc={processedUrl}
              imageUrl={shareUrl}
              onDelete={handleDelete}
              onReset={reset}
            />
          )}
        </AnimatePresence>
      </main>

      <Toaster
        position="bottom-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            color: "white",
          },
        }}
      />
    </div>
  );
}

export default App;
