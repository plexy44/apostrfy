/**
 * @fileoverview This is the main entry point for the Scriblox application's home page.
 * It renders the primary client-side component, `ScribloxClient`, which manages
 * the entire application state and user interface.
 */
import ScribloxClient from '@/components/ScribloxClient';

export default function Home() {
  return (
    <ScribloxClient />
  );
}
