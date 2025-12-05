import { PageTransition } from "@/components/page-transition";
import { Settings as SettingsIcon } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function SettingsPage() {
  const { t } = useTranslation();
  return (
    <PageTransition>
      <div className="flex flex-col items-center justify-center h-[80vh] text-center p-4">
        <SettingsIcon className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-3xl font-bold">{t('settings')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageUnderConstruction')}</p>
      </div>
    </PageTransition>
  );
}

    