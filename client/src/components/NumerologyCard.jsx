import React from 'react';

export default function NumerologyCard({ numerology }) {
  return (
    <div className="card numerology-card">
      <h2>Numerology</h2>
      <div className="numerology-grid">
        <div className="number-block">
          <div className="number-circle">{numerology.mulank}</div>
          <div>
            <div className="number-label">Mulank (Root Number)</div>
            <p>{numerology.mulankTrait}</p>
          </div>
        </div>
        <div className="number-block">
          <div className="number-circle">{numerology.bhagyank}</div>
          <div>
            <div className="number-label">Bhagyank (Destiny Number)</div>
            <p>{numerology.bhagyankTrait}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
