import React from 'react';
import carroImg from './logo-carro.png';

const LogoCarro = ({ className = "", style }) => {
  return (
    <img
      src={carroImg}
      alt="Logo AutoSport"
      className={className}
      style={{ 
        display: 'inline-block',
        objectFit: 'contain', 
        ...style // Aquí caerán las dimensiones que le mandes desde afuera
      }}
    />
  );
};

export default LogoCarro;