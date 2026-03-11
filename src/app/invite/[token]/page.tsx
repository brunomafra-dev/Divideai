import ClientPage from './client-page'

export function generateStaticParams() {
  return [{ token: 'static' }]
}


export default function Page({ params }: { params: { token: string } }) {
  return <ClientPage params={params} />
}
