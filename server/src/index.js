import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeRouter from './routes/analyze.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', analyzeRouter);

app.listen(PORT, () => {
  console.log(`Vedic astrology server running on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      'WARNING: ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.'
    );
  }
});
