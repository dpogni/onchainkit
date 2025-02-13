import type { IsSpinnerDisplayedProps } from '../types';

export function isSpinnerDisplayed({
  errorMessage,
  hasReceipt,
  isLoading,
  statusWriteContract,
  statusWriteContracts,
  transactionHash,
  transactionId,
}: IsSpinnerDisplayedProps) {
  const isPending =
    statusWriteContract === 'pending' || statusWriteContracts === 'pending';
  const isInProgress = transactionId || transactionHash;

  if (hasReceipt || errorMessage) {
    return false;
  }
  if (isLoading || isPending || isInProgress) {
    return true;
  }
  return false;
}
