import { Shield } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <span className="font-bold text-lg logo-text">
        Organize Me
      </span>
    </div>
  );
}