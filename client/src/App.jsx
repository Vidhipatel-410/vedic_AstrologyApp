import React, { useState } from 'react';
import BirthForm from './components/BirthForm.jsx';
import NumerologyCard from './components/NumerologyCard.jsx';
import PlanetsTable from './components/PlanetsTable.jsx';
import InterpretationSection from './components/InterpretationSection.jsx';
import { analyzeChart } from './api.js';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (form) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeChart(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>✨ Vedic Astrology & Numerology</h1>
        <p>Enter your birth details for a real sidereal chart and a personalized reading.</p>
      </header>

      <BirthForm onSubmit={handleSubmit} loading={loading} />

      {error && <div className="error-banner">{error}</div>}

      {result && (
        <div className="results">
          <h2 className="results-heading">Results for {result.name}</h2>
          <p className="location-line">
            Born {result.dob} at {result.tob} — {result.location.displayName} (
            {result.location.timezone})
          </p>

          <NumerologyCard numerology={result.numerology} />
          <PlanetsTable chart={result.chart} />
          <InterpretationSection reading={result.reading} />
        </div>
      )}
    </div>
  );
}
