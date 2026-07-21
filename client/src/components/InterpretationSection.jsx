import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function InterpretationSection({ reading }) {
  return (
    <div className="card reading-card">
      <h2>Your Personalized Reading</h2>
      <div className="reading-body">
        <ReactMarkdown>{reading}</ReactMarkdown>
      </div>
    </div>
  );
}
