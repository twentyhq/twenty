
# Twenty-Website 
This  used for the marketing website (twenty.com).
This is not related in anyway to the main app, which you can find in twenty-front and twenty-server. 


## Getting Started

We're using Next.JS

Copy the .env.example file to .env and fill in the values.

Run the migrations:
```bash
npx nx run twenty-website:database:migrate
```

From the root directory:
```bash
npx nx run twenty-website:dev
```
Then open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Or to build in prod:
```bash
npx nx run twenty-website:build
npx nx run twenty-website:start
```