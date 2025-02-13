import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWriteContract as useWriteContractWagmi } from 'wagmi';
import { isUserRejectedRequestError } from '../utils/isUserRejectedRequestError';
import { useWriteContract } from './useWriteContract';

vi.mock('wagmi', () => ({
  useWriteContract: vi.fn(),
}));

vi.mock('../utils/isUserRejectedRequestError', () => ({
  isUserRejectedRequestError: vi.fn(),
}));

type UseWriteContractConfig = {
  mutation: {
    onError: (error: Error) => void;
    onSuccess: (id: string) => void;
  };
};

type MockUseWriteContractReturn = {
  status: 'idle' | 'error' | 'loading' | 'success';
  writeContractAsync: ReturnType<typeof vi.fn>;
  data: string | null;
};

describe('useWriteContract', () => {
  const mockSetLifeCycleStatus = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return wagmi hook data when successful', () => {
    const mockWriteContract = vi.fn();
    const mockData = 'mockTransactionData';
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockReturnValue({
      status: 'idle',
      writeContractAsync: mockWriteContract,
      data: mockData,
    } as MockUseWriteContractReturn);
    const { result } = renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(result.current.status).toBe('idle');
    expect(result.current.writeContractAsync).toBe(mockWriteContract);
    expect(result.current.data).toBe(mockData);
  });

  it('should handle generic error', () => {
    const genericError = new Error('Something went wrong. Please try again.');
    let onErrorCallback: ((error: Error) => void) | undefined;
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockImplementation(
      ({ mutation }: UseWriteContractConfig) => {
        onErrorCallback = mutation.onError;
        return {
          writeContractAsync: vi.fn(),
          data: null,
          status: 'error',
        } as MockUseWriteContractReturn;
      },
    );
    renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(onErrorCallback).toBeDefined();
    onErrorCallback?.(genericError);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'error',
      statusData: {
        code: 'TmUWCh01',
        error: 'Something went wrong. Please try again.',
        message: 'Something went wrong. Please try again.',
      },
    });
  });

  it('should handle user rejected error', () => {
    const useRejectedError = new Error('Request denied.');
    let onErrorCallback: ((error: Error) => void) | undefined;
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockImplementation(
      ({ mutation }: UseWriteContractConfig) => {
        onErrorCallback = mutation.onError;
        return {
          writeContractAsync: vi.fn(),
          data: null,
          status: 'error',
        } as MockUseWriteContractReturn;
      },
    );
    (isUserRejectedRequestError as vi.Mock).mockReturnValue(true);
    renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(onErrorCallback).toBeDefined();
    onErrorCallback?.(useRejectedError);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'error',
      statusData: {
        code: 'TmUWCh01',
        error: 'Request denied.',
        message: 'Request denied.',
      },
    });
  });

  it('should handle successful transaction', () => {
    const transactionId = '0x123456';
    let onSuccessCallback: ((id: string) => void) | undefined;
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockImplementation(
      ({ mutation }: UseWriteContractConfig) => {
        onSuccessCallback = mutation.onSuccess;
        return {
          writeContractAsync: vi.fn(),
          data: transactionId,
          status: 'success',
        } as MockUseWriteContractReturn;
      },
    );
    renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(onSuccessCallback).toBeDefined();
    onSuccessCallback?.(transactionId);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'transactionLegacyExecuted',
      statusData: {
        transactionHashList: [transactionId],
      },
    });
  });

  it('should handle multiple successful transactions', () => {
    const transactionId = '0x12345678';
    let onSuccessCallback: ((id: string) => void) | undefined;
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockImplementation(
      ({ mutation }: UseWriteContractConfig) => {
        onSuccessCallback = mutation.onSuccess;
        return {
          writeContractAsync: vi.fn(),
          data: transactionId,
          status: 'success',
        } as MockUseWriteContractReturn;
      },
    );
    renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(onSuccessCallback).toBeDefined();
    onSuccessCallback?.(transactionId);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'transactionLegacyExecuted',
      statusData: {
        transactionHashList: [transactionId],
      },
    });
    renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [transactionId],
      }),
    );
    onSuccessCallback?.(transactionId);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'transactionLegacyExecuted',
      statusData: {
        transactionHashList: [transactionId, transactionId],
      },
    });
  });

  it('should handle uncaught errors', () => {
    const uncaughtError = new Error('Uncaught error');
    (useWriteContractWagmi as ReturnType<typeof vi.fn>).mockImplementation(
      () => {
        throw uncaughtError;
      },
    );
    const { result } = renderHook(() =>
      useWriteContract({
        setLifeCycleStatus: mockSetLifeCycleStatus,
        transactionHashList: [],
      }),
    );
    expect(result.current.status).toBe('error');
    expect(result.current.writeContractAsync).toBeInstanceOf(Function);
    expect(mockSetLifeCycleStatus).toHaveBeenCalledWith({
      statusName: 'error',
      statusData: {
        code: 'TmUWCh02',
        error: JSON.stringify(uncaughtError),
        message: 'Something went wrong. Please try again.',
      },
    });
  });
});
