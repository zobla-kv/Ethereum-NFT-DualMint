import React from 'react';
import styles from './Spinner.module.css';

interface Props {
  size?: number;
  className?: string;
}

const Spinner: React.FC<Props> = ({ size = 20, className = '' }) => {
  return (
    <div
      className={`spinner ${styles.spinner} ${className}`}
      style={{ '--spinner-size': `${size}px` } as React.CSSProperties}
    />
  );
};

export default Spinner;
