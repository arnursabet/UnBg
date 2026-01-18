import { motion } from "framer-motion";
import { toast } from "sonner";

interface ResultDisplayProps {
  imageSrc: string;
  imageUrl: string;
  onDelete: () => void;
  onReset: () => void;
}

export function ResultDisplay({
  imageSrc,
  imageUrl,
  onDelete,
  onReset,
}: ResultDisplayProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(imageUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "unbg-image.png";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download");
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-6 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Image with transparency checkerboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-xl overflow-hidden border border-[var(--color-border)] shadow-xl shadow-black/30"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #161618 25%, transparent 25%),
              linear-gradient(-45deg, #161618 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #161618 75%),
              linear-gradient(-45deg, transparent 75%, #161618 75%)
            `,
            backgroundSize: "10px 10px",
            backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
          }}
        />
        <img
          src={imageSrc}
          alt="Result"
          className="relative max-w-lg max-h-96 object-contain"
        />
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button onClick={handleDownload} className="btn btn-secondary text-sm">
          <DownloadIcon />
          Download
        </button>

        <button onClick={handleCopy} className="btn btn-secondary text-sm">
          <CopyIcon />
          Copy Link
        </button>

        <button
          onClick={onDelete}
          className="btn btn-secondary text-sm text-zinc-400"
        >
          <TrashIcon />
          Delete
        </button>

        <button onClick={onReset} className="btn btn-primary text-sm">
          <PlusIcon />
          New
        </button>
      </motion.div>
    </motion.div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
