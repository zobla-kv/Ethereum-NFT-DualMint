import React from 'react';
import styles from './Spinner.module.css';

interface Props {
  size?: number;
}

// Spinner will stay in center of the parent container as long as it has width and height explicitly defined
const Spinner: React.FC<Props> = ({ size = 20 }) => {
  return (
    <div className='w-full h-full relative flex items-center justify-center'>
      <div
        className={styles.spinner}
        style={{ '--spinner-size': `${size}px` } as React.CSSProperties}
      />
    </div>
  );
};

export default Spinner;
