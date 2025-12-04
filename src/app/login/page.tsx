import { PageTransition } from "@/components/page-transition";
import { Lock } from "lucide-react";

export default function LoginPage() {
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
        <Lock className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold">Login Page</h1>
        <p className="text-muted-foreground mt-2">
          This page is not available as the backend has been disconnected.
        </p>
      </div>
    </PageTransition>
  );
}
