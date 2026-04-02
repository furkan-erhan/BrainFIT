import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import {
  FaChartLine, FaBullseye, FaArrowTrendUp, FaArrowTrendDown,
  FaUsers, FaCircleQuestion, FaGraduationCap, FaRotate, FaShieldHalved,
} from 'react-icons/fa6';
import { useAuth } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analyticsApi';

// ─── Colour palette ───────────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '12px 16px',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,.18)', border: '1px solid #f1f5f9'
    }}>
      <p style={{ fontWeight: 700, color: '#64748b', fontSize: 12, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontWeight: 800, color: p.color, fontSize: 18, margin: 0 }}>
          {typeof p.value === 'number' ? `${p.value.toFixed(1)}${p.name === 'score' ? ' pts' : '%'}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, sublabel, value, accent }) => {
  const accents = {
    green:  { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
    rose:   { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' },
    indigo: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
    amber:  { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
    purple: { bg: '#faf5ff', text: '#7c3aed', border: '#ddd6fe' },
    cyan:   { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
  };
  const a = accents[accent] ?? accents.indigo;

  return (
    <div style={{
      background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9',
      padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,.06)',
      transition: 'box-shadow .2s', cursor: 'default',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16, background: a.bg,
          border: `1px solid ${a.border}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: a.text, fontSize: 20,
        }}>
          <Icon />
        </div>
        {sublabel && (
          <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>
            {sublabel}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 900, color: '#1e293b', margin: 0, letterSpacing: -1 }}>{value}</p>
    </div>
  );
};

// ─── Loading Spinner ──────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      border: '4px solid #e0e7ff', borderTopColor: '#6366f1',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '64px 32px', textAlign: 'center',
    background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
    borderRadius: 32, border: '2px dashed #c7d2fe',
  }}>
    <div style={{
      width: 80, height: 80, borderRadius: 24, background: '#eef2ff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 36, marginBottom: 24,
    }}>
      🧠
    </div>
    <h3 style={{ fontSize: 24, fontWeight: 900, color: '#1e293b', margin: '0 0 8px' }}>No data yet</h3>
    <p style={{ color: '#64748b', fontWeight: 500, margin: 0, maxWidth: 360, lineHeight: 1.6 }}>
      Complete your first quiz to start seeing performance insights, subject mastery, and trends here.
    </p>
  </div>
);

// ─── Error State ──────────────────────────────────────────────────────────────
const ErrorState = ({ onRetry }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '64px 32px', textAlign: 'center',
    background: '#fff1f2', borderRadius: 32, border: '2px dashed #fecdd3',
  }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
    <h3 style={{ fontSize: 20, fontWeight: 900, color: '#be123c', margin: '0 0 8px' }}>Failed to load analytics</h3>
    <p style={{ color: '#9f1239', fontWeight: 500, margin: '0 0 24px' }}>
      There was an issue fetching your data. Please try again.
    </p>
    <button
      onClick={onRetry}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 24px', borderRadius: 12, border: 'none',
        background: '#e11d48', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
      }}
    >
      <FaRotate /> Retry
    </button>
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionTitle = ({ color = '#6366f1', children }) => (
  <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: '0 0 28px', display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ display: 'inline-block', width: 6, height: 32, background: color, borderRadius: 99 }} />
    {children}
  </h2>
);

