# Contributing

Thanks for helping improve the scorecard.

## Questions

A good question:

- separates teams that will succeed from teams that will struggle (that's the whole point)
- has four answers someone can pick between without arguing about wording
- describes a situation, not a feeling ("we have a written policy", not "we feel confident about governance")

Questions live in `src/data/questions.js`. Each area needs advice text for the four score bands
(0-24, 25-49, 50-74, 75-100).

If your change alters the number or order of questions, bump the state version in `src/scoring.js`.

## Use cases

Add to `src/data/usecases.js`. Keep `needs` honest. If everything needs level 3 governance, the ranking
stops meaning anything. The `first` step should be something a team could start on Monday.

## Code

No frameworks and no build step, on purpose. Run `npm test` before opening a PR. If you change the UI,
check it at phone width and in dark mode.
