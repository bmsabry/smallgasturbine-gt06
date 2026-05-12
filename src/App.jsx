import { useEffect, useMemo, useRef, useState } from "react";
import * as auth from "./auth";
import * as P from "./progress";
import * as api from "./api.js";
import { COURSE_META, SECTIONS, SUMMATIVE, REFERENCE_ENGINE, findConcept } from "./content.js";
import Instructor from "./instructor.jsx";

const CONTACT_EMAIL = "info@proreadyengineer.com";
const MODULE_ID = "gt-05";

// ─────────────────────────────────────────────────────────────────────────
// Top-level state machine
//   "login"     — auth gate
//   "checking"  — fetching access status
//   "accept"    — handling ?token=xxx invitation URL
//   "awaiting"  — signed in but not enrolled
//   "needs"     — needs-analysis intake
//   "overview"  — module landing page
//   "section"   — drill into a section
//   "calculator", "quiz", "dashboard", "instructor" — auxiliary views
// ─────────────────────────────────────────────────────────────────────────

function getUrlToken() {
  try {
    const u = new URL(window.location.href);
    return u.searchParams.get("token");
  } catch { return null; }
}

function clearUrlToken() {
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("token");
    const newPath = u.pathname + (u.searchParams.toString() ? "?" + u.searchParams.toString() : "");
    window.history.replaceState({}, "", newPath);
  } catch {}
}

