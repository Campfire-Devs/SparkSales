# SparkSales

SparkSales is a student Entrepreneurship Day financial dashboard for recording sales and expenses, calculating gross profit, SparkSales 5% commission, and net profit.

## Development

```bash
npm install
npm run dev
```

## CI

GitHub Actions runs `npm ci`, ESLint, and the production build for pull requests into `develop`.

## Team workflow

`feature/*` → Pull Request → `develop` → release PR → `main`

## Notes

The application currently uses browser localStorage for its development template data. Replace this with the production backend when authentication/database work is introduced.
