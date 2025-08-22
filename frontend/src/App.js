// src/pages/_app.js
import { ClerkProvider } from '@clerk/nextjs';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  useRouter();

  return (
    <ClerkProvider
      {...pageProps}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;
