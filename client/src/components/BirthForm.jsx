import React, { useState } from 'react';

export default function BirthForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    dob: '',
    tob: '',
    placeOfBirth: '',
  });

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="birth-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Priya Sharma"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="dob">Date of Birth</label>
          <input
            id="dob"
            name="dob"
            type="date"
            required
            value={form.dob}
            onChange={handleChange}
          />
        </div>

        <div className="field">
          <label htmlFor="tob">Time of Birth</label>
          <input
            id="tob"
            name="tob"
            type="time"
            required
            value={form.tob}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="placeOfBirth">Place of Birth</label>
        <input
          id="placeOfBirth"
          name="placeOfBirth"
          type="text"
          required
          placeholder="e.g. Navsari, Gujarat, India"
          value={form.placeOfBirth}
          onChange={handleChange}
        />
        <small>City, State/Region, Country — the more specific, the more accurate.</small>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Calculating your chart…' : 'Reveal My Chart'}
      </button>
    </form>
  );
}
