import { render, screen, fireEvent } from '@testing-library/react';
import AsyncButton from './AsyncButton';

vi.mock('../Spinner/Spinner.tsx', () => ({
  default: () => <div>Spinner</div>,
}));

describe('AsyncButton', () => {
  it('renders text when isLoading is false', () => {
    render(<AsyncButton text='Click me' isLoading={false} />);

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByText('Spinner')).not.toBeInTheDocument();
  });

  it('renders Spinner when isLoading is true', () => {
    render(<AsyncButton text='Click me' isLoading={true} />);

    expect(screen.getByText('Spinner')).toBeInTheDocument();
    expect(screen.queryByText('Click me')).not.toBeInTheDocument();
  });

  it('applies "loading" class when isLoading is true', () => {
    const { container } = render(
      <AsyncButton text='Click me' isLoading={true} />
    );
    const button = container.querySelector('button');

    expect(button).toHaveClass('loading');
  });

  it('does not have "loading" class when isLoading is false', () => {
    const { container } = render(
      <AsyncButton text='Click me' isLoading={false} />
    );
    const button = container.querySelector('button');

    expect(button).not.toHaveClass('loading');
  });

  it('spreads extra props correctly', () => {
    const handleClick = vi.fn();
    render(
      <AsyncButton
        text='Click me'
        isLoading={false}
        disabled
        onClick={handleClick}
        type='submit'
      />
    );

    const button = screen.getByText('Click me') as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.type).toBe('submit');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
