import { app } from './app.ts';
import { config } from './config.ts';

const server = app.listen(config.port, () => {
  console.log(`E-Pass API server running on http://localhost:${config.port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());