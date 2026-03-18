import { useWallet } from '@/context/WalletContext';
import { truncateAddress } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, Copy, RefreshCw, Shield, User } from 'lucide-react';
import { useState } from 'react';

export function WalletPage() {
  const { wallet, regenerate, loading } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!wallet) return null;

  function handleCopy() {
    navigator.clipboard.writeText(wallet!.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </Link>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{wallet.pseudonym}</h2>
            <p className="text-xs text-muted-foreground font-mono">Anonymous Identity</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Wallet Address</p>
            <div className="flex items-center justify-between gap-2">
              <code className="text-sm text-foreground font-mono break-all">{wallet.address}</code>
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                title="Copy address"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-[10px] text-success mt-1">Copied!</p>}
          </div>

          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Public Key</p>
            <code className="text-xs text-muted-foreground font-mono break-all">{truncateAddress(wallet.publicKey)}</code>
          </div>

          <div className="bg-background border border-border rounded-lg p-3">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Private Key</p>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground font-mono">Encrypted at rest (AES-GCM)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-3">
          <Shield className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Your identity is derived from a locally-generated key pair. No personal information is collected or transmitted.
          </p>
        </div>

        <button
          onClick={regenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Generate New Identity
        </button>
        <p className="text-[10px] text-center text-muted-foreground font-mono">
          Warning: Generating a new identity will disassociate you from previous activity.
        </p>
      </div>
    </div>
  );
}
