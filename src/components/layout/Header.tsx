import { useWallet } from '@/context/WalletContext';
import { truncateAddress } from '@/lib/utils';
import { Shield, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const { wallet } = useWallet();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight leading-none">
                NAJM
              </h1>
              <p className="text-[10px] text-muted-foreground font-mono tracking-widest uppercase">
                Intelligence Platform
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
              <Shield className="w-3 h-3 text-success" />
              <span className="font-mono">Anonymous Mode Active</span>
            </div>

            {wallet && (
              <Link
                to="/wallet"
                className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 px-3 py-1.5 rounded-lg border border-border transition-colors no-underline"
              >
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-sm font-medium text-foreground">
                  {wallet.pseudonym}
                </span>
                <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
                  {truncateAddress(wallet.address)}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
