import { PageTransition } from "@/components/page-transition";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
        <SettingsIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">This page is under construction.</p>
      </div>
    </PageTransition>
  );
}
