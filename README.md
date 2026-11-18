# BuchstaBiene

A daily German word puzzle inspired by Spelling Bee. Each puzzle provides seven letters, including one mandatory letter; players find dictionary words, earn points, and work toward the day's target.

[Play BuchstaBiene](https://buchstabiene.fuerst.one) · [Author and other projects](https://fuerst.one)

## Gameplay

- Words must contain at least four letters and include the mandatory center letter. Letters can be reused.
- Four-letter words score one point; longer words score their length. A pangram using all seven distinct letters adds seven points.
- Date-based puzzles can be revisited through the calendar, with separate solution and highscore pages.
- Guests keep progress in browser localStorage. Signed-in players save progress to PostgreSQL.
- Players can suggest dictionary changes and vote on words; amendment records track changes to affected games.

## Implementation

Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, Radix UI, PostgreSQL, Drizzle ORM, Zod, and Auth.js/NextAuth with a credentials provider.

```text
German word list -> generation utilities -> date-indexed games in PostgreSQL
                                               |
                                               v
                                      React game and scoring
                                               |
                               guest localStorage / account saved game
```

The database stores users, games and their word sets, saved progress, word votes, and dictionary amendments. Account authentication uses JWT sessions and a Drizzle adapter. Game components handle word submission, scoring feedback, progress, and solution-reveal state.

The dictionary maintenance workflow can update past puzzles and regenerate future ones. These are operator tools, rather than a background scheduler that automatically creates a new puzzle on each request.

## Local development

Requirements: Node.js, pnpm (the repository includes `pnpm-lock.yaml`), and PostgreSQL.

Create `.env.local` with a connection to a disposable development database and a locally generated Auth.js secret:

```dotenv
POSTGRES_URL=postgres://user:password@127.0.0.1:5432/buchstabiene
AUTH_SECRET=replace_with_a_random_secret
```

```sh
pnpm install --frozen-lockfile
pnpm db:push
pnpm dev
```

Open [localhost:4773](http://localhost:4773). `db:push` applies the Drizzle schema to the configured database; inspect its proposed changes and use a development database.

### Puzzle data is a separate prerequisite

An empty schema is not a playable installation: the `games` table needs dated puzzles and their word sets. The repository includes dictionary files under `scripts/data` and generation/insertion helpers under `scripts/utils`, but does not currently provide a complete working seed command.

The `db:seed` and `db:migrate` package scripts point to `scripts/seed.ts` and `scripts/migrate.ts`, which are absent from this checkout. They should not be treated as working setup steps. `drizzle/migrate.ts` is a separate historical entrypoint, not a validated replacement for those scripts. For a fresh local database, use the schema push above and prepare puzzle data separately.

`scripts/updateGamesFromDbAmendments.ts` defaults to a dry run. Applying that workflow can replace future games and alter affected saved-game data; review it and back up the target database before enabling writes.

## Source map

| Path                               | Responsibility                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `src/app/spielen`                  | Daily game, history, solutions, and highscores routes                          |
| `src/components/Game`              | Word input, scoring, progress, local/account save state, and amendment notices |
| `src/server/api`                   | Authentication, games, saved progress, dictionary amendments, and word votes   |
| `src/server/db/schema.ts`          | PostgreSQL schema and relations                                                |
| `src/auth.ts`                      | Credentials authentication, JWT sessions, and Drizzle adapter                  |
| `scripts/data` and `scripts/utils` | Dictionary input and puzzle generation/maintenance                             |

## Build and checks

```sh
pnpm lint
pnpm build
pnpm start
```

The production server uses Next.js's default port unless `PORT` is set. The repository does not currently define an automated test script. Database contents and authentication configuration are required for the complete application workflow.

## Project context

Created as a personal German-language word game by [Alexander Fürst](https://fuerst.one). This repository contains the game implementation and its dictionary tooling.
