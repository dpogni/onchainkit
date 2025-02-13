import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Address } from 'viem';
import {
  useAccount,
  useConfig,
  useSwitchChain,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useValue } from '../../internal/hooks/useValue';
import {
  GENERIC_ERROR_MESSAGE,
  METHOD_NOT_SUPPORTED_ERROR_SUBSTRING,
} from '../constants';
import { useCallsStatus } from '../hooks/useCallsStatus';
import { useWriteContract } from '../hooks/useWriteContract';
import { useWriteContracts } from '../hooks/useWriteContracts';
import type {
  LifeCycleStatus,
  TransactionContextType,
  TransactionProviderReact,
} from '../types';
import { isUserRejectedRequestError } from '../utils/isUserRejectedRequestError';

const emptyContext = {} as TransactionContextType;
export const TransactionContext =
  createContext<TransactionContextType>(emptyContext);

export function useTransactionContext() {
  const context = useContext(TransactionContext);
  if (context === emptyContext) {
    throw new Error(
      'useTransactionContext must be used within a Transaction component',
    );
  }
  return context;
}

export function TransactionProvider({
  address,
  capabilities,
  chainId,
  children,
  contracts,
  onError,
  onStatus,
  onSuccess,
}: TransactionProviderReact) {
  // Core Hooks
  const account = useAccount();
  const config = useConfig();
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [lifeCycleStatus, setLifeCycleStatus] = useState<LifeCycleStatus>({
    statusName: 'init',
    statusData: null,
  }); // Component lifecycle
  const [transactionId, setTransactionId] = useState('');
  const [transactionHashList, setTransactionHashList] = useState<Address[]>([]);

  const { switchChainAsync } = useSwitchChain();

  // Hooks that depend from Core Hooks
  const { status: statusWriteContracts, writeContractsAsync } =
    useWriteContracts({
      setLifeCycleStatus,
      setTransactionId,
    });
  const {
    status: statusWriteContract,
    writeContractAsync,
    data: writeContractTransactionHash,
  } = useWriteContract({
    setLifeCycleStatus,
    transactionHashList,
  });
  const { transactionHash, status: callStatus } = useCallsStatus({
    setLifeCycleStatus,
    transactionId,
  });
  const { data: receipt } = useWaitForTransactionReceipt({
    hash: writeContractTransactionHash || transactionHash,
  });

  // Component lifecycle emitters
  useEffect(() => {
    setErrorMessage('');
    // Error
    if (lifeCycleStatus.statusName === 'error') {
      setErrorMessage(lifeCycleStatus.statusData.message);
      setErrorCode(lifeCycleStatus.statusData.code);
      onError?.(lifeCycleStatus.statusData);
    }
    // Transaction Legacy Executed
    if (lifeCycleStatus.statusName === 'transactionLegacyExecuted') {
      setTransactionHashList(lifeCycleStatus.statusData.transactionHashList);
    }
    // Success
    if (lifeCycleStatus.statusName === 'success') {
      onSuccess?.({
        transactionReceipts: lifeCycleStatus.statusData.transactionReceipts,
      });
    }
    // Emit State
    onStatus?.(lifeCycleStatus);
  }, [
    onError,
    onStatus,
    onSuccess,
    lifeCycleStatus,
    lifeCycleStatus.statusData, // Keep statusData, so that the effect runs when it changes
    lifeCycleStatus.statusName, // Keep statusName, so that the effect runs when it changes
  ]);

  // Trigger success status when receipt is generated by useWaitForTransactionReceipt
  useEffect(() => {
    if (!receipt) {
      return;
    }
    setLifeCycleStatus({
      statusName: 'success',
      statusData: {
        transactionReceipts: [receipt],
      },
    });
  }, [receipt]);

  // When all transactions are succesful, get the receipts
  useEffect(() => {
    if (
      transactionHashList.length !== contracts.length ||
      contracts.length < 2
    ) {
      return;
    }
    getTransactionLegacyReceipts();
  }, [contracts, transactionHashList]);

  const getTransactionLegacyReceipts = useCallback(async () => {
    const receipts = [];
    for (const hash of transactionHashList) {
      try {
        const txnReceipt = await waitForTransactionReceipt(config, {
          hash,
          chainId,
        });
        receipts.push(txnReceipt);
      } catch (err) {
        setLifeCycleStatus({
          statusName: 'error',
          statusData: {
            code: 'TmTPc01', // Transaction module TransactionProvider component 01 error
            error: JSON.stringify(err),
            message: GENERIC_ERROR_MESSAGE,
          },
        });
      }
    }
    setLifeCycleStatus({
      statusName: 'success',
      statusData: {
        transactionReceipts: receipts,
      },
    });
  }, [chainId, config, transactionHashList]);

  const fallbackToWriteContract = useCallback(async () => {
    // EOAs don't support batching, so we process contracts individually.
    // This gracefully handles accidental batching attempts with EOAs.
    for (const contract of contracts) {
      try {
        await writeContractAsync?.(contract);
      } catch (err) {
        const errorMessage = isUserRejectedRequestError(err)
          ? 'Request denied.'
          : GENERIC_ERROR_MESSAGE;
        setLifeCycleStatus({
          statusName: 'error',
          statusData: {
            code: 'TmTPc02', // Transaction module TransactionProvider component 02 error
            error: JSON.stringify(err),
            message: errorMessage,
          },
        });
      }
    }
  }, [contracts, writeContractAsync]);

  const switchChain = useCallback(
    async (targetChainId: number | undefined) => {
      if (targetChainId && account.chainId !== targetChainId) {
        await switchChainAsync({ chainId: targetChainId });
      }
    },
    [account.chainId, switchChainAsync],
  );

  const executeContracts = useCallback(async () => {
    await writeContractsAsync({
      contracts,
      capabilities,
    });
  }, [writeContractsAsync, contracts, capabilities]);

  const handleSubmit = useCallback(async () => {
    setErrorMessage('');
    setIsToastVisible(true);
    try {
      await switchChain(chainId);
      await executeContracts();
    } catch (err) {
      // handles EOA writeContracts error (fallback to writeContract)
      if (
        err instanceof Error &&
        err.message.includes(METHOD_NOT_SUPPORTED_ERROR_SUBSTRING)
      ) {
        await fallbackToWriteContract();
        return;
      }
      const errorMessage = isUserRejectedRequestError(err)
        ? 'Request denied.'
        : GENERIC_ERROR_MESSAGE;
      setLifeCycleStatus({
        statusName: 'error',
        statusData: {
          code: 'TmTPc03', // Transaction module TransactionProvider component 03 error
          error: JSON.stringify(err),
          message: errorMessage,
        },
      });
    }
  }, [chainId, executeContracts, fallbackToWriteContract, switchChain]);

  const value = useValue({
    address,
    chainId,
    contracts,
    errorCode,
    errorMessage,
    hasPaymaster: !!capabilities?.paymasterService?.url,
    isLoading: callStatus === 'PENDING',
    isToastVisible,
    onSubmit: handleSubmit,
    receipt,
    setIsToastVisible,
    setLifeCycleStatus,
    setTransactionId,
    statusWriteContracts,
    statusWriteContract,
    transactionId,
    transactionHash: transactionHash || writeContractTransactionHash,
  });
  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}
