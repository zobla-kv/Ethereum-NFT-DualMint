import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import Header from './Header';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      address: '0x123',
      balance: { value: '10 ETH' },
    },
    connect: mockConnect,
    disconnect: mockDisconnect,
  }),
}));

vi.mock('./ThemeToggle/ThemeToggle', () => ({
  default: () => <div data-testid='theme-toggle'>ThemeToggle</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user address and balance', () => {
    render(<Header />);
    expect(screen.getByText(/address: 0x123/i)).toBeInTheDocument();
    expect(screen.getByText(/balance: 10 ETH/i)).toBeInTheDocument();
  });

  it('renders MetaMask button', () => {
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /MetaMask/i })
    ).toBeInTheDocument();
  });

  it('calls connect when MetaMask button is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /MetaMask/i }));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('calls disconnect when Logout button is clicked', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('renders ThemeToggle', () => {
    render(<Header />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });
});
