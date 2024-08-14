import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SwapSettings } from './SwapSettings';

describe('SwapSettings', () => {
  it('renders with default title', () => {
    render(<SwapSettings />);
    expect(screen.getByText('Auto')).toBeInTheDocument();
  });

  it('renders with custom title', () => {
    render(<SwapSettings title="Custom" />);
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('renders custom icon when provided', () => {
    const CustomIcon = () => (
      <svg data-testid="custom-icon" aria-hidden="true" focusable="false">
        <title>Custom Icon</title>
      </svg>
    );
    render(<SwapSettings icon={<CustomIcon />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('applies correct classes to the button', () => {
    render(<SwapSettings />);
    const button = screen.getByRole('button', {
      name: /toggle swap settings/i,
    });
    expect(button).toHaveClass(
      'rounded-full p-2 opacity-50 transition-opacity hover:opacity-100',
    );
  });
});
