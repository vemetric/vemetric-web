'use client';

import { vemetric } from '@vemetric/react';

export default function PageContent() {
  return (
    <>
      <div>PageContent</div>
      <button onClick={() => vemetric.trackEvent('custom_event_nextjs')}>Track Custom Event</button>
    </>
  );
}
