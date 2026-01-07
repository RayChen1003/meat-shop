// pages/_app.js
import '../styles/globals.css';
import { AuthProvider, StoreProvider, CartProvider } from '../lib/store';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <Component {...pageProps} />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
