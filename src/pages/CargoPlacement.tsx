import React, { useState } from 'react';
import { apiService } from '../services/apiService';

const CargoPlacement = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await apiService.importContainers(file);
      setMessage('Containers Imported Successfully');
    } catch (error) {
      setMessage('Error importing containers');
    }
  };

  return (
    <div>
      <h2>Import Containers</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Import</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CargoPlacement;