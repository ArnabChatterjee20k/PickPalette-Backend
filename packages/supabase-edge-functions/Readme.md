### About
![Product Image](./docs/Intro.avif)

Discover endless color possibilities with PickPalette – effortlessly generate palettes from images, explore diverse schemes, and soon, manage them on a dynamic dashboard. Elevate your design process with our upcoming AI suggestions and visualization tools.

- Frontend Code -> https://github.com/ArnabChatterjee20k/PickPalette-PaletteFromImage

- Live Link -> https://www.producthunt.com/posts/pickpalette
### How to setup deno for the vscode workspace?

- Deno cli must be installed first
- Then install the deno offical vscode extension
- Then enable by typing deno: on the command palette(ctrl+p)

### Running Migrations using Drizzle Kit in Supabase Table
```
npm run generate
```
```
npm run migrate
```
- Then follow this
![Applying Migration Image](./docs/SupabaseAuthTableReference.jpeg)

- We need to follow this for referencing the auth table
- Auth table is generated automatically by supabase
- We can write all the properties manually in the model but we need to reference that in other tables
- So we can bare minimum schema auth and then inside it a table with a bare minimum fields we require for reference in other table
- Now after the generate command, a sql file will be generated but if we run that we will get error as the auth schema is alread present
- So change this
```
CREATE SCHEMA "auth";
```
To this
```
CREATE SCHEMA IF NOT EXISTS "auth";
```

### reseting the db
```
sudo npx supabase db reset
```

### How to start the scraper

```
    npm run start:db
```

```
    npm run start:scraper
```