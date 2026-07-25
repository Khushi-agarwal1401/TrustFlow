"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "@/i18n/routing"
import { useTransition } from "react"

const locales = [
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function switchLang(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next })
    })
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((l) => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          disabled={isPending || locale === l.code}
          className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
            locale === l.code
              ? "bg-indigo-500/20 text-indigo-400"
              : "text-gray-500 hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
