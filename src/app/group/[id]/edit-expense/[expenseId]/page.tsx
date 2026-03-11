import ClientPage from './client-page'

export function generateStaticParams() {
  return [{ id: 'static', expenseId: 'static' }]
}


export default function Page({ params }: { params: { id: string; expenseId: string } }) {
  return <ClientPage params={params} />
}
