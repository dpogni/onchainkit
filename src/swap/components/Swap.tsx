import { Children, useMemo } from 'react';
import { findComponent } from '../../internal/utils/findComponent';
import { background, cn, text } from '../../styles/theme';
import type { SwapReact } from '../types';
import { SwapAmountInput } from './SwapAmountInput';
import { SwapButton } from './SwapButton';
import { SwapMessage } from './SwapMessage';
import { SwapProvider } from './SwapProvider';
import { SwapSettings } from './SwapSettings';
import { SwapToggleButton } from './SwapToggleButton';

export function Swap({
  address,
  experimental = { useAggregator: true },
  children,
  title = 'Swap',
  className,
}: SwapReact) {
  const { inputs, toggleButton, swapButton, swapMessage, swapSettings } =
    useMemo(() => {
      const childrenArray = Children.toArray(children);
      return {
        inputs: childrenArray.filter(findComponent(SwapAmountInput)),
        toggleButton: childrenArray.find(findComponent(SwapToggleButton)),
        swapButton: childrenArray.find(findComponent(SwapButton)),
        swapMessage: childrenArray.find(findComponent(SwapMessage)),
        swapSettings: childrenArray.find(findComponent(SwapSettings)),
      };
    }, [children]);

  return (
    <SwapProvider address={address} experimental={experimental}>
      <div
        className={cn(
          background.default,
          'flex w-[500px] flex-col rounded-xl px-6 pt-6 pb-4',
          className,
        )}
        data-testid="ockSwap_Container"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3
            className={cn(text.title3, 'text-inherit')}
            data-testid="ockSwap_Title"
          >
            {title}
          </h3>
          <div className="flex justify-end">{swapSettings}</div>
        </div>
        {inputs[0]}
        <div className="relative h-1">{toggleButton}</div>
        {inputs[1]}
        {swapButton}
        <div className="flex">{swapMessage}</div>
      </div>
    </SwapProvider>
  );
}
