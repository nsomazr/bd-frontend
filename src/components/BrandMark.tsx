import { Droplet } from "lucide-react";

interface BrandMarkProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
}

export function BrandMark({ size = "md", withText = true }: BrandMarkProps) {
  const dim = size === "sm" ? 18 : size === "lg" ? 32 : 22;
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-900/20">
        <Droplet size={dim} strokeWidth={2.2} fill="currentColor" />
      </div>
      {withText && (
        <div className={`font-semibold tracking-tight ${text}`}>
          Maisha <span className="text-brand-600">Chat</span>
        </div>
      )}
    </div>
  );
}
