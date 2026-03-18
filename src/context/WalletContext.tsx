import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Wallet } from '@/types/wallet';
import { generateWallet, encryptData, decryptData } from '@/lib/crypto';
import { save, load, remove } from '@/lib/storage';

interface WalletContextValue {
  wallet: Wallet | null;
  loading: boolean;
  regenerate: () => Promise<void>;
  clear: () => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const STORAGE_KEY = 'wallet';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrCreate();
  }, []);

  async function loadOrCreate() {
    try {
      const stored = load<{ encrypted: string; address: string; pseudonym: string; publicKey: string; createdAt: number }>(STORAGE_KEY);
      if (stored) {
        const privateKey = await decryptData(stored.encrypted, stored.publicKey);
        setWallet({
          publicKey: stored.publicKey,
          privateKey,
          address: stored.address,
          pseudonym: stored.pseudonym,
          createdAt: stored.createdAt,
        });
      } else {
        await createAndStore();
      }
    } catch {
      await createAndStore();
    }
    setLoading(false);
  }

  async function createAndStore() {
    const w = await generateWallet();
    await storeWallet(w);
    setWallet(w);
  }

  async function storeWallet(w: Wallet) {
    const encrypted = await encryptData(w.privateKey, w.publicKey);
    save(STORAGE_KEY, {
      encrypted,
      address: w.address,
      pseudonym: w.pseudonym,
      publicKey: w.publicKey,
      createdAt: w.createdAt,
    });
  }

  async function regenerate() {
    setLoading(true);
    remove(STORAGE_KEY);
    await createAndStore();
    setLoading(false);
  }

  function clear() {
    remove(STORAGE_KEY);
    setWallet(null);
  }

  return (
    <WalletContext.Provider value={{ wallet, loading, regenerate, clear }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
