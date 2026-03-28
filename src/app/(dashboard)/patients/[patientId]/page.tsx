interface PageProps {
  params: Promise<{ patientId: string }>;
}

export default async function PatientDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { patientId } = await params;

  return (
    <main>
      <h1>Patient Detail</h1>
      <p>Patient ID: {patientId}</p>
    </main>
  );
}
