import { getMockPatientsWithLastSession } from "@/lib/mock-data";
import { NewSessionWizard } from "@/components/sessions/new-session-wizard";

export default function NewSessionPage(): React.JSX.Element {
  const patients = getMockPatientsWithLastSession();

  return <NewSessionWizard patients={patients} />;
}
