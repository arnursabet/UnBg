import { motion } from "framer-motion";

interface ImagePreviewProps {
  src: string;
  isMirrored: boolean;
  onMirrorToggle: () => void;
  onProcess: () => void;
}

export function ImagePreview({
  src,
  isMirrored,
  onMirrorToggle,
  onProcess,
}: ImagePreviewProps) {
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center gap-8 p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <div className="rounded-xl overflow-hidden border border-[var(--color-border)] shadow-xl shadow-black/30">
          <img
            src={src}
            alt="Preview"
            className="max-w-lg max-h-96 object-contain"
          />
        </div>
      </motion.div>

      <motion.div
        className="flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <span className="text-zinc-500 text-sm transition-colors group-hover:text-zinc-400">
            Mirror image
          </span>
          <button
            type="button"
            onClick={onMirrorToggle}
            className={`relative w-10 h-6 rounded-full transition-all duration-200 ${
              isMirrored ? "bg-white" : "bg-zinc-700 hover:bg-zinc-600"
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-200 ${
                isMirrored
                  ? "bg-zinc-900 left-[calc(100%-1.25rem)]"
                  : "bg-zinc-400 left-1"
              }`}
            />
          </button>
        </label>

        <button onClick={onProcess} className="btn btn-primary text-sm">
          Remove Background
        </button>
      </motion.div>
    </motion.div>
  );
}