// ─── Mastery Bar ──────────────────────────────────────────────────────────────
const MasteryRow = ({ category, successRate, totalQuestions, index }) => {
  const color = PALETTE[index % PALETTE.length];
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
          <span style={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>{category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{totalQuestions} answers</span>
          <span style={{ fontWeight: 900, color, fontSize: 16 }}>{successRate.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${successRate}%`, height: '100%', background: color,
          borderRadius: 99, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Analytics = () => {
  const { isAdmin } = useAuth();

  const [performanceData, setPerformanceData] = useState([]);
  const [masteryData,     setMasteryData]     = useState([]);
  const [summary,         setSummary]         = useState(null);
  const [adminData,       setAdminData]       = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const [perf, mastery, summ] = await Promise.all([
        analyticsApi.getPerformanceTrends(),
        analyticsApi.getSubjectMastery(),
        analyticsApi.getSummary(),
      ]);

      setPerformanceData(perf);
      setMasteryData(mastery);
      setSummary(summ);

      if (isAdmin) {
        const admin = await analyticsApi.getAdminOverview();
        setAdminData(admin);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <Spinner />;

  const hasStudentData = performanceData.length > 0 || masteryData.length > 0;

  const containerStyle = {
    maxWidth: 1200, margin: '0 auto', padding: '32px 16px',
  };

  const cardStyle = {
    background: '#fff', borderRadius: 32, border: '1px solid #f1f5f9',
    padding: 32, boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  };

  return (
    <div style={containerStyle}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24, boxShadow: '0 8px 20px rgba(99,102,241,.3)',
          }}>
            <FaChartLine />
          </div>
          <div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: -1.5 }}>
              Performance <span style={{ color: '#6366f1', fontStyle: 'italic' }}>Insights</span>
            </h1>
            <p style={{ color: '#64748b', fontWeight: 500, margin: 0 }}>
              Analyzing your cognitive growth and subject mastery
            </p>
          </div>
        </div>
      </div>

      {/* ── Error state ─────────────────────────────── */}
      {error && <ErrorState onRetry={fetchAll} />}

      {/* ── No data state ───────────────────────────── */}
      {!error && !hasStudentData && <EmptyState />}

      {/* ── Student Analytics ───────────────────────── */}
      {!error && hasStudentData && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard icon={FaArrowTrendUp}  label="Best Category"       sublabel="Strength"    value={summary?.bestCategory       || '—'} accent="green"  />
            <StatCard icon={FaArrowTrendDown} label="Needs Focus"         sublabel="Opportunity" value={summary?.worstCategory      || '—'} accent="rose"   />
            <StatCard icon={FaBullseye}       label="Average Score"       sublabel="All Quizzes" value={summary ? `${summary.averageScore}` : '0'} accent="indigo" />
            <StatCard icon={FaGraduationCap}  label="Quizzes Completed"   sublabel="Activity"    value={summary?.totalQuizzesTaken  || 0}   accent="amber"  />
          </div>

          {/* Charts row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>

            {/* Performance Area Chart */}
            <div style={cardStyle}>
              <SectionTitle color="#6366f1">Score Progression</SectionTitle>
              {performanceData.length === 0 ? (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 700 }}>
                  No quiz history yet
                </div>
              ) : (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="quizTitle"
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                        dy={8}
                        tickFormatter={v => v && v.length > 10 ? v.slice(0, 10) + '…' : v}
                      />
                      <YAxis
                        axisLine={false} tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#6366f1"
                        strokeWidth={3}
                        fill="url(#scoreGrad)"
                        dot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Radar Chart */}
            <div style={cardStyle}>
              <SectionTitle color="#f43f5e">Subject Mastery</SectionTitle>
              {masteryData.length === 0 ? (
                <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 700 }}>
                  No answers recorded
                </div>
              ) : (
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={masteryData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis dataKey="category" tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} axisLine={false} tick={false} />
                      <Radar
                        name="Mastery %"
                        dataKey="successRate"
                        stroke="#f43f5e"
                        fill="#f43f5e"
                        fillOpacity={0.45}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(v) => [`${v.toFixed(1)}%`, 'Mastery']}
                        contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,.12)' }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Mastery Breakdown Bar List */}
          {masteryData.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 32 }}>
              <SectionTitle color="#10b981">Category Breakdown</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px 48px' }}>
                {masteryData.map((cat, i) => (
                  <MasteryRow key={cat.category} {...cat} index={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Admin Insights ───────────────────────────── */}
      {isAdmin && adminData && (
        <div style={{ marginTop: 16 }}>
          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 20px', background: '#f8fafc', borderRadius: 99, border: '1px solid #e2e8f0' }}>
              <FaShieldHalved style={{ color: '#6366f1' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>
                Admin Insights
              </span>
            </div>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Admin stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
            <StatCard icon={FaBullseye} label="Global Avg. Score"  sublabel="All Students" value={`${adminData.averageGlobalScore}`} accent="indigo" />
            <StatCard icon={FaUsers}    label="Total Participants" sublabel="Unique Users"  value={adminData.totalParticipants} accent="purple" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>

            {/* Participation Bar Chart */}
            <div style={cardStyle}>
              <SectionTitle color="#8b5cf6">Participation by Category</SectionTitle>
              {adminData.participationByCategory?.length > 0 ? (
                <div style={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={adminData.participationByCategory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 14, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,.12)' }}
                        formatter={(v) => [v, 'Answers']}
                      />
                      <Bar dataKey="totalAttempts" radius={[8, 8, 0, 0]}>
                        {adminData.participationByCategory.map((_, idx) => (
                          <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontWeight: 700 }}>
                  No participation data
                </div>
              )}
            </div>

            {/* Hardest Questions */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <FaCircleQuestion style={{ color: '#f43f5e' }} />
                Hardest Questions
              </h2>
              {adminData.hardestQuestions?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {adminData.hardestQuestions.map((q, idx) => {
                    const pct = q.accuracyRate;
                    const color = pct < 30 ? '#ef4444' : pct < 60 ? '#f59e0b' : '#10b981';
                    return (
                      <div key={q.questionId} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 16px', background: '#f8fafc', borderRadius: 16,
                        border: '1px solid #f1f5f9', transition: 'background .15s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                      >
                        <span style={{
                          minWidth: 32, height: 32, borderRadius: '50%',
                          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: '#94a3b8', fontSize: 14, boxShadow: '0 1px 3px rgba(0,0,0,.1)',
                        }}>
                          {idx + 1}
                        </span>
                        <p style={{ flex: 1, fontWeight: 700, color: '#374151', margin: 0, fontSize: 13, lineHeight: 1.4,
                          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        }}>
                          {q.questionText}
                        </p>
                        <div style={{ textAlign: 'right', minWidth: 56 }}>
                          <span style={{ fontWeight: 900, fontSize: 18, color }}>{pct.toFixed(1)}%</span>
                          <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
                            correct
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ color: '#cbd5e1', fontWeight: 700, textAlign: 'center', paddingTop: 40 }}>
                  No answer data yet
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
