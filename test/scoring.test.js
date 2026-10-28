import assert from "node:assert/strict";
import { test } from "node:test";

import { DIMENSIONS, FUNCTIONS } from "../src/data/questions.js";
import { USE_CASES } from "../src/data/usecases.js";
import {
  decodeState,
  dimensionScores,
  encodeState,
  evaluate,
  levelFor,
  overallScore,
  QUESTION_COUNT,
  rankUseCases,
  toMarkdown,
} from "../src/scoring.js";

const allIds = DIMENSIONS.flatMap((d) => d.questions.map((q) => q.id));
const answerAll = (v) => Object.fromEntries(allIds.map((id) => [id, v]));

test("question bank is well formed", () => {
  assert.equal(QUESTION_COUNT, 18);
  assert.equal(new Set(allIds).size, allIds.length, "question ids must be unique");
  for (const d of DIMENSIONS) {
    assert.equal(d.advice.length, 4, `${d.id} needs advice for 4 bands`);
    for (const q of d.questions) assert.equal(q.options.length, 4, `${q.id} needs 4 options`);
  }
});

test("use cases reference real dimensions and functions", () => {
  const dims = new Set(DIMENSIONS.map((d) => d.id));
  const fns = new Set(FUNCTIONS.map((f) => f.id));
  for (const uc of USE_CASES) {
    for (const [k, v] of Object.entries(uc.needs)) {
      assert.ok(dims.has(k), `${uc.id}: unknown dimension ${k}`);
      assert.ok(v >= 0 && v <= 3, `${uc.id}: need out of range`);
    }
    for (const f of uc.fn) assert.ok(fns.has(f), `${uc.id}: unknown function ${f}`);
    assert.ok(uc.value >= 1 && uc.value <= 5);
  }
});

test("scores run from 0 to 100", () => {
  assert.equal(overallScore(dimensionScores(answerAll(0))), 0);
  assert.equal(overallScore(dimensionScores(answerAll(3))), 100);
  const dims = dimensionScores({ s1: 3, s2: 0, s3: 0 });
  assert.equal(dims.strategy, 33);
  assert.equal(dims.data, null);
});

test("levels have the right boundaries", () => {
  assert.equal(levelFor(0).name, "Exploring");
  assert.equal(levelFor(24).name, "Exploring");
  assert.equal(levelFor(25).name, "Experimenting");
  assert.equal(levelFor(74).name, "Ready to pilot");
  assert.equal(levelFor(100).name, "Ready to scale");
});

test("a mature organisation fits everything; a new one is told what blocks it", () => {
  const strong = rankUseCases(dimensionScores(answerAll(3)));
  assert.ok(strong.every((u) => u.fit === 1 && u.blockers.length === 0));
  const weak = rankUseCases(dimensionScores(answerAll(0)));
  assert.ok(weak.every((u) => u.fit < 1));
  assert.ok(weak.some((u) => u.blockers.length > 0));
});

test("chosen teams and industry change the ranking", () => {
  const dims = dimensionScores(answerAll(2));
  const finance = rankUseCases(dims, { functions: ["finance"] }).slice(0, 3);
  assert.ok(finance.every((u) => u.fn.includes("finance")), finance.map((u) => u.id).join());
  const semi = rankUseCases(dims, { functions: ["eng"], industry: "Semiconductors & high-tech" });
  assert.equal(semi[0].id, "release-status");
});

test("state survives a round trip through the URL", () => {
  const s = { industry: "Education", functions: ["support", "hr"], answers: { ...answerAll(1), s1: 3, e3: 0 } };
  const back = decodeState("#" + encodeState(s));
  assert.equal(back.industry, s.industry);
  assert.deepEqual(back.functions.sort(), s.functions.sort());
  assert.deepEqual(back.answers, s.answers);
});

test("partial and bad hashes are handled", () => {
  const back = decodeState(encodeState({ answers: { s1: 2 } }));
  assert.deepEqual(back.answers, { s1: 2 });
  assert.equal(back.industry, "");
  assert.equal(decodeState("#garbage"), null);
  assert.equal(decodeState(""), null);
});

test("markdown export includes the essentials", () => {
  const s = { industry: "Telecom", functions: [], answers: answerAll(2) };
  const md = toMarkdown(s, evaluate(s));
  assert.match(md, /Overall: 67\/100 \(Ready to pilot\)/);
  assert.match(md, /Industry: Telecom/);
  assert.match(md, /## Where to start/);
});
