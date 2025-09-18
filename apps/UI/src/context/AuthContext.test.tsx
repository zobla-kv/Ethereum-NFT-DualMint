import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import type { Connector } from 'wagmi';
import toast from 'react-hot-toast';

const mockConnector = { name: 'Metamask' } as Connector;
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: '0x123' })),
  useBalance: vi.fn(() => ({ data: { value: 10 } })),
  useConnect: vi.fn(() => ({
    connect: mockConnect,
    connectors: [mockConnector],
  })),
  useDisconnect: vi.fn(() => ({ disconnect: mockDisconnect })),
}));

vi.mock('react-hot-toast', () => {
  const toast = vi.fn() as any;
  toast.success = vi.fn();
  toast.error = vi.fn();
  return { default: toast };
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user with address, balance, and connectors', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toEqual({
      address: '0x123',
      balance: { value: 10 },
    });

    expect(result.current.connectors).toEqual([mockConnector]);
    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('throws if useAuth is called outside of AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('connect calls wagmi connect with connector and shows success toast', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    mockConnect.mockImplementation(
      (
        _: { connector: Connector },
        options?: { onSuccess?: () => void; onError?: () => void }
      ) => {
        options?.onSuccess?.();
      }
    );

    result.current.connect(mockConnector);
    expect(mockConnect).toHaveBeenCalledWith(
      {
        connector: mockConnector,
      },
      expect.any(Object)
    );
    expect(toast.success).toHaveBeenCalledWith('Wallet connected.');
  });

  it('disconnect calls wagmi disconnect', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    result.current.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  describe('handleConnect', () => {
    beforeEach(() => {
      vi.clearAllMocks();
      delete window.ethereum;
    });

    it('calls connect on desktop and triggers notification toast', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'Mozilla/5.0',
        configurable: true,
      });

      mockConnect.mockImplementation(
        (
          _args: { connector: Connector },
          options?: { onSuccess?: () => void; onError?: () => void }
        ) => {
          options?.onSuccess?.();
        }
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      result.current.connect(mockConnector);

      expect(mockConnect).toHaveBeenCalledWith(
        { connector: mockConnector },
        expect.any(Object)
      );

      expect(toast.success).toHaveBeenCalledWith('Wallet connected.');
    });

    it('prevents connect on mobile and shows error toast', () => {
      Object.defineProperty(window.navigator, 'userAgent', {
        value: 'iPhone',
        configurable: true,
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
      });

      result.current.connect(mockConnector);

      expect(mockConnect).not.toHaveBeenCalled();
      expect(toast).toHaveBeenCalledWith(
        'Please open this site in the MetaMask Mobile browser to connect. Other browsers are not supported.'
      );
    });
  });
});
