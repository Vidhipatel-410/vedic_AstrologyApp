import React from 'react';

export default function PlanetsTable({ chart }) {
  return (
    <div className="card">
      <h2>Birth Chart (Kundli)</h2>
      <p className="ascendant-line">
        <strong>Ascendant (Lagna):</strong> {chart.ascendant.sign} &middot; Nakshatra{' '}
        {chart.ascendant.nakshatra}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Planet</th>
              <th>Sign</th>
              <th>House</th>
              <th>Degree</th>
              <th>Nakshatra</th>
              <th>Pada</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {chart.planets.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td>{p.sign}</td>
                <td>{p.house}</td>
                <td>{p.degreeInSign}°</td>
                <td>{p.nakshatra}</td>
                <td>{p.pada}</td>
                <td>{p.retrograde ? <span className="retro">R</span> : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <small>
        Sidereal positions (Lahiri ayanamsa), Whole-Sign house system — the standard for
        traditional Vedic (Jyotish) astrology.
      </small>
    </div>
  );
}
