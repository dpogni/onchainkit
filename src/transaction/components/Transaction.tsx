import { cn } from '../../styles/theme';
import type { TransactionReact } from '../types';
import { TransactionProvider } from './TransactionProvider';

export function Transaction({
  address,
  capabilities,
  chainId,
  className,
  children,
  contracts,
  onError,
  onStatus,
  onSuccess,
}: TransactionReact) {
  return (
    <TransactionProvider
      address={address}
      capabilities={capabilities}
      chainId={chainId}
      contracts={contracts}
      onError={onError}
      onStatus={onStatus}
      onSuccess={onSuccess}
    >
      <div className={cn(className, 'flex w-full flex-col gap-2')}>
        {children}
      </div>
    </TransactionProvider>
  );
}
