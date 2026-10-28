import { DIMENSIONS, FUNCTIONS, INDUSTRIES } from "./data/questions.js";
import { decodeState, encodeState, evaluate, QUESTION_COUNT, toMarkdown } from "./scoring.js";

const app = document.getElementById("app");
const bar = document.getElementById("bar");

const state = { industry: "", functions: [], answers: {} };
let step = 0; // 0 intro, 1 context, 2..N dimensions, N+1 results
const RESULTS = DIMENSIONS.length + 2;

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function answeredCount() {
  return Object.keys(state.answers).length;
}

function go(next) {
  step = next;
  render();
  app.focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
}

function render() {
  bar.style.width = step >= RESULTS ? "100%" : `${(answeredCount() / QUESTION_COUNT) * 100}%`;
  if (step === 0) return renderIntro();
  if (step === 1) return renderContext();
  if (step < RESULTS) return renderDimension(DIMENSIONS[step - 2], step - 1);
  return renderResults();
}

function renderIntro() {
  app.innerHTML = `
    <section class="intro">
      <h1>Is your organisation ready for AI agents?</h1>
      <p class="lede">Eighteen questions across six areas. About five minutes. You get a readiness score, the
      agent use cases most likely to work for you right now, and what to fix first.</p>
      <ul class="facts">
        <li><b>6</b> areas: use cases, data, systems, governance, platform, people</li>
        <li><b>20</b> common agent use cases ranked against your answers</li>
        <li><b>0</b> sign-ups. Nothing leaves your browser</li>
      </ul>
      <button class="btn btn--primary" id="start">Start the assessment</button>
    </section>`;
  app.querySelector("#start").onclick = () => go(1);
}

function renderContext() {
  app.innerHTML = `
    <section class="step">
      <p class="eyebrow">About you</p>
      <h2>Where would you use agents?</h2>
      <p class="muted">Optional, but it makes the use-case suggestions more relevant.</p>
      <label class="field">Industry
        <select id="industry">
          <option value="">Choose one</option>
          ${INDUSTRIES.map((i) => `<option ${i === state.industry ? "selected" : ""}>${esc(i)}</option>`).join("")}
        </select>
      </label>
      <fieldset class="field">
        <legend>Teams in scope</legend>
        <div class="chips">
          ${FUNCTIONS.map(
            (f) => `<label class="chip"><input type="checkbox" value="${f.id}" ${state.functions.includes(f.id) ? "checked" : ""}><span>${esc(f.name)}</span></label>`,
          ).join("")}
        </div>
      </fieldset>
      ${nav(0, "Next")}
    </section>`;
  app.querySelector("#industry").onchange = (e) => (state.industry = e.target.value);
  app.querySelectorAll(".chip input").forEach((cb) => {
    cb.onchange = () => {
      state.functions = [...app.querySelectorAll(".chip input:checked")].map((x) => x.value);
    };
  });
  bindNav();
}

function renderDimension(dim, n) {
  app.innerHTML = `
    <section class="step">
      <p class="eyebrow">Area ${n} of ${DIMENSIONS.length}</p>
      <h2>${esc(dim.name)}</h2>
      <p class="muted">${esc(dim.blurb)}</p>
      ${dim.questions
        .map(
          (q, qi) => `
        <fieldset class="question">
          <legend><span class="qn">${qi + 1}</span>${esc(q.text)}</legend>
          <div class="options">
            ${q.options
              .map(
                (opt, oi) => `
              <label class="option">
                <input type="radio" name="${q.id}" value="${oi}" ${state.answers[q.id] === oi ? "checked" : ""}>
                <span>${esc(opt)}</span>
              </label>`,
              )
              .join("")}
          </div>
        </fieldset>`,
        )
        .join("")}
      ${nav(step - 1, step === RESULTS - 1 ? "See my results" : "Next")}
      <p class="hint" id="hint" hidden>Answer all three questions to continue. Pick the closest match; "we don't know" is a fine answer.</p>
    </section>`;
  app.querySelectorAll('input[type="radio"]').forEach((r) => {
    r.onchange = () => {
      state.answers[r.name] = Number(r.value);
      bar.style.width = `${(answeredCount() / QUESTION_COUNT) * 100}%`;
      app.querySelector("#hint").hidden = true;
    };
  });
  bindNav(() => {
    const done = dim.questions.every((q) => Number.isInteger(state.answers[q.id]));
    if (!done) {
      app.querySelector("#hint").hidden = false;
      const first = dim.questions.find((q) => !Number.isInteger(state.answers[q.id]));
      app.querySelector(`input[name="${first.id}"]`).focus();
    }
    return done;
  });
}

