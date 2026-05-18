// This route is not linked anywhere in the app.
// Redirecting to the transaction hub to prevent a dead screen.
import { Redirect } from 'expo-router';
export default function HistoryRedirect() {
  return <Redirect href="/transaction" />;
}
