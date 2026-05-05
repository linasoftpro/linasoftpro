// Hidden placeholder route to host the central FAB in the tab bar.
import { Redirect } from 'expo-router';

export default function NewPlaceholder() {
  return <Redirect href="/(tabs)" />;
}
