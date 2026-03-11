import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { termsSections, termsTitle } from '@/lib/legal-content'

export default function PublicTermsPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F7] page-fade">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/login">
            <button type="button" className="tap-target touch-friendly pressable text-gray-600 active:text-gray-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
          </Link>
          <h1 className="section-title">{termsTitle}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-8">
        <article className="surface-card p-5 space-y-5 text-sm text-gray-700 leading-6">
          {termsSections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="font-semibold text-gray-800">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-5 space-y-1">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </article>
      </main>
    </div>
  )
}
