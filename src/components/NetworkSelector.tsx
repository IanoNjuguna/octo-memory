import { Alert01Icon } from '@/components/icons';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/hooks/useAppContext';
import type { LightningNetwork } from '@/lib/lightningNetwork';

interface NetworkSelectorProps {
  compact?: boolean;
}

export function NetworkSelector({ compact = false }: NetworkSelectorProps) {
  const { config, updateConfig } = useAppContext();

  const setNetwork = (lightningNetwork: LightningNetwork) => {
    updateConfig((current) => ({
      ...current,
      lightningNetwork,
    }));
  };

  return (
    <div className={compact ? 'space-y-2' : 'rounded-lg border bg-card p-4 space-y-3'}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="lightning-network" className="text-sm font-medium">
          Lightning Network
        </Label>
        <Select value={config.lightningNetwork} onValueChange={setNetwork}>
          <SelectTrigger id="lightning-network" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mainnet">Mainnet</SelectItem>
            <SelectItem value="testnet">Testnet</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {config.lightningNetwork === 'testnet' && (
        <p className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
          <Alert01Icon className="h-4 w-4 shrink-0" />
          Use a testnet LNURL/Lightning address. Mainnet providers like most Alby addresses will be rejected in testnet mode.
        </p>
      )}
    </div>
  );
}
