import type { ButtonHTMLAttributes, FC, ReactElement } from 'react';
import Spinner from '../Spinner/Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading: boolean;
}

// prettier-ignore
const AsyncButton: FC<Props> = ({ text, isLoading, className = '', ...props}): ReactElement => {
  return (
    <button className={`btn-primary ${isLoading ? 'loading' : ''} ${className}`} {...props}>
      {isLoading ? <Spinner /> : text}
    </button>
  );
};

export default AsyncButton;
