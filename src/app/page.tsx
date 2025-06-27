/**
 * @fileoverview This is the main entry point for the Apostrfy application's home page.
 * It renders the primary client-side component, `ApostrfyClient`, which manages
 * the entire application state and user interface.
 */
import ApostrfyClient from '@/components/ApostrfyClient';

export default function Home() {
  return (
    <ApostrfyClient />
  );
}
