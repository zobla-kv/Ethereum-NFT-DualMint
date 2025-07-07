import type { FC, MouseEventHandler, ReactElement } from 'react';

interface ButtonProps {
  text: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<ButtonProps> = ({ text, ...props }): ReactElement => {
  return (
    <button className='btn-primary' {...props}>
      {text}
    </button>
  );
};

export default Button;
