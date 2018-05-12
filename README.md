# Ovo tech test - Tariff comparison

## Pre-built executables located in the `dist` directory for your convenience

```
./dist/usage greener-energy power 40
./dist/cost 2000 2300
```

## Or roll your own

Requires [Node.js 8.11.1](https://nodejs.org/en/download/) and npm 6 (which you'll get when you download node)

Install dependencies with `npm install`

Run tests with `npm test`

Generate executables in `dist/` directory with `npm run build`


## Things that I might improve on given more time

* Certainly if there were going to be more people than just myself working on this, I'd set up some code linting with eslint
* It occurs to me that the detail of my unit tests are difficult to understand at a glance. They are valid according to my by-hand calculations, but coming back to it in a few months time, I'd find I just had to trust that my original calculations were correct to know that the program was correct. With this in mind, perhaps the mock price data could be changed to include simpler, rounder numbers to make understanding easier. Making these more artificial, however, draws the tests further away from reality, and might result in problems, e.g., would I have noticed I'd forgotten to round to 2 decimal places if I was only testing with round numbers? Hmm, so maybe ideally I'd have tests with realistic _and_ very simplified data.
