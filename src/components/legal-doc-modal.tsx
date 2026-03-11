'use client'

import { X } from 'lucide-react'
import {
  privacySections,
  privacyTitle,
  termsSections,
  termsTitle,
  type LegalSection,
} from '@/lib/legal-content'

type LegalType = 'terms' | 'privacy'

interface LegalDocModalProps {
  open: boolean
  type: LegalType
  onClose: () => void
  onViewed: () => void
}

function renderSections(sections: LegalSection[]) {
  return sections.map((section) => (
    <section key={section.title} className="space-y-2">
      <h3 className="font-semibold text-gray-800">{section.title}</h3>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm text-gray-700 leading-6">
          {paragraph}
        </p>
      ))}
      {section.bullets && (
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 leading-6">
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </section>
  ))
}

export default function LegalDocModal({ open, type, onClose, onViewed }: LegalDocModalProps) {
  if (!open) return null

  const isTerms = type === 'terms'
  const title = isTerms ? termsTitle : privacyTitle
  const sections = isTerms ? termsSections : privacySections

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] sm:p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl max-h-[calc(100dvh-9rem-env(safe-area-inset-bottom))] sm:max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button type="button" onClick={onClose} className="tap-target touch-friendly pressable text-gray-500 active:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4 overflow-y-auto space-y-5">
          {renderSections(sections)}
        </div>

        <div className="px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              onViewed()
              onClose()
            }}
            className="w-full tap-target touch-friendly pressable bg-[#5BC5A7] text-white py-2.5 rounded-lg font-medium active:bg-[#4AB396]"
          >
            Li e entendi
          </button>
        </div>
      </div>
    </div>
  )
}
