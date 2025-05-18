import 'dotenv/config';
import { loadApp } from './loaders/app';

(async () => {
  try {
    const app = await loadApp();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Application is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start the application:', error);
    process.exit(1);
  }
})();
