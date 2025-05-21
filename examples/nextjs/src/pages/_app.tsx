import type { AppProps } from 'next/app';
import { VemetricScript } from '@vemetric/react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <VemetricScript
        token="o1rySsGlUtFCyflo"
        host="https://hub.vemetric.local"
        onInit={() => {
          console.log('Vemetric initialized');
        }}
      />
      <Component {...pageProps} />
    </>
  );
}