function nav(back, nextLabel) {
  return `<div class="nav">
    <button class="btn btn--ghost" data-back="${back}">Back</button>
    <button class="btn btn--primary" data-next>${esc(nextLabel)}</button>
  </div>`;
}

function bindNav(canContinue = () => true) {
  app.querySelector("[data-back]").onclick = (e) => go(Number(e.currentTarget.dataset.back));
  app.querySelector("[data-next]").onclick = () => {
    if (!canContinue()) return;
    if (step + 1 === RESULTS) history.replaceState(null, "", `#${encodeState(state)}`);
    go(step + 1);
  };
}

function bandClass(score) {
  if (score >= 75) return "b4";
  if (score >= 50) return "b3";
  if (score >= 25) return "b2";
  return "b1";
}

function renderResults() {
  const r = evaluate(state);
  app.innerHTML = `
    <section class="results">
      <div class="score-card">
        <div class="dial ${bandClass(r.overall)}" style="--v:${r.overall}">
          <span class="dial__num">${r.overall}</span><span class="dial__of">/100</span>
        </div>
        <div>
          <p class="eyebrow">Your readiness</p>
          <h1>${esc(r.level.name)}</h1>
          <p>${esc(r.level.text)}</p>
        </div>
      </div>

      <h2>By area</h2>
      <ul class="bars">
        ${DIMENSIONS.map(
          (d) => `
          <li>
            <span class="bars__name">${esc(d.name)}</span>
            <span class="bars__track"><span class="bars__fill ${bandClass(r.dims[d.id])}" style="width:${r.dims[d.id]}%"></span></span>
            <span class="bars__val">${r.dims[d.id]}</span>
          </li>`,
        ).join("")}
      </ul>

      <h2>Where to start</h2>
      <p class="muted">The use cases most likely to succeed with what you have today, weighed by typical value${state.functions.length ? " and the teams you picked" : ""}.</p>
      <ol class="cases">
        ${r.useCases
          .map(
            (u) => `
          <li class="case">
            <div class="case__head">
              <h3>${esc(u.name)}</h3>
              <span class="fit ${u.fit >= 0.9 ? "fit--good" : u.fit >= 0.7 ? "fit--ok" : "fit--low"}">${u.fit >= 0.9 ? "Good fit now" : u.fit >= 0.7 ? "Close" : "Needs groundwork"}</span>
            </div>
            <p>${esc(u.what)}</p>
            ${u.blockers.length ? `<p class="blockers">Shore up first: ${u.blockers.map(esc).join(", ")}</p>` : ""}
            <p class="first"><b>First step:</b> ${esc(u.first)}</p>
          </li>`,
          )
          .join("")}
      </ol>

      <h2>Fix these first</h2>
      <ul class="steps">
        ${r.steps.map((s) => `<li><b>${esc(s.name)}</b> <span class="muted">(${s.score}/100)</span><p>${esc(s.advice)}</p></li>`).join("")}
      </ul>

      <div class="actions">
        <button class="btn btn--primary" id="copy">Copy link to these results</button>
        <button class="btn btn--ghost" id="md">Download as Markdown</button>
        <button class="btn btn--ghost" id="print">Print / save as PDF</button>
        <button class="btn btn--ghost" id="edit">Change answers</button>
      </div>
      <p class="muted small" id="copied" role="status"></p>
    </section>`;

  app.querySelector("#copy").onclick = async () => {
    const url = location.href.split("#")[0] + "#" + encodeState(state);
    const msg = app.querySelector("#copied");
    try {
      await navigator.clipboard.writeText(url);
      msg.textContent = "Link copied. Anyone with it sees these results; nothing is stored on a server.";
    } catch {
      msg.textContent = url;
    }
  };
  app.querySelector("#md").onclick = () => {
    const blob = new Blob([toMarkdown(state, r)], { type: "text/markdown" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "agent-readiness.md" });
    a.click();
    URL.revokeObjectURL(a.href);
  };
  app.querySelector("#print").onclick = () => window.print();
  app.querySelector("#edit").onclick = () => go(2);
}

// Open straight onto results when the URL carries a complete set of answers.
const shared = decodeState(location.hash);
if (shared) {
  Object.assign(state, shared);
  if (answeredCount() === QUESTION_COUNT) step = RESULTS;
}
render();
