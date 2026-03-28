interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { sessionId } = await params;

  return (
    <main>
      <h1>Session Detail</h1>
      <p>Session ID: {sessionId}</p>
    </main>
  );
}
