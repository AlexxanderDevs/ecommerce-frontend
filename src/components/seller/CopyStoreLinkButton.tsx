import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CopyStoreLinkButtonProps {
  slug: string;
}

export function CopyStoreLinkButton({ slug }: CopyStoreLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const storeUrl = `${window.location.origin}/stores/${slug}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(storeUrl);

      setCopied(true);
      toast.success('Enlace de la tienda copiado.');

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error('No se pudo copiar el enlace.');
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4" />
      )}

      {copied ? 'Copiado' : 'Copiar enlace'}
    </button>
  );
}