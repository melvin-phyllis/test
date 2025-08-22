"use client"

import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"

export function LanguageToggle() {
  const { language, setLanguage } = useI18n()

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant={language === "en" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("en")}
        className="text-xs"
      >
        EN
      </Button>
      <Button
        variant={language === "fr" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("fr")}
        className="text-xs"
      >
        FR
      </Button>
    </div>
  )
}
