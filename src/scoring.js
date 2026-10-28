// Pure scoring logic. No DOM in here so it can be tested with `node --test`.

import { DIMENSIONS, FUNCTIONS, INDUSTRIES, LEVELS } from "./data/questions.js";
import { USE_CASES } from "./data/usecases.js";

export const QUESTION_COUNT = DIMENSIONS.reduce((n, d) => n + d.questions.length, 0);

/** answers: { questionId: 0..3 } -> { dimId: 0..100 } (null if unanswered) */
export function dimensionScores(answers) {
  const out = {};
  for (const dim of DIMENSIONS) {
    const vals = dim.questions.map((q) => answers[q.id]).filter((v) => Number.isInteger(v));
    out[dim.id] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 3)) * 100) : null;
  }
  return out;
}

export function overallScore(dims) {
  const vals = Object.values(dims).filter((v) => v !== null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}

export function levelFor(score) {
  return [...LEVELS].reverse().find((l) => score >= l.min);
}

/** Score 0-100 -> level 0-3 on the same scale as use-case needs. */
const toLevel = (score) => ((score ?? 0) / 100) * 3;

/**
 * Rank use cases for this organisation.
 * fit       = how much of what the use case needs is already in place (0-1)
 * relevance = 1 if it's in a function they chose (or they chose none), else 0.35
 * boost     = 1.15 if the industry matches
 */
export function rankUseCases(dims, { functions = [], industry = "" } = {}) {
  return USE_CASES.map((uc) => {
    const needs = Object.entries(uc.needs);
    const totalNeed = needs.reduce((n, [, v]) => n + v, 0) || 1;
    const gaps = needs
      .map(([dim, need]) => ({ dim, gap: Math.max(0, need - toLevel(dims[dim])) }))
      .filter((g) => g.gap > 0);
    const fit = 1 - gaps.reduce((n, g) => n + g.gap, 0) / totalNeed;
    const relevance = functions.length === 0 || uc.fn.some((f) => functions.includes(f)) ? 1 : 0.35;
    const boost = uc.industries?.includes(industry) ? 1.15 : 1;
    const score = (uc.value / 5) * Math.max(0, fit) * relevance * boost;
    const blockers = gaps
      .filter((g) => g.gap >= 0.75)
      .sort((a, b) => b.gap - a.gap)
      .map((g) => DIMENSIONS.find((d) => d.id === g.dim).name);
    return { ...uc, fit: Math.max(0, fit), relevance, score, blockers };
  }).sort((a, b) => b.score - a.score || b.value - a.value);
}

/** The weakest dimensions with the advice for their current band. */
export function nextSteps(dims, count = 3) {
  return DIMENSIONS.map((d) => ({ dim: d, score: dims[d.id] ?? 0 }))
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(({ dim, score }) => ({
      id: dim.id,
      name: dim.name,
      score,
      advice: dim.advice[Math.min(3, Math.floor(score / 25))],
    }));
}

export function evaluate(state) {
  const dims = dimensionScores(state.answers);
  const overall = overallScore(dims);
  return {
    dims,
    overall,
    level: levelFor(overall),
    useCases: rankUseCases(dims, state).slice(0, 5),
    steps: nextSteps(dims),
  };
}

// ---- Shareable state --------------------------------------------------------
// Encoded into the URL hash so results can be shared without a backend:
//   v1.<industry index>.<function bitmask>.<answers as digits, "-" for blank>

const ORDER = DIMENSIONS.flatMap((d) => d.questions.map((q) => q.id));

export function encodeState({ industry = "", functions = [], answers = {} }) {
  const ind = Math.max(0, INDUSTRIES.indexOf(industry));
  const mask = FUNCTIONS.reduce((m, f, i) => (functions.includes(f.id) ? m | (1 << i) : m), 0);
  const digits = ORDER.map((id) => (Number.isInteger(answers[id]) ? answers[id] : "-")).join("");
  return `v1.${industry ? ind : ""}.${mask.toString(36)}.${digits}`;
}

export function decodeState(str) {
  const parts = String(str || "").replace(/^#/, "").split(".");
  if (parts[0] !== "v1" || parts.length !== 4) return null;
  const [, ind, mask, digits] = parts;
  const m = parseInt(mask || "0", 36) || 0;
  const answers = {};
  ORDER.forEach((id, i) => {
    const ch = digits[i];
    if (ch >= "0" && ch <= "3") answers[id] = Number(ch);
  });
  return {
    industry: ind === "" ? "" : INDUSTRIES[Number(ind)] || "",
    functions: FUNCTIONS.filter((_, i) => m & (1 << i)).map((f) => f.id),
    answers,
  };
}

export function toMarkdown(state, result) {
  const lines = [
    "# Agent readiness scorecard",
    "",
    `**Overall: ${result.overall}/100 (${result.level.name})**`,
    "",
    result.level.text,
    "",
    "## Scores by area",
    "",
    ...DIMENSIONS.map((d) => `- ${d.name}: ${result.dims[d.id] ?? "-"}/100`),
    "",
    "## Where to start",
    "",
    ...result.useCases.map(
      (u, i) =>
        `${i + 1}. **${u.name}**: ${u.what}${u.blockers.length ? ` _Needs work first: ${u.blockers.join(", ")}._` : ""}\n   First step: ${u.first}`,
    ),
    "",
    "## Next steps",
    "",
    ...result.steps.map((s) => `- **${s.name} (${s.score}/100):** ${s.advice}`),
    "",
  ];
  if (state.industry) lines.splice(2, 0, `Industry: ${state.industry}`, "");
  return lines.join("\n");
}
