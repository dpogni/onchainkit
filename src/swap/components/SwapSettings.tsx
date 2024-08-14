import { isValidElement, useMemo } from 'react';
import { SwapSettingsSvg } from '../../internal/svg/swapSettings';
import { cn } from '../../styles/theme';
import type { SwapSettingsReact } from '../types';

export function SwapSettings({
  className,
  icon,
  title = 'Auto',
}: SwapSettingsReact) {
  const iconSvg = useMemo(() => {
    if (icon === undefined) {
      return SwapSettingsSvg;
    }
    if (isValidElement(icon)) {
      return icon;
    }
  }, [icon]);

  return (
    <div
      className={cn('flex w-full items-center justify-between', className)}
      data-testid="ockSwapSettings_Settings"
    >
      <div className="flex items-center space-x-1">
        <h4 className="font-medium text-base">{title}</h4>
        <button
          type="button"
          aria-label="Toggle swap settings"
          className="rounded-full p-2 opacity-50 transition-opacity hover:opacity-100"
        >
          {iconSvg}
        </button>
      </div>
    </div>
  );
}
