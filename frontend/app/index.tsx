import { Redirect } from 'expo-router';

export default function Index() {
  // Redirection directe vers l'écran de recherche
  return <Redirect href="/(tabs)/search" />;
}
