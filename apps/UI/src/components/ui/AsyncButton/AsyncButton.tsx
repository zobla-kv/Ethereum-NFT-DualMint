import type { ButtonHTMLAttributes, FC, ReactElement } from 'react';
import Spinner from '../Spinner/Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  isLoading: boolean;
}

// prettier-ignore
const AsyncButton: FC<Props> = ({ text, isLoading, className = '', ...props}): ReactElement => {
  return (
    <button className={`btn-primary ${className}`} {...props}>
      {isLoading ? <Spinner className='absolute'/> : null}
      <span className={isLoading ? 'invisible' : ''}>{text}</span>
    </button>
  );
};

export default AsyncButton;
