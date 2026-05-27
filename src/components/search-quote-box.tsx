"use client";
import * as React from "react";
import {
  Sparkles,
  Zap,
  ImagePlus,
  Paperclip,
  X,
  FileText as FileIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLACEHOLDER_TEXT } from "@/data/sample-request";
import { cn } from "@/lib/utils";

export type Attachment = {
  id: string;
  type: "file" | "image";
  name: string;
  size: number;
  previewUrl?: string;
};

interface SearchQuoteBoxProps {
  onSubmit?: (text: string, attachments: Attachment[]) => void;
  placeholder?: string;
  submitLabel?: string;
  className?: string;
  rows?: number;
  showTitle?: boolean;
}

const ACCEPT = ".xlsx,.xls,.csv,.pdf,.png,.jpg,.jpeg,.webp,image/*";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  if (attachment.type === "image" && attachment.previewUrl) {
    return (
      <div className="group relative h-12 w-12 shrink-0 rounded-lg border-2 border-violet-200 overflow-hidden bg-muted">
        <img
          src={attachment.previewUrl}
          alt={attachment.name}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          aria-label={`Xoá ${attachment.name}`}
          className="absolute top-0.5 right-0.5 grid h-4 w-4 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>
    );
  }
  return (
    <div className="group inline-flex items-center gap-2 shrink-0 max-w-[240px] pl-2 pr-1 h-12 rounded-lg border bg-violet-50/60 border-violet-200">
      <span className="grid h-6 w-6 place-items-center rounded-md bg-violet-600 text-white shrink-0">
        <FileIcon className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <div className="text-xs font-medium truncate text-violet-900 leading-tight" title={attachment.name}>
          {attachment.name}
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums leading-tight">
          {formatSize(attachment.size)}
        </div>
      </div>
      <button
        onClick={onRemove}
        aria-label={`Xoá ${attachment.name}`}
        className="grid h-5 w-5 place-items-center rounded-md text-muted-foreground hover:text-rose-600 hover:bg-rose-50 shrink-0"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function SearchQuoteBox({
  onSubmit,
  placeholder = PLACEHOLDER_TEXT,
  submitLabel = "Phân tích ngay",
  className = "",
  rows = 6,
  showTitle = false,
}: SearchQuoteBoxProps) {
  const [text, setText] = React.useState("");
  const [dragOver, setDragOver] = React.useState(false);
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Cleanup object URLs khi unmount hoặc thay đổi
  React.useEffect(() => {
    return () => {
      attachments.forEach((a) => a.previewUrl && URL.revokeObjectURL(a.previewUrl));
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    const newAtts = list.map<Attachment>((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: f.type.startsWith("image/") ? "image" : "file",
      name: f.name || (f.type.startsWith("image/") ? "image.png" : "file"),
      size: f.size,
      previewUrl: f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined,
    }));
    setAttachments((prev) => [...prev, ...newAtts]);
    toast.success(
      newAtts.length === 1
        ? `Đã đính kèm: ${newAtts[0].name}`
        : `Đã đính kèm ${newAtts.length} tệp`,
    );
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const removed = prev.find((a) => a.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSubmit = () => {
    if (!text.trim() && attachments.length === 0) {
      toast.error("Hãy nhập danh sách hoặc đính kèm tệp/ảnh");
      return;
    }
    if (onSubmit) {
      onSubmit(text, attachments);
    }
  };

  return (
    <div className={cn("relative", className)}>
      {showTitle && (
        <div className="text-center mb-4 sm:mb-5">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Tạo yêu cầu <span className="brand-gradient-text">báo giá</span> mới
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-2xl mx-auto px-2">
            Gửi danh sách các vật phẩm cần báo giá, hệ thống tự bóc tách và kết nối các nhà cung cấp.
          </p>
        </div>
      )}

      {/* Glow background */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-500/20 via-blue-500/20 to-violet-500/20 blur-2xl opacity-60 pointer-events-none" />

      {/* Top label chip */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 max-w-[calc(100%-1rem)]">
        <div className="inline-flex items-center gap-1.5 px-3 h-6 rounded-full brand-gradient text-white text-[10px] sm:text-[11px] font-bold shadow-lg uppercase tracking-wider whitespace-nowrap">
          <Sparkles className="h-3 w-3 shrink-0" />
          Khu vực xử lý chính
        </div>
      </div>

      <div
        className={cn(
          "input-spin-glow shadow-2xl transition-transform",
          dragOver && "dragging ring-4 ring-violet-200 scale-[1.01]",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
      >
        <div className="inner p-1">
          {dragOver && (
            <div className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-violet-50/90 border-2 border-dashed border-violet-500 pointer-events-none">
              <div className="text-center">
                <ImagePlus className="h-10 w-10 mx-auto text-violet-600 mb-1.5" />
                <div className="font-bold text-violet-700">Thả file vào đây</div>
                <div className="text-xs text-violet-600 mt-0.5">Excel, CSV, PDF, ảnh JPG/PNG</div>
              </div>
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPaste={(e) => {
              const items = Array.from(e.clipboardData?.items ?? []);
              const imgItem = items.find((it) => it.type.startsWith("image/"));
              if (imgItem) {
                e.preventDefault();
                const file = imgItem.getAsFile();
                if (file) addFiles([file]);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={rows}
            placeholder={placeholder}
            className="w-full resize-none rounded-xl bg-transparent px-5 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/60 placeholder:whitespace-pre-line"
          />

          {/* Attachment chips */}
          {attachments.length > 0 && (
            <div className="px-3 pb-2 animate-fade-up">
              <div className="flex gap-2 overflow-x-auto overscroll-contain -mx-1 px-1 pb-1">
                {attachments.map((a) => (
                  <AttachmentChip
                    key={a.id}
                    attachment={a}
                    onRemove={() => removeAttachment(a.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-2 sm:px-3 pb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-violet-200 hover:border-violet-400 hover:bg-violet-50"
              onClick={() => fileInputRef.current?.click()}
              title="Đính kèm Excel, PDF hoặc ảnh"
            >
              <Paperclip className="h-4 w-4 text-violet-600" />
              Tệp đính kèm
            </Button>
            <span className="hidden md:inline text-[11px] text-muted-foreground">
              .xlsx · .csv · .pdf · .png · .jpg · paste Ctrl+V
            </span>
            <span className="ml-auto flex items-center gap-2 w-full sm:w-auto">
              <Button
                size="lg"
                className="h-10 px-4 sm:px-5 gap-1.5 brand-gradient text-white border-0 hover:opacity-90 shadow-lg shadow-violet-500/20 font-bold w-full sm:w-auto"
                onClick={handleSubmit}
              >
                <Zap className="h-4 w-4" />
                {submitLabel}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchQuoteBox;
