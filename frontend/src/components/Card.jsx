import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`text-xl font-semibold ${className}`}>
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent };