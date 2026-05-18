// Not linked from any screen in the current app nav.
// Redirecting to the transaction hub to prevent a dead screen.
import { Redirect } from 'expo-router';
export default function CreateRedirect() {
  return <Redirect href="/transaction" />;
}
