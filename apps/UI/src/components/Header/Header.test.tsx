import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Header from './Header';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
let mockUserStatus = 'disconnected';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      address: '0x123',
      balance: { value: '10 ETH' },
      status: mockUserStatus,
    },
    connect: mockConnect,
    disconnect: mockDisconnect,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders MetaMask button when user is disconnected', () => {
    mockUserStatus = 'disconnected';
    render(<Header />);
    expect(
      screen.getByRole('button', { name: /Metamask/i })
    ).toBeInTheDocument();
  });

  it('calls connect when MetaMask button is clicked', () => {
    mockUserStatus = 'disconnected';
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Metamask/i }));
    expect(mockConnect).toHaveBeenCalledTimes(1);
  });

  it('renders Logout and Switch Chain buttons when user is connected', () => {
    mockUserStatus = 'connected';
    render(<Header />);
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Switch Chain/i })
    ).toBeInTheDocument();
  });

  it('calls disconnect when Logout is clicked', () => {
    mockUserStatus = 'connected';
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Logout/i }));
    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it('navigates home when title is clicked', () => {
    render(<Header />);
    fireEvent.click(
      screen.getByText(/Ethereum NFT DualMint/i, { selector: 'span' })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates home when Switch Chain is clicked', () => {
    mockUserStatus = 'connected';
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /Switch Chain/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
