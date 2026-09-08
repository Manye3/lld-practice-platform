import React from 'react';
import '../App.css';

const LoadingSpinner = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
