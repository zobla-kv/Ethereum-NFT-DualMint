import type { ButtonHTMLAttributes, FC, ReactElement } from 'react';
import Spinner from '../Spinner/Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading: boolean;
}

const AsyncButton: FC<Props> = ({ text, isLoading, ...props}): ReactElement => {
  return (
    <button className={`btn-primary ${isLoading ? 'loading' : ''}`} {...props}>
      {isLoading ? <Spinner /> : text}
    </button>
  );
};

export default AsyncButton;
