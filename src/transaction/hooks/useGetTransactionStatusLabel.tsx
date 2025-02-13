import { useMemo } from 'react';
import { color } from '../../styles/theme';
import { useTransactionContext } from '../components/TransactionProvider';

export function useGetTransactionStatusLabel() {
  const {
    errorMessage,
    isLoading,
    receipt,
    statusWriteContract,
    statusWriteContracts,
    transactionHash,
    transactionId,
  } = useTransactionContext();
  // user confirmed in wallet, txn in progress
  const isInProgress = isLoading || !!transactionId || !!transactionHash;

  // user started txn and needs to confirm in wallet
  const isPending =
    statusWriteContract === 'pending' || statusWriteContracts === 'pending';

  return useMemo(() => {
    let label = '';
    let labelClassName: string = color.foregroundMuted;

    if (isPending) {
      label = 'Confirm in wallet.';
    }

    if (isInProgress) {
      label = 'Transaction in progress...';
    }

    if (receipt) {
      label = 'Successful';
    }

    if (errorMessage) {
      label = errorMessage;
      labelClassName = color.error;
    }

    return { label, labelClassName };
  }, [errorMessage, isInProgress, isPending, receipt]);
}
