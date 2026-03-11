import { redirect } from 'next/navigation'

type GrupoPageProps = {
  params: {
    id: string
  }
}

export function generateStaticParams() {
  return [{ id: 'static' }]
}

export default function GrupoPage({ params }: GrupoPageProps) {
  redirect(`/group/${params.id}`)
}
