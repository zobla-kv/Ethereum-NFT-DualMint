import { render, screen, fireEvent } from '@testing-library/react';
import AsyncButton from './AsyncButton';

vi.mock('../Spinner/Spinner.tsx', () => ({
  default: () => <div>Spinner</div>,
}));

describe('AsyncButton', () => {
  it('renders text when isLoading is false', () => {
    render(<AsyncButton text="Click me" isLoading={false} />);

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByText('Spinner')).not.toBeInTheDocument();
  });

  it('renders Spinner and makes text invisible when isLoading is true', () => {
    render(<AsyncButton text="Click me" isLoading={true} />);

    expect(screen.getByText('Spinner')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).toHaveClass('invisible');
  });

  it('spreads extra props correctly', () => {
    const handleClick = vi.fn();
    render(
      <AsyncButton
        text="Click me"
        isLoading={false}
        disabled
        onClick={handleClick}
        type="submit"
      />
    );

    const button = screen.getByRole('button', {
      name: 'Click me',
    }) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.type).toBe('submit');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
