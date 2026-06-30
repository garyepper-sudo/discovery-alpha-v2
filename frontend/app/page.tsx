"use client";

import { useState } from "react";
import { OrganismGraph } from "./components/OrganismGraph";
import { StewardshipResult } from "./types/stewardship";

const SAMPLE = `Enterprise renewal rate fell from 91% to 78%.
Customers taking longer than 60 days to implement renewed at 62%.
Customers implemented within 30 days renewed at 93%.
Sales notes mention pricing objections, but customer interviews mention onboarding delays.
Support tickets increased 38% for enterprise integrations.`;

export default function Page() {
  const [content, setContent] = useState(SAMPLE);
  const [result, setResult] = useState<StewardshipResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/stewardship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationName: "Northstar Cloud", content, name: "Sprint 3 evidence packet" })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Pipeline failed.");
      return;
    }
    setResult(data);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="brand">DISCOVERY <span>Sprint 3</span></div>
          <p>Stewardship Engine</p>
        </div>
        <div className="statusPill">{result?.organism.maturity || "Seed"}</div>
      </header>

      <section className="heroGrid">
        <div className="heroCopy">
          <div className="eyebrow">Engine layer</div>
          <h1>Evidence becomes an organism.</h1>
          <p>
            Sprint 3 makes Discovery replayable: extraction, approval, relationships, confidence, and executive brief generation all run through one deterministic stewardship pipeline.
          </p>
          <div className="pipeline">
            <span>Extract</span><b /> <span>Approve</span><b /> <span>Connect</span><b /> <span>Recalculate</span><b /> <span>Brief</span>
          </div>
        </div>
        <div className="organismCard">
          <OrganismGraph organism={result?.organism} />
          <h3>{result ? result.brief.mostImportantDiscovery : "Waiting for approved evidence"}</h3>
          <p>{result ? result.brief.whyItMatters : "Discovery should not manufacture truth before evidence enters the organism."}</p>
        </div>
      </section>

      <section className="workspace">
        <div className="panel inputPanel">
          <div className="eyebrow">Stewardship Lab</div>
          <h2>Run the pipeline</h2>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
          <button onClick={run} disabled={loading}>{loading ? "Building organism..." : "Build Sprint 3 organism"}</button>
          {error && <div className="error">{error}</div>}
        </div>

        <div className="panel">
          <div className="eyebrow">Replay receipt</div>
          <h2>{result ? result.replayReceipt.deterministicVersion : "No run yet"}</h2>
          <div className="metrics">
            <Metric label="Evidence proposed" value={result?.replayReceipt.proposedEvidenceCount || 0} />
            <Metric label="Evidence approved" value={result?.replayReceipt.approvedEvidenceCount || 0} />
            <Metric label="Relationships" value={result?.replayReceipt.relationshipCount || 0} />
            <Metric label="Organism nodes" value={result?.replayReceipt.nodeCount || 0} />
          </div>
        </div>
      </section>

      {result && (
        <section className="resultsGrid">
          <div className="panel wide">
            <div className="eyebrow">Executive Brief</div>
            <h2>{result.brief.title}</h2>
            <div className="briefBlock">
              <strong>Most important discovery</strong>
              <p>{result.brief.mostImportantDiscovery}</p>
            </div>
            <div className="briefBlock">
              <strong>Why it matters</strong>
              <p>{result.brief.whyItMatters}</p>
            </div>
            <div className="briefColumns">
              <List title="Supporting evidence" items={result.brief.supportingEvidence} />
              <List title="Decisions that change" items={result.brief.decisionsThatChange} />
              <List title="Next evidence" items={result.brief.nextEvidence} />
            </div>
          </div>

          <div className="panel">
            <div className="eyebrow">Organism nodes</div>
            <div className="nodeStack">
              {result.organism.nodes.map((node) => (
                <div className="nodeCard" key={node.id}>
                  <strong>{node.label}</strong>
                  <span>{node.confidence} · {Math.round(node.confidenceScore * 100)}%</span>
                  <p>{node.supportingEvidence[0]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel wide">
            <div className="eyebrow">Approved Evidence Objects</div>
            <div className="evidenceStack">
              {result.approvedEvidence.map((evidence) => (
                <div className="evidenceCard" key={evidence.id}>
                  <strong>{evidence.statement}</strong>
                  <p>{evidence.sourceName} · {evidence.tags.join(", ")} · {Math.round(evidence.confidence * 100)}%</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function List({ title, items }: { title: string; items: string[] }) {
  return <div className="list"><h3>{title}</h3>{items.map((item) => <p key={item}>• {item}</p>)}</div>;
}
