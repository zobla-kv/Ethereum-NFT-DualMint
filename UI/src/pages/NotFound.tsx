import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

const NotFound = (): ReactElement => {
  return (
    <div className='flex flex-col gap-4 text-center'>
      <p className='text-5xl mt-16'>Page not found</p>
      <Link to='/'>Home page</Link>
    </div>
  );
};

export default NotFound;
