import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock('wagmi', () => ({
  useAccount: vi.fn(() => ({ address: '0x123' })),
  useBalance: vi.fn(() => ({ data: { value: 10 } })),
  useConnect: vi.fn(() => ({
    connect: mockConnect,
    connectors: [{ name: 'MetaMask' }],
  })),
  useDisconnect: vi.fn(() => ({ disconnect: mockDisconnect })),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides user with address and balance', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toEqual({
      address: '0x123',
      balance: { value: 10 },
    });

    expect(typeof result.current.connect).toBe('function');
    expect(typeof result.current.disconnect).toBe('function');
  });

  it('throws if useAuth is called outside of AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within an AuthProvider'
    );
  });

  it('connect calls wagmi connect', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    result.current.connect();
    expect(mockConnect).toHaveBeenCalledWith({
      connector: { name: 'MetaMask' },
    });
  });

  it('disconnect calls wagmi disconnect', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    result.current.disconnect();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
