import type { FC, MouseEvent, ReactElement } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const AuthLink: FC<LinkProps> = ({ to, children }): ReactElement => {
  const { user } = useAuth();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!user) {
      e.preventDefault();
      alert('You must be logged in to access this page.');
      return;
    }
  };

  return (
    <Link to={to} className='btn-primary' onClick={handleClick}>
      {children}
    </Link>
  );
};

export default AuthLink;
