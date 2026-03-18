import { HashRouter, Routes, Route } from 'react-router-dom';
import { WalletProvider } from '@/context/WalletContext';
import { IntelligenceProvider } from '@/context/IntelligenceContext';
import { EscrowProvider } from '@/context/EscrowContext';
import { MessagingProvider } from '@/context/MessagingContext';
import { ResolutionProvider } from '@/context/ResolutionContext';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { RequestDetailPage } from '@/pages/RequestDetailPage';
import { WalletPage } from '@/pages/WalletPage';

export default function App() {
  return (
    <WalletProvider>
      <IntelligenceProvider>
        <EscrowProvider>
          <MessagingProvider>
            <ResolutionProvider>
              <HashRouter>
                <div className="min-h-screen bg-background">
                  <Header />
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/request/:id" element={<RequestDetailPage />} />
                    <Route path="/wallet" element={<WalletPage />} />
                  </Routes>
                </div>
              </HashRouter>
            </ResolutionProvider>
          </MessagingProvider>
        </EscrowProvider>
      </IntelligenceProvider>
    </WalletProvider>
  );
}