export default function App() {
  const [user, setUser] = useState(auth.getCachedUser());
  const [view, setView] = useState("login");
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [progress, setProgressLocal] = useState(null);
  const [access, setAccess] = useState(null); // {enrolled, has_pending_invitation, is_admin}
  const [bootError, setBootError] = useState(null);
  // remember the invitation token across the auth flow
  const pendingToken = useRef(getUrlToken());

  // refresh /me on mount to validate the stored token
  useEffect(() => {
    let cancelled = false;
    if (auth.getToken()) {
      auth.fetchMe()
        .then((me) => { if (!cancelled) setUser(me); })
        .catch(() => { auth.clearAuth(); if (!cancelled) setUser(null); });
    }
    return () => { cancelled = true; };
  }, []);

  // When user changes, decide where to go
  useEffect(() => {
    if (!user) { setView("login"); return; }
    (async () => {
      setView("checking");
      // If there's a pending invitation token in the URL, try to accept it first.
      if (pendingToken.current) {
        try {
          await api.acceptInvitation(pendingToken.current);
        } catch (e) {
          setBootError(e.message || String(e));
          pendingToken.current = null;
          clearUrlToken();
          // Continue to access check regardless — they might still be enrolled.
        }
        if (!bootError) {
          pendingToken.current = null;
          clearUrlToken();
        }
      }
      let a;
      try { a = await api.getAccess(); } catch (e) { setBootError(e.message || String(e)); return; }
      setAccess(a);
      if (!a.enrolled) {
        setView("awaiting");
        return;
      }
      // Enrolled — load progress and route to needs or overview
      try {
        const p = await P.loadProgress(user.email);
        setProgressLocal(p);
        setView(p.needs ? "overview" : "needs");
      } catch (e) {
        if (e.status === 403) {
          setView("awaiting");
        } else {
          setBootError(e.message || String(e));
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  const refreshProgress = () => setProgressLocal(P.getCached(user.email));

  if (!user) {
    return <LoginGate onSignedIn={(u) => setUser(u)} pendingToken={pendingToken.current} />;
  }

  return (
    <>
      <TopBar
        user={user}
        access={access}
        onHome={() => view !== "instructor" && setView("overview")}
        onInstructor={() => setView("instructor")}
        onSignOut={async () => {
          if (user?.email) await P.flush(user.email);
          auth.signOut();
          setUser(null);
        }}
      />
      <main className="fade-in">
        {bootError && (
          <div className="shell"><div className="card" style={{ borderColor: "var(--bad)" }}>
            <h3 style={{ color: "var(--bad)" }}>Something went wrong</h3>
            <div className="small">{bootError}</div>
            <div className="btn-row"><button className="btn btn-ghost" onClick={() => { setBootError(null); window.location.reload(); }}>Reload</button></div>
          </div></div>
        )}
        {view === "checking" && !bootError && <LoadingShell />}
        {view === "awaiting" && (
          <AwaitingAccess
            user={user}
            access={access}
            onRequestAccess={async () => { try { await api.requestAccess(); const a = await api.getAccess(); setAccess(a); } catch (e) { alert(e.message); }}}
            onOpenInstructor={() => setView("instructor")}
          />
        )}
        {view === "needs" && (
          <NeedsAnalysis
            onSubmit={(needs) => { P.recordNeeds(user.email, needs); refreshProgress(); setView("overview"); }}
          />
        )}
        {view === "overview" && progress && (
          <Overview
            progress={progress}
            onOpenSection={(sid) => { setActiveSectionId(sid); P.startSection(user.email, sid); refreshProgress(); setView("section"); }}
            onOpenCalculator={() => setView("calculator")}
            onOpenQuiz={() => setView("quiz")}
            onOpenDashboard={() => setView("dashboard")}
            onRestart={() => {
              if (window.confirm("Restart the entire module? This wipes your needs analysis, section completions, summative quiz score, and review queue. Useful for live demos.\n\nThis cannot be undone.")) {
                P.resetProgress(user.email);
                refreshProgress();
                setView("needs");
              }
            }}
            needs={progress?.needs}
          />
        )}
        {view === "section" && activeSectionId && progress && (
          <SectionView
            section={SECTIONS.find((s) => s.id === activeSectionId)}
            email={user.email}
            onProbeAnswer={(probeId, correct) => { P.recordProbe(user.email, activeSectionId, probeId, correct); refreshProgress(); }}
            onComplete={(mastered) => { P.completeSection(user.email, activeSectionId, mastered); refreshProgress(); setView("overview"); }}
            onBack={() => setView("overview")}
          />
        )}
        {view === "calculator" && (
          <Calculator onBack={() => setView("overview")} />
        )}
        {view === "quiz" && progress && (
          <Quiz onSubmit={(score, total, byItem) => { P.recordSummative(user.email, score, total, byItem); refreshProgress(); }} onBack={() => setView("overview")} />
        )}
        {view === "dashboard" && progress && (
          <Dashboard email={user.email} progress={progress} onBack={() => setView("overview")} />
        )}
        {view === "instructor" && access?.is_admin && (
          <Instructor onBack={() => setView(progress ? "overview" : "awaiting")} />
        )}
      </main>
      <Footer />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function TopBar({ user, access, onHome, onInstructor, onSignOut }) {
  return (
    <header className="topbar">
      <h1 onClick={onHome} style={{ cursor: "pointer" }}>
        <span>{COURSE_META.code}</span> — Centrifugal Compressor
        <span style={{ color: "var(--txtMuted)", fontWeight: 400, fontSize: 13, marginLeft: 10 }}>
          ProReadyEngineer · Small Jet Engine Design Training
        </span>
      </h1>
      <div className="user-chip">
        {access?.is_admin && (
          <button onClick={onInstructor} style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>
            Instructor panel
          </button>
        )}
        <span className="mono">{user.email}</span>
        <button onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer shell">
      <div>© ProReadyEngineer LLC — Proprietary course content. Do not redistribute.</div>
      <div className="dim small">Questions? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></div>
    </footer>
  );
}

function LoadingShell() {
  return (
    <div className="shell fade-in">
      <div className="card center">
        <div className="muted small">Loading your course…</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function LoginGate({ onSignedIn, pendingToken }) {
  // Default to signup when arriving via an invitation link — invited folks
  // typically don't have an account yet. They can still toggle to "Sign in"
  // via the link at the bottom if they're an existing user.
  const [mode, setMode] = useState(pendingToken ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const me = mode === "login"
        ? await auth.login(email, password)
        : await auth.signup(email, password, fullName);
      onSignedIn(me);
    } catch (ex) { setErr(ex.message || String(ex)); }
    finally { setBusy(false); }
  };

  return (
    <div className="login-shell">
      <form className="login-card fade-in" onSubmit={submit}>
        <div className="brand">
          <span>{COURSE_META.code}</span> — Centrifugal Compressor
        </div>
        <div className="tag">
          {pendingToken
            ? "You've been invited! Sign in (or create an account with the invited email) to accept."
            : (mode === "login"
              ? "Sign in with your ProReadyEngineer account to start the module."
              : "Create a free ProReadyEngineer account to begin.")}
        </div>
        {mode === "signup" && (
          <div className="field">
            <label>Full name (optional)</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="field">
          <label>Password{mode === "signup" && <span className="dim"> (min 8 chars)</span>}</label>
          <input type="password" required minLength={mode === "signup" ? 8 : undefined}
                 value={password} onChange={(e) => setPassword(e.target.value)}
                 autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </div>
        {err && <div className="err">{err}</div>}
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "..." : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <div className="footer-note center">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <a href="#" onClick={(e) => { e.preventDefault(); setErr(null); setMode(mode === "login" ? "signup" : "login"); }}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </a>
        </div>
        <div className="footer-note">
          Your ProReadyEngineer account works across <span className="mono">combustion-toolkit.proreadyengineer.com</span> and this learning module.
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function AwaitingAccess({ user, access, onRequestAccess, onOpenInstructor }) {
  return (
    <div className="shell fade-in">
      <div className="card">
        <h2>This module is by invitation only.</h2>
        <p>
          You're signed in as <span className="mono">{user.email}</span>, but this email isn't on the access list for{" "}
          <b>{COURSE_META.title}</b>.
        </p>
        {access?.has_pending_invitation && (
          <div className="probe-feedback correct">
            ✓ You have a pending invitation. Use the link in the invitation email — it activates access on click. If you've lost it, request a new one below.
          </div>
        )}
        {access?.has_pending_request ? (
          <div className="probe-feedback" style={{ background: "rgba(250,204,21,.08)", border: "1px solid rgba(250,204,21,.4)" }}>
            ⏳ Your access request has been recorded. The instructor will review it and reach out at <span className="mono">{user.email}</span>.
          </div>
        ) : (
          <p>
            If you believe you should have access (e.g. you've paid, or you're enrolled in a cohort), let the instructor know.
          </p>
        )}
        <div className="btn-row">
          {!access?.has_pending_request && (
            <button className="btn btn-primary" onClick={onRequestAccess}>Request access</button>
          )}
          <a className="btn btn-ghost" href={`mailto:${CONTACT_EMAIL}?subject=GT-05%20access%20request%20for%20${encodeURIComponent(user.email)}`}>
            Email {CONTACT_EMAIL}
          </a>
          {access?.is_admin && (
            <button className="btn btn-secondary" onClick={onOpenInstructor}>
              Open instructor panel →
            </button>
          )}
        </div>
      </div>
      <div className="card">
        <h3>What is this?</h3>
        <p className="muted small">{COURSE_META.title} is a {COURSE_META.durationMin}-minute interactive learning module from ProReadyEngineer's Small Jet Engine Design Training. It walks through impeller aerodynamics, velocity triangles, slip factor, compressor mapping, stall vs surge, and a worked KJ-66 example. Designed for engineers who want to go from "I've heard of centrifugal compressors" to "I can size and analyse one for a 700 N-class turbojet."</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function NeedsAnalysis({ onSubmit }) {
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [time, setTime] = useState("");
  const [modality, setModality] = useState("");
  const [obstacles, setObstacles] = useState("");
  const canSubmit = level && goal && time && modality;
  return (
    <div className="shell fade-in">
      <div className="card">
        <h2>Welcome — let's calibrate this module to you.</h2>
        <p className="muted">
          Five quick diagnostics. We use your answers to set the depth, pacing, and review schedule.
          You can change these later from the dashboard.
        </p>
      </div>

      <div className="card">
        <h4>Current knowledge level</h4>
        <p className="muted small">How much centrifugal-compressor aerodynamics have you already worked with?</p>
        <Choices value={level} onChange={setLevel} opts={[
          ["none", "None", "I've heard of compressors but never worked the equations."],
          ["basic", "Basic", "I've seen velocity triangles and Bernoulli; I struggle to apply them."],
          ["intermediate", "Intermediate", "I can apply Euler and slip-factor with prompting."],
          ["advanced", "Advanced", "I've sized impellers and read maps before."],
        ]} />
      </div>

      <div className="card">
        <h4>What outcome do you need?</h4>
        <p className="muted small">We'll bias examples and assessment toward this.</p>
        <Choices value={goal} onChange={setGoal} opts={[
          ["exam", "Pass an exam", "Heavy on definitions, formulas, and short-answer items."],
          ["apply", "Apply at work", "Heavy on design workflow and worked examples."],
          ["general", "General understanding", "Balanced — concepts plus light application."],
          ["teach", "Teach others", "We'll emphasise misconceptions and explanation quality."],
        ]} />
      </div>

      <div className="card">
        <h4>How much time can you commit?</h4>
        <Choices value={time} onChange={setTime} opts={[
          ["quick", "Quick overview", "~30 min — skim cards, do one quiz."],
          ["deep", "Deep study", "2–4 hr — full module with all probes."],
          ["ongoing", "Ongoing", "Spaced reviews over weeks."],
        ]} />
      </div>

      <div className="card">
        <h4>Preferred delivery</h4>
        <p className="muted small">We adapt the mix; you can override per section.</p>
        <Choices value={modality} onChange={setModality} opts={[
          ["reading", "Reading / writing", "Detailed text, outlines, rephrasing prompts."],
          ["visual", "Visual", "Diagrams, charts, structured layouts."],
          ["auditory", "Auditory", "Conversational explanations and verbal walkthroughs."],
          ["kinesthetic", "Hands-on", "Short content blocks followed immediately by exercises."],
        ]} />
      </div>

      <div className="card">
        <h4>Any obstacles?</h4>
        <p className="muted small">Optional — gaps in prerequisites, anxiety, time constraints. We don't share this.</p>
        <div className="field">
          <textarea value={obstacles} onChange={(e) => setObstacles(e.target.value)} placeholder="e.g. shaky on Bernoulli, only have 20 min/day, etc." />
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" disabled={!canSubmit} onClick={() => onSubmit({ level, goal, time, modality, obstacles })}>
            Start the module →
          </button>
        </div>
      </div>
    </div>
  );
}

function Choices({ value, onChange, opts }) {
  return (
    <div className="probe-opts" style={{ marginTop: 4 }}>
      {opts.map(([id, label, desc]) => (
        <label key={id} className="probe-opt" style={{ cursor: "pointer", borderColor: value === id ? "var(--accent)" : undefined, background: value === id ? "rgba(0,212,255,.06)" : undefined }}>
          <input type="radio" checked={value === id} onChange={() => onChange(id)} />
          <div>
            <div style={{ fontWeight: 600 }}>{label}</div>
            <div className="muted small">{desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Overview({ progress, onOpenSection, onOpenCalculator, onOpenQuiz, onOpenDashboard, onRestart, needs }) {
  const completedSet = useMemo(() => new Set(Object.keys(progress?.sectionState || {}).filter(sid => progress.sectionState[sid].completedAt)), [progress]);

  const isAvailable = (idx) => {
    if (idx === 0) return true;
    const prev = SECTIONS[idx - 1];
    return completedSet.has(prev.id);
  };

  const completed = completedSet.size;
  let probeCorrect = 0, probeTotal = 0;
  for (const sid of Object.keys(progress?.sectionState || {})) {
    const ss = progress.sectionState[sid];
    for (const pid of Object.keys(ss.probeAttempts || {})) {
      const arr = ss.probeAttempts[pid];
      if (arr && arr.length) { probeTotal++; if (arr.includes(true)) probeCorrect++; }
    }
  }
  const accuracy = probeTotal ? Math.round((probeCorrect / probeTotal) * 100) : null;
  const pct = Math.round((completed / SECTIONS.length) * 100);

  return (
    <div className="shell fade-in">
      <div className="card">
        <h2>{COURSE_META.title}</h2>
        <div className="muted">{COURSE_META.subtitle} · {COURSE_META.durationMin} min · {SECTIONS.length} sections</div>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
        <div className="tiny muted">{completed} of {SECTIONS.length} sections complete · {pct}%</div>
        {needs && (
          <div className="muted small" style={{ marginTop: 10 }}>
            Tailored for: <b>{needs.level}</b> level · <b>{needs.goal}</b> goal · <b>{needs.time}</b> commitment · <b>{needs.modality}</b> delivery
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 6 }}>Learning outcomes</h3>
        <p className="muted small">By the end of this module you will be able to:</p>
        <ul>
          {COURSE_META.topLevelOutcomes.map((o, i) => (
            <li key={i}><b>{o.verb}</b> — {o.text}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 8 }}>Course sections</h3>
        <p className="muted small">Sections unlock progressively. Each section ends with a formative check; you must answer the probes before advancing.</p>
        <div className="section-list">
          {SECTIONS.map((s, idx) => {
            const done = completedSet.has(s.id);
            const avail = isAvailable(idx);
            return (
              <div
                key={s.id}
                className={`section-row ${done ? "done" : avail ? "current" : ""}`}
                onClick={() => avail && onOpenSection(s.id)}
                style={{ cursor: avail ? "pointer" : "not-allowed", opacity: avail ? 1 : 0.55 }}
              >
                <div className="num">{s.number}</div>
                <div>
                  <div className="title">{s.title}</div>
                  <div className="sub">{s.subtitle}</div>
                </div>
                <div className={`status ${done ? "done" : avail ? "available" : "locked"}`}>
                  {done ? "Done" : avail ? "Open" : "Locked"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <h3>Tools</h3>
        <p className="muted small">Reach for these any time during the module.</p>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onOpenCalculator}>Worked-example calculator</button>
          <button className="btn btn-ghost" onClick={onOpenDashboard}>Progress dashboard</button>
          <button
            className="btn btn-primary"
            disabled={completed < SECTIONS.length}
            onClick={onOpenQuiz}
            title={completed < SECTIONS.length ? "Complete all sections to unlock the summative quiz" : ""}
          >
            {completed < SECTIONS.length ? `Summative quiz (locked — ${SECTIONS.length - completed} sections left)` : "Take the summative quiz"}
          </button>
          <button
            className="btn btn-ghost"
            onClick={onRestart}
            style={{ borderColor: "var(--bad)", color: "var(--bad)", marginLeft: "auto" }}
            title="Wipe all progress and re-take the needs analysis. Useful for live demos."
          >
            Restart module
          </button>
        </div>
        {accuracy !== null && (
          <div className="muted small" style={{ marginTop: 10 }}>Formative-check accuracy so far: <b style={{ color: "var(--accent)" }}>{accuracy}%</b> over {probeTotal} probes attempted.</div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function SectionView({ section, email, onProbeAnswer, onComplete, onBack }) {
  const [probeState, setProbeState] = useState({});
  const probeStat = (pid) => probeState[pid] || { selected: null, answered: false };
  const allAnswered = section.probes.every((p) => probeStat(p.id).answered);
  const correctCount = section.probes.filter((p) => probeStat(p.id).correct).length;
  const mastered = correctCount === section.probes.length;

  const handleSelect = (probe, optIdx) => {
    const st = probeStat(probe.id);
    if (st.answered) return;
    const correct = optIdx === probe.correct;
    setProbeState({ ...probeState, [probe.id]: { selected: optIdx, answered: true, correct } });
    onProbeAnswer(probe.id, correct);
  };

  const handleRetry = (probe) => {
    setProbeState({ ...probeState, [probe.id]: { selected: null, answered: false } });
  };

  return (
    <div className="shell fade-in">
      <div className="card">
        <div className="section-banner">
          <div className="num">{section.number}</div>
          <div>
            <h2>{section.title}</h2>
            <div className="sub">{section.subtitle}</div>
          </div>
        </div>
        <div>
          <h4>Learning outcomes</h4>
          <p className="muted small">By the end of this section you will be able to:</p>
          <ul>
            {section.outcomes.map((o, i) => (
              <li key={i}><b>{o.verb}</b> — {o.text}</li>
            ))}
          </ul>
        </div>
      </div>

      {section.cards.map((c, idx) => (
        <div className="card" key={c.id}>
          <h4>Concept {idx + 1} of {section.cards.length}</h4>
          <h3>{c.heading}</h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{c.body}</p>
          {c.bullets && c.bullets.length > 0 && (
            <ul>{c.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          )}
        </div>
      ))}

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Formative check</h3>
        <p className="muted small">Active recall before you advance. Mastery cycle: incorrect → reteach reading → retry. Section completes when every probe is correct.</p>
        {section.probes.map((p) => {
          const st = probeStat(p.id);
          return (
            <Probe
              key={p.id}
              probe={p}
              state={st}
              onSelect={(i) => handleSelect(p, i)}
              onRetry={() => handleRetry(p)}
            />
          );
        })}
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onBack}>← Back to overview</button>
          {allAnswered && (
            mastered ? (
              <button className="btn btn-primary" onClick={() => onComplete(true)}>
                Section mastered → continue
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => onComplete(false)} title="You can move on, but the section is flagged for review.">
                Save progress (review later) →
              </button>
            )
          )}
          {allAnswered && !mastered && (
            <span className="muted small" style={{ alignSelf: "center" }}>
              Got {correctCount}/{section.probes.length}. Re-read the relevant concept above, then click "Retry" on any incorrect probe.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Probe({ probe, state, onSelect, onRetry }) {
  const tagLabel = probe.kind || "concept";
  return (
    <div className="probe fade-in">
      <span className={`probe-tag ${tagLabel}`}>{tagLabel}</span>
      <div className="probe-stem">{probe.stem}</div>
      <div className="probe-opts">
        {probe.options.map((opt, i) => {
          const isPicked = state.selected === i;
          const isCorrect = i === probe.correct;
          let cls = "probe-opt";
          if (state.answered) {
            if (isCorrect) cls += " correct";
            else if (isPicked) cls += " incorrect";
            else cls += " dim";
          }
          return (
            <label key={i} className={cls} style={{ cursor: state.answered ? "default" : "pointer" }}>
              <input type="radio" disabled={state.answered} checked={isPicked} onChange={() => onSelect(i)} />
              <div>{opt}</div>
            </label>
          );
        })}
      </div>
      {state.answered && (
        <div className={`probe-feedback ${state.correct ? "correct" : "incorrect"}`}>
          <div>{state.correct ? "✓ Correct." : "✗ Not quite."} <strong>Explanation:</strong> {probe.explain}</div>
          {!state.correct && (
            <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={onRetry}>Retry</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Calculator({ onBack }) {
  // Combustor worked-example calculator. Mirrors the GT-06 worked example:
  // compressor exit → combustor inlet (P3) → fuel flow → air split → reference
  // area → dilution hole sizing.
  const [mDot, setMDot] = useState(0.85);
  const [T02, setT02] = useState(447.1);
  const [P02_kPa, setP02] = useState(354.6);
  const [C2, setC2] = useState(382.8);
  const [Cpr, setCpr] = useState(0.80);
  const [T4_C, setT4] = useState(950);
  const [f_dome, setFDome] = useState(0.35);
  const [dPliner_frac, setDPliner] = useState(0.04);
  const [Vref, setVref] = useState(5);
  const [Vpass, setVpass] = useState(40);
  const [D2_mm, setD2] = useState(103.9);
  const [Ymax_frac, setYmaxFrac] = useState(0.30); // target penetration as fraction of H_dome
  const [n_big_in, setNBig] = useState(7); // for the rounding step

  const k = 1.4, R = 287, cp_g = 1150, LHV = 43e6, eta_b = 0.98, FAR_st = 0.0667;
  const T4_K = T4_C + 273.15;

  // Step 1 — Recover P3 from rotor exit
  const T2_K = T02 - (C2 * C2) / (2 * cp_g);  // approx static T from total T and C
  const P02 = P02_kPa * 1000;
  const P2 = P02 / Math.pow(T02 / Math.max(T2_K, 1), k / (k - 1));
  const rho2 = P2 / (R * Math.max(T2_K, 1));
  const q2 = 0.5 * rho2 * C2 * C2;
  const dP_rec = Cpr * q2;
  const P3 = P2 + dP_rec; // Pa
  const P3_over_P02 = P3 / P02;

  // Step 2 — Fuel flow from T4 target
  const dT = T4_K - T02;
  const FAR = (cp_g * dT) / (eta_b * LHV - cp_g * dT);
  const mDot_fuel = FAR * mDot;
  const mDot_dome = f_dome * mDot;
  const mDot_pass = mDot - mDot_dome;
  const phi_primary = (mDot_fuel / Math.max(mDot_dome, 1e-9)) / FAR_st;

  // Step 3 — Dome split, reference area, dome height
  const P_dome = P3 * (1 - dPliner_frac);
  const T_air = T02 * Math.pow(P_dome / P02, (k - 1) / k);
  const rho_dome = P_dome / (R * Math.max(T_air, 1));
  const Aref = mDot_dome / Math.max(rho_dome * Vref, 1e-9);
  const D2 = D2_mm / 1000;
  const H_dome = Aref / Math.max(Math.PI * D2, 1e-9);

  // Step 4 — Liner geometry + residence time
  const L_liner = 3 * H_dome; // practical L/H = 3 rule
  const rho_gas = P_dome / (R * Math.max(T4_K, 1));
  const Vhot = (mDot + mDot_fuel) / Math.max(rho_gas * Aref, 1e-9);
  const tau_ms = (L_liner / Math.max(Vhot, 1e-9)) * 1000;

  // Step 5 — Dilution + jet aero (simplified — assume R_D/LC = 1.5, R_P/S = 1.5)
  const mDot_liner = mDot_pass / (1 + 1.5);
  const mDot_dil = mDot_pass - mDot_liner;
  const dPL = P3 - P_dome;
  const rho_pass = P3 / (R * Math.max(T_air, 1));
  const Uj = Math.sqrt(2 * dPL / Math.max(rho_pass, 1e-9));
  const J = (rho_pass * Uj * Uj) / Math.max(rho_gas * Vhot * Vhot, 1e-9);
  const Cd = 0.54;
  const Ymax_target = Ymax_frac * H_dome;

  // Step 6 — Big hole sizing
  const m_dome_kg = mDot_dome;
  const m_pass_kg = mDot_pass;
  const dj_big_m = Ymax_target / (1.25 * Math.sqrt(Math.max(J, 1e-9)) * m_dome_kg / Math.max(m_dome_kg + m_pass_kg, 1e-9));
  const dh_big_m = dj_big_m / Math.sqrt(Math.max(Cd, 1e-9));

  // FAR target check
  const phi_class = phi_primary < 0.85 ? "lean — risk of LBO" : phi_primary < 1.05 ? "near stoichiometric ✓" : "rich — coking / smoke risk";
  const dP_class = dPliner_frac < 0.03 ? "below 3% — poor mixing risk" : dPliner_frac <= 0.05 ? "in 3–5% target band ✓" : "above 5% — cycle-efficiency hit";
  const tau_class = tau_ms < 2 ? "tight — fuel prep may not finish" : tau_ms <= 8 ? "small-engine band ✓" : "longer than typical small-engine";

  return (
    <div className="shell fade-in">
      <div className="card">
        <h2>Worked example — combustor calculator</h2>
        <p className="muted small">Mirrors the GT-06 worked example end-to-end: compressor exit → P3 → fuel flow → air split → reference area → liner geometry → dilution hole sizing. Defaults match the 700 N reference engine carried forward from GT-05.</p>
      </div>
      <div className="card">
        <div className="calc-grid">
          <div>
            <div className="field"><label>Total air flow ṁ_air (kg/s)</label><input type="number" step="0.05" value={mDot} onChange={(e)=>setMDot(+e.target.value||0)} /></div>
            <div className="field"><label>Compressor exit total temp T02 (K)</label><input type="number" step="1" value={T02} onChange={(e)=>setT02(+e.target.value||0)} /></div>
            <div className="field"><label>Compressor exit total pressure P02 (kPa)</label><input type="number" step="1" value={P02_kPa} onChange={(e)=>setP02(+e.target.value||0)} /></div>
            <div className="field"><label>Rotor exit absolute velocity C2 (m/s)</label><input type="number" step="1" value={C2} onChange={(e)=>setC2(+e.target.value||0)} /></div>
            <div className="field"><label>Diffuser pressure-rise coefficient Cpr (0–1)</label><input type="number" step="0.01" value={Cpr} onChange={(e)=>setCpr(+e.target.value||0)} /></div>
            <div className="field"><label>Target T4 (TIT) (°C)</label><input type="number" step="10" value={T4_C} onChange={(e)=>setT4(+e.target.value||0)} /></div>
            <div className="field"><label>Dome air fraction f_dome (0.30–0.40)</label><input type="number" step="0.01" value={f_dome} onChange={(e)=>setFDome(+e.target.value||0)} /></div>
            <div className="field"><label>Liner ΔP fraction (0.03–0.05)</label><input type="number" step="0.005" value={dPliner_frac} onChange={(e)=>setDPliner(+e.target.value||0)} /></div>
            <div className="field"><label>Reference velocity Vref_cold (m/s)</label><input type="number" step="0.5" value={Vref} onChange={(e)=>setVref(+e.target.value||0)} /></div>
            <div className="field"><label>Passage velocity Vpass (m/s)</label><input type="number" step="1" value={Vpass} onChange={(e)=>setVpass(+e.target.value||0)} /></div>
            <div className="field"><label>Compressor exit dia D2 (mm)</label><input type="number" step="1" value={D2_mm} onChange={(e)=>setD2(+e.target.value||0)} /></div>
            <div className="field"><label>Dilution penetration target Ymax / H_dome</label><input type="number" step="0.05" value={Ymax_frac} onChange={(e)=>setYmaxFrac(+e.target.value||0)} /></div>
          </div>
          <div className="calc-out">
            <Row lbl="Step 1 · P3 (combustor inlet)" val={`${(P3/1000).toFixed(1)} kPa`} />
            <Row lbl="P3 / P02 (recovery)" val={`${P3_over_P02.toFixed(2)}`} small />
            <Row lbl="Step 2 · FAR_actual" val={`${FAR.toFixed(4)} kg/kg`} />
            <Row lbl="Fuel flow ṁ_f" val={`${(mDot_fuel*1000).toFixed(2)} g/s`} />
            <Row lbl="Primary-zone φ" val={`${phi_primary.toFixed(2)}`} cls={phi_primary < 0.85 || phi_primary > 1.05 ? "warn" : ""} />
            <Row lbl="" val={phi_class} small cls={phi_primary < 0.85 || phi_primary > 1.05 ? "warn" : ""} />
            <Row lbl="Step 3 · ṁ_dome / ṁ_pass" val={`${(mDot_dome*1000).toFixed(0)} / ${(mDot_pass*1000).toFixed(0)} g/s`} />
            <Row lbl="Reference area Aref" val={`${(Aref*1e4).toFixed(2)} cm²`} />
            <Row lbl="Dome height H_dome" val={`${(H_dome*1000).toFixed(1)} mm`} />
            <Row lbl="Step 4 · Liner length L_liner" val={`${(L_liner*1000).toFixed(1)} mm`} />
            <Row lbl="Residence time τ" val={`${tau_ms.toFixed(2)} ms`} cls={tau_ms < 2 || tau_ms > 8 ? "warn" : ""} />
            <Row lbl="" val={tau_class} small cls={tau_ms < 2 || tau_ms > 8 ? "warn" : ""} />
            <Row lbl="Step 5 · ΔP across liner" val={`${(dPL/1000).toFixed(2)} kPa`} />
            <Row lbl="Jet velocity Uj" val={`${Uj.toFixed(1)} m/s`} />
            <Row lbl="Momentum ratio J" val={`${J.toFixed(1)}`} />
            <Row lbl="Step 6 · dj_big" val={`${(dj_big_m*1000).toFixed(2)} mm`} />
            <Row lbl="dh_big (drilled)" val={`${(dh_big_m*1000).toFixed(2)} mm`} />
            <Row lbl="ΔP target band" val={dP_class} small cls={dPliner_frac < 0.03 || dPliner_frac > 0.05 ? "warn" : ""} />
          </div>
        </div>
        <div className="btn-row">
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button className="btn btn-ghost" onClick={()=>{ setMDot(0.85); setT02(447.1); setP02(354.6); setC2(382.8); setCpr(0.80); setT4(950); setFDome(0.35); setDPliner(0.04); setVref(5); setVpass(40); setD2(103.9); setYmaxFrac(0.30); }}>
            Load 700 N reference
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ lbl, val, cls = "", small = false }) {
  return (
    <div className="row">
      <div className={`lbl ${small ? "small" : ""}`}>{lbl}</div>
      <div className={`val ${cls}`} style={{ textAlign: "right", fontSize: small ? 11.5 : 13 }}>{val}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Quiz({ onSubmit, onBack }) {
  const [picks, setPicks] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const allAnswered = SUMMATIVE.every((q) => picks[q.id] != null);
  const score = SUMMATIVE.filter((q) => picks[q.id] === q.correct).length;
  const byItem = Object.fromEntries(SUMMATIVE.map((q) => [q.id, picks[q.id] === q.correct]));

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(score, SUMMATIVE.length, byItem);
  };

  return (
    <div className="shell fade-in">
      <div className="card">
        <h2>Summative quiz</h2>
        <p className="muted small">{SUMMATIVE.length} items mixing recall, application, analysis, and evaluation. Mostly novel material. Passing benchmark: ≥ 80% on application-and-higher items.</p>
      </div>
      {SUMMATIVE.map((q, idx) => {
        const picked = picks[q.id];
        const reveal = submitted;
        const correct = picked === q.correct;
        return (
          <div className="card" key={q.id}>
            <span className={`probe-tag ${q.kind}`}>{q.kind}</span>
            <div className="probe-stem"><b>Q{idx + 1}.</b> {q.stem}</div>
            <div className="probe-opts">
              {q.options.map((opt, i) => {
                let cls = "probe-opt";
                if (reveal) {
                  if (i === q.correct) cls += " correct";
                  else if (i === picked) cls += " incorrect";
                  else cls += " dim";
                }
                return (
                  <label key={i} className={cls} style={{ borderColor: !reveal && picked === i ? "var(--accent)" : undefined, background: !reveal && picked === i ? "rgba(0,212,255,.06)" : undefined }}>
                    <input type="radio" checked={picked === i} disabled={reveal} onChange={() => setPicks({ ...picks, [q.id]: i })} />
                    <div>{opt}</div>
                  </label>
                );
              })}
            </div>
            {reveal && (
              <div className={`probe-feedback ${correct ? "correct" : "incorrect"}`}>
                <div>{correct ? "✓" : "✗"} <strong>Explanation:</strong> {q.explain}</div>
              </div>
            )}
          </div>
        );
      })}
      <div className="card">
        {submitted ? (
          <>
            <h3>Result: <span style={{ color: "var(--accent)" }}>{score}/{SUMMATIVE.length}</span> ({Math.round((score / SUMMATIVE.length) * 100)}%)</h3>
            <p className="muted small">
              {score / SUMMATIVE.length >= 0.8
                ? "Above the 80% benchmark — you've demonstrated mastery."
                : "Below the 80% benchmark — review the explanations above, revisit any flagged sections, then re-take after a 24-hour gap (spaced retrieval beats cramming)."}
            </p>
            <div className="btn-row">
              <button className="btn btn-ghost" onClick={onBack}>← Back to overview</button>
              <button className="btn btn-primary" onClick={() => { setSubmitted(false); setPicks({}); }}>Retake</button>
            </div>
          </>
        ) : (
          <div className="btn-row">
            <button className="btn btn-ghost" onClick={onBack}>← Cancel</button>
            <button className="btn btn-primary" disabled={!allAnswered} onClick={handleSubmit}>
              {allAnswered ? "Submit quiz" : `Answer all ${SUMMATIVE.length} items to submit (${Object.keys(picks).length}/${SUMMATIVE.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
function Dashboard({ email, progress, onBack }) {
  const stats = P.overallStats(email, SECTIONS.length);
  const reviews = P.dueReviews(email);
  const dueNow = reviews.filter((r) => r.due);
  const upcoming = reviews.filter((r) => !r.due).slice(0, 12);

  return (
    <div className="shell shell-wide fade-in">
      <div className="card">
        <h2>Your progress</h2>
        <div className="kpi-grid">
          <div className="kpi"><div className="lbl">Sections done</div><div className="val">{stats.sectionsCompleted}<span className="unit">/ {stats.sectionsTotal}</span></div></div>
          <div className="kpi"><div className="lbl">Module complete</div><div className="val">{stats.pctComplete}<span className="unit">%</span></div></div>
          <div className="kpi"><div className="lbl">Probe accuracy</div><div className="val">{stats.probeAccuracy ?? "—"}<span className="unit">%</span></div></div>
          <div className="kpi"><div className="lbl">Summative score</div><div className="val">{stats.summative ? `${stats.summative.score}/${stats.summative.total}` : "—"}</div></div>
        </div>
      </div>

      <div className="card">
        <h3>Due for review now ({dueNow.length})</h3>
        <p className="muted small">Spaced-repetition schedule: 1 day → 3 days → 1 week → 2 weeks → doubling. Click a concept to revisit its section.</p>
        {dueNow.length === 0 ? (
          <div className="muted small">Nothing due. Come back tomorrow.</div>
        ) : dueNow.map((r) => {
          const c = findConcept(r.conceptId);
          return (
            <div className="review-row" key={r.conceptId}>
              <div><div><b>{c.label}</b></div><div className="muted tiny">Streak: {r.streak} · interval: {r.intervalDays}d</div></div>
              <div className="due now">DUE</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Upcoming reviews</h3>
        {upcoming.length === 0 ? (
          <div className="muted small">No future reviews scheduled yet — complete more probes to populate this list.</div>
        ) : upcoming.map((r) => {
          const c = findConcept(r.conceptId);
          return (
            <div className="review-row" key={r.conceptId}>
              <div><div><b>{c.label}</b></div><div className="muted tiny">Streak: {r.streak} · interval: {r.intervalDays}d</div></div>
              <div className="due future">in {r.daysUntil}d</div>
            </div>
          );
        })}
      </div>

      <div className="card">
        <h3>Reference engine — quick recall card</h3>
        <ul className="small">
          <li>Class: 700 N small turbojet (combustor inlet from GT-05)</li>
          <li>ṁ_air = {REFERENCE_ENGINE.mDot_kgs} kg/s · P3 ≈ {REFERENCE_ENGINE.P3_kPa} kPa · T03 ≈ {REFERENCE_ENGINE.T03_K} K</li>
          <li>Target T4 (TIT) = {REFERENCE_ENGINE.T4_target_C} °C · FAR_st (Jet-A1) = {REFERENCE_ENGINE.FAR_st_JetA1}</li>
          <li>cp_gas = {REFERENCE_ENGINE.cp_gas_JkgK} J/kg·K · LHV = {REFERENCE_ENGINE.LHV_JetA1_MJkg} MJ/kg · η_b = {REFERENCE_ENGINE.eta_b}</li>
          <li>Air split: f_dome = {REFERENCE_ENGINE.f_dome} · ΔP_liner / P3 = {(REFERENCE_ENGINE.dP_liner_frac * 100).toFixed(1)}%</li>
        </ul>
      </div>

      <div className="btn-row" style={{ padding: "0 22px 22px" }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back to overview</button>
      </div>
    </div>
  );
}
