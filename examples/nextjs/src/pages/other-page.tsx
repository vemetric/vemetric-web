import { vemetric } from '@vemetric/react';
import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <div>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
      </div>
      <h1>Other Page</h1>
      <button onClick={() => vemetric.trackEvent('custom_event_nextjs_pages')}>Track Custom Event</button>
    </div>
  );
}
