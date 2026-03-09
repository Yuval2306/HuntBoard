import { useState, useEffect } from 'react';
import { fetchLeetCodeQuestion } from '../utils/gemini';
import { ExternalLink, Code2, RefreshCw, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const DIFFICULTY_COLORS = {
  Easy: { color: '#43e97b', bg: 'rgba(67,233,123,0.1)' },
  Medium: { color: '#f7c96e', bg: 'rgba(247,201,110,0.1)' },
  Hard: { color: '#ff6584', bg: 'rgba(255,101,132,0.1)' },
};

export default function LeetCodePage() {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [solved, setSolved] = useState(() => {
    return JSON.parse(localStorage.getItem('at_lc_solved') || '[]');
  });

  useEffect(() => {
    fetchLeetCodeQuestion().then(q => { setQuestion(q); setLoading(false); });
  }, []);

  const markSolved = (id) => {
    const updated = solved.includes(id) ? solved.filter(s => s !== id) : [...solved, id];
    setSolved(updated);
    localStorage.setItem('at_lc_solved', JSON.stringify(updated));
  };

  const tips = [
    { title: 'Start with Examples', desc: 'Always trace through examples by hand before coding.' },
    { title: 'Clarify Edge Cases', desc: 'Empty arrays, single elements, negatives — ask first.' },
    { title: 'Think Aloud', desc: 'Interviewers want to hear your reasoning, not just the answer.' },
    { title: 'Time & Space Complexity', desc: 'Always state Big-O after solving. It shows seniority.' },
    { title: 'Optimize Iteratively', desc: 'Brute force first, then optimize. Shows systematic thinking.' },
  ];

  const topics = [
    { name: 'Arrays & Hashing', count: 9, color: '#6c63ff' },
    { name: 'Two Pointers', count: 5, color: '#00d2ff' },
    { name: 'Sliding Window', count: 4, color: '#f7c96e' },
    { name: 'Binary Search', count: 7, color: '#43e97b' },
    { name: 'Dynamic Programming', count: 11, color: '#ff6584' },
    { name: 'Trees & Graphs', count: 15, color: '#a89cff' },
    { name: 'Linked Lists', count: 6, color: '#f7971e' },
    { name: 'Stack & Queue', count: 7, color: '#7a7a9a' },
  ];

  const diff = question ? DIFFICULTY_COLORS[question.difficulty] : null;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}><Code2 size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />LeetCode Practice</h1>
          <p style={styles.subtitle}>Daily question · {format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div style={styles.streak}>
          <span style={styles.streakNum}>{solved.length}</span>
          <span style={styles.streakLabel}>Solved Today</span>
        </div>
      </div>

      <div style={styles.grid}>
        {/* Daily Question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <span style={styles.questionTag}>Today's Problem</span>
              {question && (
                <span style={{ ...styles.diffBadge, color: diff.color, background: diff.bg }}>
                  {question.difficulty}
                </span>
              )}
            </div>

            {loading ? (
              <div style={styles.loading}>Loading question...</div>
            ) : question ? (
              <>
                <div style={styles.questionId}>#{question.id}</div>
                <h2 style={styles.questionTitle}>{question.title}</h2>

                <div style={styles.tagRow}>
                  {question.tags?.map(t => (
                    <span key={t} style={styles.topicTag}>{t}</span>
                  ))}
                </div>

                <div style={styles.questionActions}>
                  <a href={`https://leetcode.com/problems/${question.slug}`}
                    target="_blank" rel="noreferrer"
                    className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    <ExternalLink size={14} /> Solve on LeetCode
                  </a>
                  <button
                    className={`btn ${solved.includes(question.id) ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => markSolved(question.id)}
                    style={{ gap: 6 }}>
                    <CheckCircle size={14} />
                    {solved.includes(question.id) ? '✓ Solved!' : 'Mark Solved'}
                  </button>
                </div>
              </>
            ) : (
              <div style={styles.loading}>Could not load question</div>
            )}
          </div>

          {/* Interview Tips */}
          <div className="card">
            <h3 style={styles.cardTitle}>Interview Tips 💡</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {tips.map((tip, i) => (
                <div key={i} style={styles.tipItem}>
                  <div style={styles.tipNum}>{i + 1}</div>
                  <div>
                    <div style={styles.tipTitle}>{tip.title}</div>
                    <div style={styles.tipDesc}>{tip.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Topics & Resources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h3 style={styles.cardTitle}>Key Topics for Juniors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topics.map(({ name, count, color }) => (
                <div key={name} style={styles.topicRow}>
                  <span style={{ fontSize: 13, color: 'var(--text)' }}>{name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={styles.topicBar}>
                      <div style={{ width: `${(count / 15) * 100}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', width: 20 }}>{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={styles.cardTitle}>Resources 📚</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { name: 'NeetCode 150', url: 'https://neetcode.io', desc: 'Best curated list for interviews' },
                { name: 'Blind 75', url: 'https://leetcode.com/list/xi4ci4ig/', desc: '75 most common problems' },
                { name: 'Grind 169', url: 'https://www.techinterviewhandbook.org/grind75', desc: 'Updated Blind 75' },
                { name: 'Big-O Cheatsheet', url: 'https://www.bigocheatsheet.com', desc: 'Complexity quick reference' },
              ].map(r => (
                <a key={r.name} href={r.url} target="_blank" rel="noreferrer" style={styles.resource}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--accent)' }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.desc}</div>
                  </div>
                  <ExternalLink size={13} color="var(--text-3)" />
                </a>
              ))}
            </div>
          </div>

          <div className="card" style={styles.motivationCard}>
            <div style={styles.motivationText}>
              "Every expert was once a beginner. Keep coding, keep applying."
            </div>
            <div style={styles.motivationSub}>— The ApplyTrack Team</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '28px 32px', animation: 'fadeIn 0.4s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 },
  subtitle: { color: 'var(--text-2)', fontSize: 14 },
  streak: { textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px' },
  streakNum: { display: 'block', fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--accent)' },
  streakLabel: { fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' },
  questionCard: { padding: 24 },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  questionTag: { fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 },
  diffBadge: { padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 },
  questionId: { fontFamily: 'var(--font-mono)', color: 'var(--text-3)', fontSize: 13, marginBottom: 4 },
  questionTitle: { fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 12, letterSpacing: '-0.01em' },
  tagRow: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 },
  topicTag: {
    background: 'var(--bg-3)', border: '1px solid var(--border)',
    padding: '4px 10px', borderRadius: 20, fontSize: 12, color: 'var(--text-2)',
  },
  questionActions: { display: 'flex', gap: 10 },
  loading: { padding: '40px 0', textAlign: 'center', color: 'var(--text-3)', fontSize: 14 },
  cardTitle: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, marginBottom: 14 },
  tipItem: { display: 'flex', gap: 12, alignItems: 'flex-start' },
  tipNum: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'rgba(108,99,255,0.15)', color: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1,
  },
  tipTitle: { fontSize: 13, fontWeight: 500, marginBottom: 2 },
  tipDesc: { fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 },
  topicRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  topicBar: { width: 80, height: 6, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' },
  resource: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 8,
    border: '1px solid var(--border)', transition: 'border-color 0.15s',
  },
  motivationCard: {
    background: 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(255,101,132,0.05))',
    border: '1px solid rgba(108,99,255,0.2)',
    textAlign: 'center', padding: 20,
  },
  motivationText: { fontSize: 14, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1.6, marginBottom: 8 },
  motivationSub: { fontSize: 12, color: 'var(--text-3)' },
};
