import type { Wallet } from '@/types/wallet';

const ADJECTIVES = [
  'Shadow', 'Crimson', 'Silent', 'Phantom', 'Arctic', 'Obsidian', 'Cobalt',
  'Ember', 'Onyx', 'Cipher', 'Stealth', 'Vortex', 'Eclipse', 'Rogue',
  'Iron', 'Spectre', 'Nova', 'Apex', 'Dusk', 'Storm', 'Frost', 'Void',
  'Neon', 'Zinc', 'Pulse', 'Velvet', 'Ashen', 'Lunar', 'Solar', 'Delta',
  'Omega', 'Sigma',
];

const NOUNS = [
  'Falcon', 'Vector', 'Sentinel', 'Wraith', 'Phoenix', 'Cipher', 'Nexus',
  'Raptor', 'Specter', 'Vanguard', 'Tempest', 'Condor', 'Oracle', 'Titan',
  'Raven', 'Hydra', 'Vertex', 'Mantis', 'Lynx', 'Nomad', 'Aegis', 'Talon',
  'Prism', 'Bolt', 'Shard', 'Helix', 'Flux', 'Drift', 'Beacon', 'Warden',
  'Zenith', 'Forge',
];

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', data as unknown as BufferSource);
  return new Uint8Array(hash);
}

export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
  const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
  const publicKeyBytes = await sha256(privateKeyBytes);
  return {
    publicKey: bytesToHex(publicKeyBytes),
    privateKey: bytesToHex(privateKeyBytes),
  };
}

export async function deriveAddress(publicKey: string): Promise<string> {
  const hash = await sha256(hexToBytes(publicKey));
  return '0x' + bytesToHex(hash.slice(0, 20));
}

export function derivePseudonym(address: string): string {
  const bytes = hexToBytes(address.replace('0x', ''));
  const adjIdx = (bytes[0] + bytes[1]) % ADJECTIVES.length;
  const nounIdx = (bytes[2] + bytes[3]) % NOUNS.length;
  return `${ADJECTIVES[adjIdx]}-${NOUNS[nounIdx]}`;
}

export async function generateWallet(): Promise<Wallet> {
  const { publicKey, privateKey } = await generateKeyPair();
  const address = await deriveAddress(publicKey);
  const pseudonym = derivePseudonym(address);
  return {
    publicKey,
    privateKey,
    address,
    pseudonym,
    createdAt: Date.now(),
  };
}

export async function encryptData(data: string, key: string): Promise<string> {
  const keyBytes = hexToBytes(key.slice(0, 64).padEnd(64, '0'));
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes as unknown as BufferSource, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource }, cryptoKey, encoded as unknown as BufferSource
  );
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptData(ciphertext: string, key: string): Promise<string> {
  const keyBytes = hexToBytes(key.slice(0, 64).padEnd(64, '0'));
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyBytes as unknown as BufferSource, { name: 'AES-GCM' }, false, ['decrypt']
  );
  const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource }, cryptoKey, data as unknown as BufferSource
  );
  return new TextDecoder().decode(decrypted);
}
