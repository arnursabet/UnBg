import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DropZoneProps {
  onImageSelect: (file: File) => void;
}

export function DropZone({ onImageSelect }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items?.length) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) {
        onImageSelect(file);
      }
    },
    [onImageSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onImageSelect(file);
    },
    [onImageSelect],
  );

  return (
    <motion.div
      className="relative flex-1 flex items-center justify-center"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <label className="group flex flex-col items-center gap-6 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <AnimatePresence mode="wait">
          {isDragging ? (
            <motion.div
              key="dragging"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-white/30 bg-white/5 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-white/70 font-medium">Release to upload</p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="w-20 h-20 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center transition-colors group-hover:border-zinc-600 group-hover:bg-[var(--color-surface-hover)]">
                <svg
                  className="w-8 h-8 text-zinc-500 transition-colors group-hover:text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="text-center space-y-1">
                <p className="text-zinc-200 font-medium">Drop an image here</p>
                <p className="text-sm text-zinc-500">
                  or click to browse{" "}
                  <span className="hidden sm:inline">· paste with ⌘V</span>
                </p>
              </div>

              <div className="flex gap-1.5">
                {["PNG", "JPG", "WebP"].map((format) => (
                  <span
                    key={format}
                    className="px-2 py-0.5 rounded bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-zinc-500"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </label>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-4 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] pointer-events-none"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
