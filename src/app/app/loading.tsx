import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="container max-w-md py-24 text-center text-muted-foreground">
      <Loader2 className="h-8 w-8 mx-auto animate-spin text-violet-600 mb-3" />
      <p className="text-sm">Đang tải...</p>
    </div>
  );
}
