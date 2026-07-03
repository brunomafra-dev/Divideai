import { redirect } from 'next/navigation'

export function generateStaticParams() {
  return [{ id: 'static' }]
}


export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/group/${id}/add-expense`)
}
