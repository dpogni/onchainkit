import type { UserOperation } from 'permissionless';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { Address, Chain, PublicClient } from 'viem';
import type { UseBalanceReturnType, UseReadContractReturnType } from 'wagmi';
import type { SwapError } from '../swap';

export type ConnectButtonReact = {
  className?: string; // Optional className override for button element
  connectButtonOnClick: () => void; // Function to call when the button is clicked
  text: string; // Optional text override for button
};

/**
 * Note: exported as public Type
 */
export type ConnectWalletReact = {
  children?: React.ReactNode; // Children can be utilized to display customized content when the wallet is connected.
  className?: string; // Optional className override for button element
  text?: string; // Optional text override for button
  withWalletAggregator?: boolean; // Optional flag to enable the wallet aggregator like RainbowKit
};

/**
 * Note: exported as public Type
 */
export type IsValidAAEntrypointOptions = {
  entrypoint: string;
};

/**
 * Note: exported as public Type
 */
export type IsWalletACoinbaseSmartWalletOptions = {
  client: PublicClient;
  userOp: UserOperation<'v0.6'>;
};

/**
 * Note: exported as public Type
 */
export type IsWalletACoinbaseSmartWalletResponse =
  | { isCoinbaseSmartWallet: true }
  | { isCoinbaseSmartWallet: false; error: string; code: string };

export type UseGetETHBalanceResponse = {
  error?: SwapError;
  response?: UseBalanceReturnType;
  convertedBalance?: string;
  roundedBalance?: string;
};

export type UseGetTokenBalanceResponse = {
  error?: SwapError;
  response?: UseReadContractReturnType;
  convertedBalance?: string;
  roundedBalance?: string;
};

/**
 * Note: exported as public Type
 */
export type WalletContextType = {
  address?: Address | null; // The Ethereum address to fetch the avatar and name for.
  chain?: Chain; // Optional chain for domain resolution
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

/**
 * Note: exported as public Type
 */
export type WalletReact = {
  children: React.ReactNode;
};

/**
 * Note: exported as public Type
 */
export type WalletBottomSheetReact = {
  children: React.ReactNode;
  className?: string; // Optional className override for top div element
};

/**
 * Note: exported as public Type
 */
export type WalletDropdownBaseNameReact = {
  className?: string; // Optional className override for the element
};

/**
 * Note: exported as public Type
 */
export type WalletDropdownReact = {
  children: React.ReactNode;
  className?: string; // Optional className override for top div element
};

/**
 * Note: exported as public Type
 */
export type WalletDropdownDisconnectReact = {
  className?: string; // Optional className override for the element
  text?: string; // Optional text override for the button
};

/**
 * Note: exported as public Type
 */
export type WalletDropdownFundLinkReact = {
  className?: string; // Optional className override for the element
  icon?: ReactNode; // Optional icon override
  openIn?: 'popup' | 'tab'; // Whether to open the funding flow in a tab or a popup window
  popupFeatures?: string; // Optional features override for the popup window if `openIn` is set to `popup`
  popupSize?: 'sm' | 'md' | 'lg'; // Size of the popup window if `openIn` is set to `popup`
  rel?: string; // Specifies the relationship between the current document and the linked document
  target?: string; // Where to open the target if `openIn` is set to tab
  text?: string; // Optional text override
};

/**
 * Note: exported as public Type
 */
export type WalletDropdownLinkReact = {
  children: string;
  className?: string; // Optional className override for the element
  href: string;
  icon?: 'wallet' & ReactNode;
  rel?: string;
  target?: string;
};

export type WindowSizes = Record<
  'sm' | 'md' | 'lg',
  {
    width: string;
    height: string;
  }
>;
