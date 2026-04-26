import React, { useState, useEffect, useMemo } from 'react';

// ── Color tokens ─────────────────────────────────────────────
const c = {
  cream:'#F6F1E8', paper:'#FDFBF6', ink:'#1C1916',
  inkSoft:'#6B6258', inkLight:'#A8A095',
  border:'#E5DECF', borderSoft:'#EFE8D8',
  accent:'#D26849', accentSoft:'#F2D9CB', accentDeep:'#A04E36',
  sage:'#7B8B6F', sageSoft:'#DFE3D5',
  sky:'#7E96A8', skySoft:'#D9E1E7',
  gold:'#C8A24A',
  warning:'#C9743A', warningSoft:'#FBE2D0',
};

const projectColors = [c.accent, c.sage, c.gold, c.sky, c.accentDeep];

const fontDisplay = "'Shippori Mincho B1', 'Yu Mincho', serif";
const fontBody    = "'Zen Kaku Gothic New', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
const fontMono    = "'JetBrains Mono', ui-monospace, monospace";

const STATUS = {
  'on-track': { label: '順調', bg: c.sageSoft,    fg: c.sage    },
  'almost':   { label: '大詰め', bg: c.accentSoft, fg: c.accentDeep },
  'planning': { label: '構想中', bg: c.skySoft,    fg: c.sky     },
  'stalled':  { label: '停滞', bg: c.warningSoft, fg: c.warning },
};

// プロジェクトのフェーズ（長期事業向け）
const PHASES = {
  'ideation':   { label: '構想期', short: '構想', order: 1, color: c.sky,        bg: c.skySoft },
  'validation': { label: '検証期', short: '検証', order: 2, color: c.sage,       bg: c.sageSoft },
  'execution':  { label: '実行期', short: '実行', order: 3, color: c.accent,     bg: c.accentSoft },
  'expansion':  { label: '拡大期', short: '拡大', order: 4, color: c.gold,       bg: '#F5E8C4' },
  'completed':  { label: '完了',   short: '完了', order: 5, color: c.inkSoft,    bg: c.borderSoft },
};

// メンバーの役割
const ROLES = {
  'rep':    { label: '代表',          short: '代表',  color: c.accent },
  'pm':     { label: 'プロジェクトリーダー', short: 'PM',   color: c.gold },
  'member': { label: 'メンバー',       short: 'メンバー', color: c.ink },
  'ob':     { label: 'OB・サポーター', short: 'OB',   color: c.sky },
};

const TAGS = ['事業', 'ビジコン', 'イベント', '学び', '広報', 'その他'];

// ── Seed data ────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);

function seedData() {
  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
  const profiles = [
    { id: 'u1', name: '板橋',     short: '板橋', accent: c.accent,     role: 'rep' },
    { id: 'u2', name: 'メンバーA', short: 'A',   accent: c.sage,       role: 'pm' },
    { id: 'u3', name: 'メンバーB', short: 'B',   accent: c.gold,       role: 'pm' },
    { id: 'u4', name: 'メンバーC', short: 'C',   accent: c.sky,        role: 'member' },
    { id: 'u5', name: 'メンバーD', short: 'D',   accent: c.accentDeep, role: 'member' },
    { id: 'u6', name: 'メンバーE', short: 'E',   accent: c.warning,    role: 'member' },
    { id: 'u7', name: 'OB先輩',  short: 'OB',  accent: c.ink,        role: 'ob' },
  ];
  const projects = [
    { id: 'p1', name: 'その先を照らせプロジェクト',
      tag: '事業', owner_id: 'u1', member_ids: ['u1','u2','u4','u5'],
      phase: 'execution', status: 'on-track', progress: 58,
      next_milestone: '次フェーズの企画書作成',
      vision: '挑戦の第一歩を踏み出す学生のためのプロジェクト',
      accent: c.accent, created_at: daysAgo(180), updated_at: daysAgo(1) },
    { id: 'p2', name: 'ビジコン挑戦チーム',
      tag: 'ビジコン', owner_id: 'u2', member_ids: ['u2','u4','u6'],
      phase: 'validation', status: 'on-track', progress: 41,
      next_milestone: '一次審査用スライド作成',
      vision: '実践の場で力を試す',
      accent: c.gold, created_at: daysAgo(60), updated_at: daysAgo(2) },
    { id: 'p3', name: '新歓・新メンバー育成 2026',
      tag: 'イベント', owner_id: 'u3', member_ids: ['u3','u5','u6'],
      phase: 'execution', status: 'almost', progress: 78,
      next_milestone: '新歓ピッチイベント本番',
      vision: '次世代に続く仲間を迎え入れる',
      accent: c.sky, created_at: daysAgo(45), updated_at: daysAgo(0) },
    { id: 'p4', name: '広報・ブランディング再設計',
      tag: '広報', owner_id: 'u1', member_ids: ['u1','u3'],
      phase: 'ideation', status: 'planning', progress: 18,
      next_milestone: 'コンセプトの方向性を決める',
      vision: '「その先」を伝わる形にする',
      accent: c.accentDeep, created_at: daysAgo(20), updated_at: daysAgo(3) },
  ];
  const updates = [
    { id: uid(), project_id: 'p1', user_id: 'u1', week_of: '2026-04-22',
      did: '前回までの振り返りを共有。次フェーズの方向性が固まった。',
      will_do: '企画書のドラフトを書く。協力してくれそうな企業を3社リストアップ。',
      blockers: '時間が取れない週もあって、前進が遅れがち。',
      created_at: daysAgo(3) },
    { id: uid(), project_id: 'p3', user_id: 'u3', week_of: '2026-04-22',
      did: '新歓ピッチの登壇者と内容を確定。会場予約も完了。',
      will_do: 'フライヤーのデザイン仕上げ、SNSで告知。',
      blockers: '',
      created_at: daysAgo(0) },
    { id: uid(), project_id: 'p2', user_id: 'u2', week_of: '2026-04-22',
      did: 'ビジネスアイデアを3案まで絞り込み。',
      will_do: '一次審査用のスライド構成を決める。',
      blockers: 'ファシリ慣れしてないので会議が間延びしがち。',
      created_at: daysAgo(2) },
  ];
  const activity = [
    { id: uid(), project_id: 'p3', user_id: 'u3', kind: 'progress', text: '進捗を 70% → 78% に更新',  created_at: daysAgo(0) },
    { id: uid(), project_id: 'p1', user_id: 'u1', kind: 'progress', text: '進捗を 55% → 58% に更新',  created_at: daysAgo(1) },
    { id: uid(), project_id: 'p2', user_id: 'u2', kind: 'update',   text: '今週の更新を投稿',         created_at: daysAgo(2) },
    { id: uid(), project_id: 'p1', user_id: 'u1', kind: 'update',   text: '今週の更新を投稿',         created_at: daysAgo(3) },
    { id: uid(), project_id: 'p4', user_id: 'u1', kind: 'phase',    text: 'フェーズを「構想期」に設定', created_at: daysAgo(20) },
    { id: uid(), project_id: 'p1', user_id: 'u7', kind: 'comment',  text: 'OB先輩から応援コメントが届きました', created_at: daysAgo(7) },
  ];
  return { profiles, projects, updates, activity, currentUserId: 'u1' };
}

// ── Storage hook (localStorage) ──────────────────────────────
function useAppState() {
  const [state, setState] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage (or seed)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sonosaki:state');
      if (saved) {
        setState(JSON.parse(saved));
      } else {
        setState(seedData());
      }
    } catch {
      setState(seedData());
    }
    setLoaded(true);
  }, []);

  // Save on change
  useEffect(() => {
    if (!loaded || !state) return;
    try {
      localStorage.setItem('sonosaki:state', JSON.stringify(state));
    } catch (e) {
      console.error('save failed', e);
    }
  }, [state, loaded]);

  return [state, setState, loaded];
}

// ── Util ─────────────────────────────────────────────────────
const daysSince = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.floor(ms / 86400000);
};

const formatRelative = (iso) => {
  const d = daysSince(iso);
  if (d === 0) return '今日';
  if (d === 1) return '昨日';
  if (d < 7) return `${d}日前`;
  if (d < 30) return `${Math.floor(d / 7)}週間前`;
  return `${Math.floor(d / 30)}ヶ月前`;
};

// ── Tiny components ──────────────────────────────────────────
function Avatar({ name, size = 24, accent = c.ink }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: c.paper, border: `1px solid ${c.border}`,
      color: accent, fontFamily: fontDisplay, fontSize: size * 0.5,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>{name.slice(0, 1)}</div>
  );
}

function Pill({ children, color = c.ink, bg = c.paper, border = c.border, onClick }) {
  return (
    <span onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 9px', borderRadius: 999,
      background: bg, color, border: `1px solid ${border}`,
      fontSize: 10, letterSpacing: '0.04em', fontWeight: 500,
      whiteSpace: 'nowrap', cursor: onClick ? 'pointer' : 'default',
    }}>{children}</span>
  );
}

function StatusPill({ status, onClick }) {
  const s = STATUS[status];
  return (
    <Pill bg={s.bg} border="transparent" color={s.fg} onClick={onClick}>
      {status === 'stalled' && '⚠ '}{s.label}
    </Pill>
  );
}

function PhasePill({ phase, onClick, full = false }) {
  const p = PHASES[phase] || PHASES['ideation'];
  return (
    <Pill bg={p.bg} border="transparent" color={p.color} onClick={onClick}>
      {full ? p.label : p.short}
    </Pill>
  );
}

function PhaseProgress({ phase }) {
  const p = PHASES[phase] || PHASES['ideation'];
  const stages = ['ideation', 'validation', 'execution', 'expansion', 'completed'];
  const currentIdx = stages.indexOf(phase);
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {stages.map((s, i) => {
        const stage = PHASES[s];
        const reached = i <= currentIdx;
        const isCurrent = i === currentIdx;
        return (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: reached ? stage.color : c.borderSoft,
            opacity: isCurrent ? 1 : reached ? 0.55 : 1,
          }}/>
        );
      })}
    </div>
  );
}

// ── Top bar ──────────────────────────────────────────────────
function TopBar({ user, onAvatarClick, title, subtitle }) {
  return (
    <div style={{
      padding: '10px 16px 8px',
      background: c.cream, borderBottom: `1px solid ${c.borderSoft}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0,
    }}>
      <div>
        <div style={{
          fontFamily: fontDisplay, fontSize: 14, color: c.ink,
          letterSpacing: '0.18em', lineHeight: 1, fontWeight: 500,
        }}>{title || 'SONOSAKI'}</div>
        {subtitle && (
          <div style={{
            marginTop: 3, fontFamily: fontBody, fontSize: 9,
            color: c.inkLight, letterSpacing: '0.18em',
          }}>{subtitle}</div>
        )}
      </div>
      <button onClick={onAvatarClick} style={{
        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
      }}>
        <Avatar name={user.short} accent={user.accent} size={28} />
      </button>
    </div>
  );
}

// ── HOME VIEW ────────────────────────────────────────────────
function HomeView({ state, setView, setSelectedId, openModal }) {
  const stalled = state.projects.filter(p => p.status === 'stalled');
  const onTrack = state.projects.length - stalled.length;
  const thisWeekUpdates = state.updates.filter(u => daysSince(u.created_at) <= 7).length;
  const totalProjects = state.projects.length;
  const me = state.profiles.find(p => p.id === state.currentUserId);
  const greetings = ['おはよう', 'こんにちは', 'お疲れさま'];
  const hour = new Date().getHours();
  const greeting = hour < 11 ? greetings[0] : hour < 17 ? greetings[1] : greetings[2];
  const dayLabel = new Date().toLocaleDateString('ja-JP', { weekday: 'short' }).toUpperCase();
  const dateLabel = `${new Date().getFullYear()} ・ ${new Date().toLocaleDateString('en', { month: 'short' }).toUpperCase()} ・ ${new Date().getDate()} ・ ${dayLabel}`;

  return (
    <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-hide">
      <div style={{ padding: '16px 18px 12px' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.26em', marginBottom: 6,
        }}>{dateLabel}</div>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 22, fontWeight: 500,
          color: c.ink, lineHeight: 1.2, margin: 0,
        }}>{greeting}、<span style={{ color: c.accent }}>{me.short}</span>。</h1>
        <div style={{
          marginTop: 6, fontFamily: fontBody, fontSize: 11, color: c.inkSoft, lineHeight: 1.7,
        }}>
          {totalProjects > 0 ? (
            stalled.length > 0
              ? <>{totalProjects}つのプロジェクトのうち、<strong style={{ color: c.warning, fontWeight: 600 }}>{stalled.length}つが停滞</strong>しています。</>
              : <>{totalProjects}つのプロジェクトすべてが順調に動いています。</>
          ) : (
            <>プロジェクトを追加して始めましょう。</>
          )}
        </div>
      </div>

      {/* Stalled alert */}
      {stalled.length > 0 && (
        <div style={{ padding: '0 18px', marginBottom: 14 }}>
          <div style={{
            borderRadius: 12, padding: 14,
            background: `linear-gradient(155deg, ${c.warningSoft} 0%, ${c.paper} 80%)`,
            border: `1px solid ${c.warningSoft}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', background: c.warning,
                animation: 'pulse 2s ease-in-out infinite',
              }}/>
              <div style={{
                fontFamily: fontBody, fontSize: 9, color: c.warning,
                letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700,
              }}>停滞アラート</div>
            </div>
            <div style={{
              fontFamily: fontDisplay, fontSize: 14, color: c.ink,
              lineHeight: 1.4, marginBottom: 10, fontWeight: 500,
            }}>3日以上更新のないプロジェクト</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {stalled.map(p => (
                <button key={p.id} onClick={() => { setSelectedId(p.id); setView('detail'); }} style={{
                  background: c.paper, borderRadius: 8, padding: '8px 10px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  border: `1px solid ${c.borderSoft}`, width: '100%', cursor: 'pointer',
                  fontFamily: fontBody,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.accent, flexShrink: 0 }}/>
                    <span style={{
                      fontSize: 12, color: c.ink, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      textAlign: 'left',
                    }}>{p.name}</span>
                  </div>
                  <span style={{ fontFamily: fontMono, fontSize: 10, color: c.warning, fontWeight: 600, marginLeft: 8 }}>
                    {daysSince(p.updated_at)}日
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '0 18px', marginBottom: 16 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1,
          background: c.border, borderRadius: 10, overflow: 'hidden',
          border: `1px solid ${c.border}`,
        }}>
          {[
            { k: '順調', v: onTrack, color: c.sage },
            { k: '停滞', v: stalled.length, color: c.warning },
            { k: '今週の更新', v: `${thisWeekUpdates}/${totalProjects}`, color: c.ink },
          ].map((s, i) => (
            <div key={i} style={{ padding: '10px 8px', background: c.paper, textAlign: 'center' }}>
              <div style={{
                fontFamily: fontDisplay, fontSize: 22, color: s.color,
                lineHeight: 1, fontWeight: 500,
              }}>{s.v}</div>
              <div style={{
                fontFamily: fontBody, fontSize: 9, color: c.inkLight,
                letterSpacing: '0.16em', marginTop: 4, textTransform: 'uppercase',
              }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Project pulse */}
      <div style={{ padding: '0 18px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
          <h2 style={{
            fontFamily: fontDisplay, fontSize: 14, fontWeight: 500,
            color: c.ink, margin: 0,
          }}>プロジェクトの状況</h2>
          <button onClick={() => setView('projects')} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: fontBody, fontSize: 10, color: c.inkSoft,
          }}>すべて →</button>
        </div>

        {state.projects.length === 0 ? (
          <EmptyState message="まだプロジェクトがありません" cta="追加する" onClick={() => openModal('addProject')} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {state.projects.map(p => (
              <button key={p.id} onClick={() => { setSelectedId(p.id); setView('detail'); }} style={{
                background: c.paper, border: `1px solid ${c.border}`,
                borderRadius: 10, padding: '10px 12px', position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                width: '100%', textAlign: 'left',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: p.accent,
                }}/>
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <PhasePill phase={p.phase} />
                    <div style={{
                      fontFamily: fontDisplay, fontSize: 12, color: c.ink, fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                    }}>{p.name}</div>
                  </div>
                  <div style={{ height: 2, background: c.borderSoft, borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ width: `${p.progress}%`, height: '100%', background: p.accent }}/>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: fontMono, fontSize: 12, color: c.ink, fontWeight: 600 }}>{p.progress}%</div>
                  <div style={{
                    fontFamily: fontBody, fontSize: 9,
                    color: p.status === 'stalled' ? c.warning : c.inkLight, marginTop: 2,
                  }}>{formatRelative(p.updated_at)}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gift card from OB */}
      <div style={{ padding: '4px 18px 24px' }}>
        <div style={{
          borderRadius: 12, padding: 14,
          background: `linear-gradient(155deg, ${c.skySoft} 0%, ${c.paper} 100%)`,
          border: `1px solid ${c.skySoft}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* Folded letter icon */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="13" rx="2" stroke={c.sky} strokeWidth="1.4" fill={c.paper}/>
            <path d="M3 8l9 6 9-6" stroke={c.sky} strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: fontBody, fontSize: 9, color: c.sky,
              letterSpacing: '0.22em', marginBottom: 3, textTransform: 'uppercase', fontWeight: 600,
            }}>OB先輩からの贈り物</div>
            <div style={{
              fontFamily: fontDisplay, fontSize: 13, color: c.ink,
              lineHeight: 1.5, fontWeight: 500,
            }}>このアプリで、毎日のSONOSAKIが少し見えやすくなりますように。</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message, cta, onClick }) {
  return (
    <div style={{
      padding: 28, textAlign: 'center',
      background: c.paper, border: `1px dashed ${c.border}`, borderRadius: 10,
    }}>
      <div style={{ fontFamily: fontBody, fontSize: 12, color: c.inkSoft, marginBottom: 12 }}>{message}</div>
      {cta && (
        <button onClick={onClick} style={{
          background: c.ink, color: c.paper, border: 'none',
          padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
          fontFamily: fontBody, fontSize: 12, fontWeight: 500,
        }}>{cta}</button>
      )}
    </div>
  );
}

// ── PROJECTS VIEW ────────────────────────────────────────────
function ProjectsView({ state, setView, setSelectedId, openModal }) {
  const [filter, setFilter] = useState('all');
  const filters = [
    { id: 'all',      label: 'すべて' },
    { id: 'on-track', label: '順調' },
    { id: 'stalled',  label: '停滞' },
    { id: 'almost',   label: '大詰め' },
  ];
  const filtered = filter === 'all' ? state.projects : state.projects.filter(p => p.status === filter);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-hide">
      <div style={{ padding: '14px 16px 8px' }}>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 20, fontWeight: 500,
          color: c.ink, lineHeight: 1.2, margin: 0,
        }}>進行中のすべて。</h1>
        <p style={{
          marginTop: 4, fontFamily: fontBody, fontSize: 11, color: c.inkSoft, lineHeight: 1.6,
        }}>{state.projects.length}つのプロジェクトが動いています。</p>
      </div>

      <div style={{
        display: 'flex', gap: 5, padding: '0 16px', marginBottom: 12,
        overflowX: 'auto',
      }} className="scroll-hide">
        {filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            background: f.id === filter ? c.ink : c.paper,
            color: f.id === filter ? c.paper : c.inkSoft,
            border: `1px solid ${f.id === filter ? c.ink : c.border}`,
            padding: '5px 11px', borderRadius: 999,
            fontFamily: fontBody, fontSize: 10, cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}>{f.label}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 ? (
          <EmptyState
            message={filter === 'all' ? 'プロジェクトがありません' : `「${filters.find(f => f.id === filter).label}」のプロジェクトはありません`}
            cta={filter === 'all' ? '+ 追加する' : null}
            onClick={() => openModal('addProject')}
          />
        ) : filtered.map(p => {
          const owner = state.profiles.find(u => u.id === p.owner_id);
          const members = p.member_ids.map(id => state.profiles.find(u => u.id === id)).filter(Boolean);
          return (
            <button key={p.id} onClick={() => { setSelectedId(p.id); setView('detail'); }} style={{
              background: c.paper, border: `1px solid ${c.border}`,
              borderRadius: 12, padding: 14, position: 'relative', overflow: 'hidden',
              cursor: 'pointer', textAlign: 'left', width: '100%',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: p.accent,
              }}/>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8, gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0, paddingLeft: 4 }}>
                  <div style={{
                    fontFamily: fontBody, fontSize: 9, color: c.inkLight,
                    letterSpacing: '0.18em', marginBottom: 3, textTransform: 'uppercase',
                  }}>{p.tag} ・ {owner?.short || ''}</div>
                  <div style={{
                    fontFamily: fontDisplay, fontSize: 14, color: c.ink,
                    lineHeight: 1.3, fontWeight: 500, marginBottom: 6,
                  }}>{p.name}</div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <PhasePill phase={p.phase} full />
                    <StatusPill status={p.status} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: 10, paddingLeft: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontFamily: fontMono, fontSize: 16, color: c.ink, fontWeight: 500 }}>
                    {p.progress}<span style={{ fontSize: 10, color: c.inkLight }}>%</span>
                  </span>
                  <span style={{
                    fontFamily: fontBody, fontSize: 9,
                    color: p.status === 'stalled' ? c.warning : c.inkSoft,
                    fontWeight: p.status === 'stalled' ? 600 : 400,
                  }}>{formatRelative(p.updated_at)} 更新</span>
                </div>
                <div style={{ height: 3, background: c.borderSoft, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress}%`, height: '100%', background: p.accent }}/>
                </div>
              </div>

              <div style={{ paddingLeft: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {members.slice(0, 3).map((m, i) => (
                    <div key={m.id} style={{ marginLeft: i === 0 ? 0 : -4 }}>
                      <Avatar name={m.short} size={18} accent={p.accent} />
                    </div>
                  ))}
                </div>
                <span style={{
                  fontFamily: fontBody, fontSize: 10, color: c.inkSoft,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160,
                }}>NEXT: {p.next_milestone}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── PROJECT DETAIL ───────────────────────────────────────────
function DetailView({ state, projectId, setView, openModal, updateProject }) {
  const p = state.projects.find(x => x.id === projectId);
  if (!p) return null;
  const owner = state.profiles.find(u => u.id === p.owner_id);
  const members = p.member_ids.map(id => state.profiles.find(u => u.id === id)).filter(Boolean);
  const latestUpdate = state.updates
    .filter(u => u.project_id === projectId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
  const recentActivity = state.activity
    .filter(a => a.project_id === projectId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showPhasePicker, setShowPhasePicker] = useState(false);
  const [showProgressEdit, setShowProgressEdit] = useState(false);
  const [tempProgress, setTempProgress] = useState(p.progress);

  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="scroll-hide">
      {/* Top action bar */}
      <div style={{
        padding: '10px 16px 8px',
        background: c.cream, borderBottom: `1px solid ${c.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 5,
      }}>
        <button onClick={() => setView('projects')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: fontBody, fontSize: 12, color: c.inkSoft,
          padding: '4px 0', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.inkSoft} strokeWidth="2" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>戻る
        </button>
        <button onClick={() => openModal('editProject')} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
          fontFamily: fontBody, fontSize: 12, color: c.inkSoft,
        }}>編集</button>
      </div>

      {/* Hero */}
      <div style={{
        padding: '16px 18px 18px',
        background: `linear-gradient(180deg, ${p.accent}1A 0%, ${c.cream} 100%)`,
        borderBottom: `1px solid ${c.borderSoft}`,
      }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: p.accent,
          letterSpacing: '0.22em', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600,
        }}>● {p.tag}</div>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 22, fontWeight: 500,
          color: c.ink, lineHeight: 1.2, margin: 0,
        }}>{p.name}</h1>
        {p.vision && (
          <div style={{
            marginTop: 6, fontFamily: fontDisplay, fontSize: 12, color: c.inkSoft,
            fontStyle: 'italic', lineHeight: 1.5,
          }}>"{p.vision}"</div>
        )}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {owner && <Avatar name={owner.short} size={22} accent={p.accent} />}
          <span style={{ fontFamily: fontBody, fontSize: 11, color: c.ink, fontWeight: 500 }}>{owner?.short}</span>
          <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkLight }}>オーナー</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
            <PhasePill phase={p.phase} onClick={() => { setShowStatusPicker(false); setShowPhasePicker(s => !s); }} full />
            <StatusPill status={p.status} onClick={() => { setShowPhasePicker(false); setShowStatusPicker(s => !s); }} />
          </div>
        </div>
        {showPhasePicker && (
          <div style={{
            marginTop: 10, padding: 10,
            background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {Object.entries(PHASES).map(([key, val]) => (
              <button key={key} onClick={() => {
                updateProject(p.id, { phase: key }, `フェーズを「${val.label}」に変更`);
                setShowPhasePicker(false);
              }} style={{
                padding: '5px 10px', borderRadius: 999,
                background: p.phase === key ? val.bg : 'transparent',
                border: `1px solid ${p.phase === key ? 'transparent' : c.border}`,
                color: p.phase === key ? val.color : c.inkSoft,
                fontFamily: fontBody, fontSize: 11, fontWeight: p.phase === key ? 600 : 400,
                cursor: 'pointer',
              }}>{val.label}</button>
            ))}
          </div>
        )}
        {showStatusPicker && (
          <div style={{
            marginTop: 10, padding: 10,
            background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10,
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {Object.entries(STATUS).map(([key, val]) => (
              <button key={key} onClick={() => {
                updateProject(p.id, { status: key }, `ステータスを「${val.label}」に変更`);
                setShowStatusPicker(false);
              }} style={{
                padding: '5px 10px', borderRadius: 999,
                background: p.status === key ? val.bg : 'transparent',
                border: `1px solid ${p.status === key ? 'transparent' : c.border}`,
                color: p.status === key ? val.fg : c.inkSoft,
                fontFamily: fontBody, fontSize: 11, fontWeight: p.status === key ? 600 : 400,
                cursor: 'pointer',
              }}>{val.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Phase progress */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.2em', marginBottom: 8, textTransform: 'uppercase',
        }}>フェーズの歩み</div>
        <PhaseProgress phase={p.phase} />
        <div style={{
          marginTop: 6, display: 'flex', justifyContent: 'space-between',
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
        }}>
          {Object.values(PHASES).map(ph => (
            <span key={ph.label}>{ph.short}</span>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ padding: '14px 18px 4px' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.2em', marginBottom: 6, textTransform: 'uppercase',
        }}>{PHASES[p.phase]?.label || ''} 内の進捗</div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: fontMono, fontSize: 28, color: c.ink, fontWeight: 500 }}>
            {p.progress}<span style={{ fontSize: 14, color: c.inkLight }}>%</span>
          </span>
          <button onClick={() => { setTempProgress(p.progress); setShowProgressEdit(s => !s); }} style={{
            background: showProgressEdit ? c.ink : 'transparent',
            color: showProgressEdit ? c.paper : c.inkSoft,
            border: `1px solid ${showProgressEdit ? c.ink : c.border}`,
            padding: '5px 10px', borderRadius: 6, cursor: 'pointer',
            fontFamily: fontBody, fontSize: 10,
          }}>{showProgressEdit ? '閉じる' : '更新する'}</button>
        </div>
        <div style={{ height: 5, background: c.borderSoft, borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${p.progress}%`, height: '100%', background: p.accent, transition: 'width 200ms' }}/>
        </div>
        {showProgressEdit && (
          <div style={{ marginTop: 12, padding: 12, background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkSoft }}>新しい進捗</span>
              <span style={{ fontFamily: fontMono, fontSize: 18, color: c.ink, fontWeight: 600 }}>{tempProgress}%</span>
            </div>
            <input type="range" min="0" max="100" value={tempProgress} onChange={e => setTempProgress(Number(e.target.value))}
              style={{ width: '100%', accentColor: p.accent }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setShowProgressEdit(false)} style={{
                flex: 1, background: 'transparent', border: `1px solid ${c.border}`,
                padding: '8px', borderRadius: 8, fontFamily: fontBody, fontSize: 12, color: c.inkSoft, cursor: 'pointer',
              }}>キャンセル</button>
              <button onClick={() => {
                updateProject(p.id, { progress: tempProgress }, `進捗を ${p.progress}% → ${tempProgress}% に更新`);
                setShowProgressEdit(false);
              }} style={{
                flex: 1, background: c.ink, color: c.paper, border: 'none',
                padding: '8px', borderRadius: 8, fontFamily: fontBody, fontSize: 12, fontWeight: 500, cursor: 'pointer',
              }}>保存</button>
            </div>
          </div>
        )}
      </div>

      {/* Next milestone */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10, padding: 12,
        }}>
          <div style={{
            fontFamily: fontBody, fontSize: 9, color: c.inkLight,
            letterSpacing: '0.2em', marginBottom: 6, textTransform: 'uppercase',
          }}>NEXT MILESTONE</div>
          <div style={{ fontFamily: fontDisplay, fontSize: 14, color: c.ink, fontWeight: 500 }}>
            {p.next_milestone || <span style={{ color: c.inkLight, fontStyle: 'italic' }}>未設定</span>}
          </div>
        </div>
      </div>

      {/* Members */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.2em', marginBottom: 8, textTransform: 'uppercase',
        }}>メンバー ({members.length})</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {members.map(m => (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px 5px 5px',
              background: c.paper, border: `1px solid ${c.border}`, borderRadius: 999,
            }}>
              <Avatar name={m.short} size={20} accent={p.accent} />
              <span style={{ fontFamily: fontBody, fontSize: 11, color: c.ink }}>{m.short}</span>
            </div>
          ))}
        </div>
      </div>

      {/* This week's update */}
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{
            fontFamily: fontBody, fontSize: 9, color: c.inkLight,
            letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>最新の更新 {latestUpdate && `・ ${formatRelative(latestUpdate.created_at)}`}</div>
          <button onClick={() => openModal('weeklyUpdate')} style={{
            background: c.accent, color: c.paper, border: 'none',
            padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
            fontFamily: fontBody, fontSize: 10, fontWeight: 500,
          }}>+ 投稿する</button>
        </div>
        {latestUpdate ? (
          <div style={{ background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10, padding: 14 }}>
            {latestUpdate.did && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontFamily: fontBody, fontSize: 9, color: c.sage, letterSpacing: '0.16em', marginBottom: 4, fontWeight: 600 }}>✓ やったこと</div>
                <div style={{ fontFamily: fontBody, fontSize: 12, color: c.ink, lineHeight: 1.6 }}>{latestUpdate.did}</div>
              </div>
            )}
            {latestUpdate.will_do && (
              <div style={{ marginBottom: latestUpdate.blockers ? 10 : 0 }}>
                <div style={{ fontFamily: fontBody, fontSize: 9, color: c.sky, letterSpacing: '0.16em', marginBottom: 4, fontWeight: 600 }}>→ 来週やること</div>
                <div style={{ fontFamily: fontBody, fontSize: 12, color: c.ink, lineHeight: 1.6 }}>{latestUpdate.will_do}</div>
              </div>
            )}
            {latestUpdate.blockers && (
              <div>
                <div style={{ fontFamily: fontBody, fontSize: 9, color: c.warning, letterSpacing: '0.16em', marginBottom: 4, fontWeight: 600 }}>⚠ 困っていること</div>
                <div style={{ fontFamily: fontBody, fontSize: 12, color: c.ink, lineHeight: 1.6 }}>{latestUpdate.blockers}</div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: 14, background: c.paper, border: `1px dashed ${c.border}`,
            borderRadius: 10, textAlign: 'center',
          }}>
            <div style={{ fontFamily: fontBody, fontSize: 11, color: c.inkSoft }}>まだ更新がありません</div>
          </div>
        )}
      </div>

      {/* Activity */}
      <div style={{ padding: '14px 18px 24px' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.2em', marginBottom: 8, textTransform: 'uppercase',
        }}>最近の動き</div>
        {recentActivity.length === 0 ? (
          <div style={{ fontFamily: fontBody, fontSize: 11, color: c.inkLight, padding: '8px 0' }}>まだ動きがありません</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentActivity.map(a => {
              const u = state.profiles.find(x => x.id === a.user_id);
              return (
                <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: c.inkLight, flexShrink: 0 }}/>
                  <span style={{ fontFamily: fontMono, fontSize: 9, color: c.inkLight, width: 56, flexShrink: 0 }}>
                    {formatRelative(a.created_at)}
                  </span>
                  <span style={{ fontFamily: fontBody, fontSize: 11, color: c.ink, fontWeight: 500 }}>{u?.short}</span>
                  <span style={{
                    fontFamily: fontBody, fontSize: 11, color: c.inkSoft,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{a.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── FEED VIEW ────────────────────────────────────────────────
function FeedView({ state, setView, setSelectedId }) {
  const allActivity = useMemo(() => [
    ...state.updates.map(u => ({
      id: u.id, kind: 'weekly_update', project_id: u.project_id, user_id: u.user_id,
      created_at: u.created_at, payload: u,
    })),
    ...state.activity.map(a => ({
      id: a.id, kind: a.kind, project_id: a.project_id, user_id: a.user_id,
      created_at: a.created_at, payload: a,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), [state.updates, state.activity]);

  return (
    <div style={{ flex: 1, overflowY: 'auto' }} className="scroll-hide">
      <div style={{ padding: '14px 16px 8px' }}>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 20, fontWeight: 500,
          color: c.ink, lineHeight: 1.2, margin: 0,
        }}>みんなの動き。</h1>
        <p style={{
          marginTop: 4, fontFamily: fontBody, fontSize: 11, color: c.inkSoft, lineHeight: 1.6,
        }}>すべてのプロジェクトの活動が時系列で並びます。</p>
      </div>

      <div style={{ padding: '8px 16px 24px' }}>
        {allActivity.length === 0 ? (
          <EmptyState message="まだ動きがありません" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allActivity.map(a => {
              const project = state.projects.find(p => p.id === a.project_id);
              const user = state.profiles.find(u => u.id === a.user_id);
              if (!project) return null;
              const isUpdate = a.kind === 'weekly_update';
              return (
                <button key={a.id} onClick={() => { setSelectedId(project.id); setView('detail'); }} style={{
                  background: c.paper, border: `1px solid ${c.border}`,
                  borderRadius: 10, padding: 12, cursor: 'pointer',
                  textAlign: 'left', width: '100%', position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: project.accent,
                  }}/>
                  <div style={{ paddingLeft: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      {user && <Avatar name={user.short} size={18} accent={project.accent} />}
                      <span style={{ fontFamily: fontBody, fontSize: 11, color: c.ink, fontWeight: 600 }}>{user?.short}</span>
                      <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkLight }}>・</span>
                      <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkLight }}>{formatRelative(a.created_at)}</span>
                      <span style={{ marginLeft: 'auto' }}>
                        <Pill bg="transparent" border={c.borderSoft} color={project.accent}>{project.name}</Pill>
                      </span>
                    </div>
                    {isUpdate ? (
                      <div>
                        <div style={{
                          fontFamily: fontDisplay, fontSize: 13, color: c.ink, fontWeight: 500, marginBottom: 4,
                        }}>今週の更新を投稿</div>
                        <div style={{
                          fontFamily: fontBody, fontSize: 11, color: c.inkSoft, lineHeight: 1.6,
                          display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden',
                        }}>{a.payload.did}</div>
                      </div>
                    ) : (
                      <div style={{ fontFamily: fontBody, fontSize: 12, color: c.ink, lineHeight: 1.5 }}>
                        {a.payload.text}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PROFILE VIEW (with member management) ───────────────────
function ProfileView({ state, setState, switchUser, addProfile, updateProfile, deleteProfile }) {
  const me = state.profiles.find(p => p.id === state.currentUserId);
  const myProjects = state.projects.filter(p => p.member_ids.includes(me.id));
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Group by role
  const grouped = ['rep', 'pm', 'member', 'ob'].map(role => ({
    role,
    label: ROLES[role].label,
    members: state.profiles.filter(p => p.role === role),
  })).filter(g => g.members.length > 0);

  const reset = () => {
    if (confirm('すべてのデータを初期化しますか？\nこの操作は元に戻せません。')) {
      setState(seedData());
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="scroll-hide">
      <div style={{ padding: '24px 18px 18px', textAlign: 'center' }}>
        <div style={{
          margin: '0 auto', width: 64, height: 64, borderRadius: '50%',
          background: c.paper, border: `2px solid ${me.accent}`,
          color: me.accent, fontFamily: fontDisplay, fontSize: 28,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{me.short[0]}</div>
        <h1 style={{
          fontFamily: fontDisplay, fontSize: 20, fontWeight: 500,
          color: c.ink, marginTop: 12, marginBottom: 4,
        }}>{me.name}</h1>
        <div style={{
          fontFamily: fontBody, fontSize: 10, color: c.inkLight, letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>{ROLES[me.role].label} ・ {myProjects.length}プロジェクト参加中</div>
      </div>

      {/* Members management */}
      <div style={{ padding: '8px 18px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: fontBody, fontSize: 9, color: c.inkLight,
            letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>メンバー ({state.profiles.length})</div>
          <button onClick={() => setShowAdd(true)} style={{
            background: c.ink, color: c.paper, border: 'none',
            padding: '4px 10px', borderRadius: 999,
            fontFamily: fontBody, fontSize: 10, fontWeight: 500, cursor: 'pointer',
          }}>+ 追加</button>
        </div>

        <div style={{
          background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10, overflow: 'hidden',
        }}>
          {grouped.map((group, gi) => (
            <div key={group.role}>
              <div style={{
                padding: '8px 14px 4px', fontFamily: fontBody, fontSize: 9,
                color: ROLES[group.role].color, letterSpacing: '0.18em',
                textTransform: 'uppercase', fontWeight: 600,
                borderTop: gi === 0 ? 'none' : `1px solid ${c.borderSoft}`,
                background: c.cream,
              }}>{group.label}</div>
              {group.members.map(u => (
                <button key={u.id} onClick={() => setEditingId(u.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  width: '100%', padding: '10px 14px', cursor: 'pointer',
                  background: u.id === state.currentUserId ? `${c.accent}10` : 'transparent',
                  border: 'none', borderTop: `1px solid ${c.borderSoft}`,
                  fontFamily: fontBody, textAlign: 'left',
                }}>
                  <Avatar name={u.short} size={28} accent={u.accent} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, color: c.ink, fontWeight: 500,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{u.name}</div>
                    <div style={{ fontSize: 10, color: c.inkLight, marginTop: 2 }}>
                      {state.projects.filter(p => p.member_ids.includes(u.id)).length}プロジェクト参加
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {u.id === state.currentUserId && (
                      <span style={{
                        fontFamily: fontMono, fontSize: 8, color: c.accent,
                        letterSpacing: '0.16em', fontWeight: 700,
                      }}>YOU</span>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); switchUser(u.id); }} style={{
                      background: 'transparent', border: `1px solid ${c.border}`,
                      padding: '3px 8px', borderRadius: 999,
                      fontFamily: fontBody, fontSize: 9, color: c.inkSoft, cursor: 'pointer',
                    }}>切替</button>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
        <p style={{
          marginTop: 8, fontFamily: fontBody, fontSize: 10, color: c.inkLight, lineHeight: 1.6,
        }}>※ メンバーをタップで編集、「切替」で別メンバー視点を試せます。</p>
      </div>

      {/* Settings */}
      <div style={{ padding: '8px 18px 24px' }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: c.inkLight,
          letterSpacing: '0.22em', marginBottom: 8, textTransform: 'uppercase',
        }}>このプロトタイプについて</div>
        <div style={{
          background: c.paper, border: `1px solid ${c.border}`, borderRadius: 10,
          padding: 14, fontFamily: fontBody, fontSize: 11, color: c.inkSoft, lineHeight: 1.7,
        }}>
          データはこのブラウザに保存されています。<br/>
          チームで共有するには、Supabase + ノーコードツールで本番環境に実装してください。
        </div>
        <button onClick={reset} style={{
          marginTop: 10, width: '100%', background: 'transparent',
          border: `1px solid ${c.warningSoft}`, color: c.warning,
          padding: 12, borderRadius: 10, cursor: 'pointer',
          fontFamily: fontBody, fontSize: 12, fontWeight: 500,
        }}>データを初期化する</button>
      </div>

      {showAdd && (
        <MemberModal onClose={() => setShowAdd(false)} onSubmit={(data) => { addProfile(data); setShowAdd(false); }} />
      )}
      {editingId && (
        <MemberModal
          existing={state.profiles.find(p => p.id === editingId)}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => { updateProfile(editingId, data); setEditingId(null); }}
          onDelete={editingId !== state.currentUserId ? () => {
            if (confirm('このメンバーを削除しますか？')) {
              deleteProfile(editingId);
              setEditingId(null);
            }
          } : null}
        />
      )}
    </div>
  );
}

// ── MEMBER MODAL ─────────────────────────────────────────────
function MemberModal({ existing, onClose, onSubmit, onDelete }) {
  const [name, setName] = useState(existing?.name || '');
  const [short, setShort] = useState(existing?.short || '');
  const [role, setRole] = useState(existing?.role || 'member');
  const [accentIdx, setAccentIdx] = useState(
    existing ? Math.max(0, projectColors.indexOf(existing.accent)) : 0
  );

  const submit = () => {
    if (!name.trim() || !short.trim()) return;
    onSubmit({
      name: name.trim(),
      short: short.trim(),
      role,
      accent: projectColors[accentIdx],
    });
  };

  return (
    <ModalShell title={existing ? 'メンバーを編集' : 'メンバーを追加'}
      onClose={onClose} onSubmit={submit} submitLabel="保存"
      canSubmit={name.trim().length > 0 && short.trim().length > 0}>
      <FormField label="名前" required>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus
          placeholder="例：板橋" style={inputStyle} />
      </FormField>

      <FormField label="表示名（短縮）" required hint="アイコン1文字目に使われます">
        <input value={short} onChange={e => setShort(e.target.value)}
          placeholder="例：板" style={inputStyle} maxLength={4} />
      </FormField>

      <FormField label="役割">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Object.entries(ROLES).map(([key, val]) => (
            <button key={key} onClick={() => setRole(key)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: role === key ? val.color : c.paper,
              color: role === key ? c.paper : c.inkSoft,
              border: `1px solid ${role === key ? val.color : c.border}`,
              fontFamily: fontBody, fontSize: 11, cursor: 'pointer',
              fontWeight: role === key ? 600 : 400,
            }}>{val.label}</button>
          ))}
        </div>
      </FormField>

      <FormField label="アバターカラー">
        <div style={{ display: 'flex', gap: 8 }}>
          {projectColors.map((color, i) => (
            <button key={i} onClick={() => setAccentIdx(i)} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: color, cursor: 'pointer',
              border: accentIdx === i ? `3px solid ${c.ink}` : `2px solid ${c.border}`,
              boxShadow: accentIdx === i ? `0 0 0 2px ${c.paper} inset` : 'none',
            }}/>
          ))}
        </div>
      </FormField>

      {onDelete && (
        <button onClick={onDelete} style={{
          marginTop: 16, width: '100%', background: 'transparent',
          border: `1px solid ${c.warningSoft}`, color: c.warning,
          padding: 11, borderRadius: 10, cursor: 'pointer',
          fontFamily: fontBody, fontSize: 12, fontWeight: 500,
        }}>このメンバーを削除</button>
      )}
    </ModalShell>
  );
}

// ── ADD PROJECT MODAL ────────────────────────────────────────
function AddProjectModal({ state, onClose, addProject }) {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('事業');
  const [vision, setVision] = useState('');
  const [next, setNext] = useState('');
  const [phase, setPhase] = useState('ideation');
  const [colorIdx, setColorIdx] = useState(state.projects.length % projectColors.length);
  const [memberIds, setMemberIds] = useState([state.currentUserId]);

  const me = state.profiles.find(p => p.id === state.currentUserId);
  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    addProject({
      name: name.trim(), tag,
      vision: vision.trim(),
      owner_id: state.currentUserId,
      member_ids: memberIds,
      next_milestone: next.trim(),
      accent: projectColors[colorIdx],
      phase, status: 'planning', progress: 0,
    });
    onClose();
  };

  return (
    <ModalShell title="新しいプロジェクト" onClose={onClose} onSubmit={submit} submitLabel="作成" canSubmit={canSubmit}>
      <FormField label="プロジェクト名" required>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus
          placeholder="例：その先を照らせプロジェクト" style={inputStyle} />
      </FormField>

      <FormField label="ビジョン・目的" hint="任意">
        <input value={vision} onChange={e => setVision(e.target.value)}
          placeholder="このプロジェクトで何を実現したいか" style={inputStyle} />
      </FormField>

      <FormField label="現在のフェーズ">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.entries(PHASES).map(([key, val]) => (
            <button key={key} onClick={() => setPhase(key)} style={{
              padding: '5px 11px', borderRadius: 999,
              background: phase === key ? val.bg : c.paper,
              border: `1px solid ${phase === key ? 'transparent' : c.border}`,
              color: phase === key ? val.color : c.inkSoft,
              fontFamily: fontBody, fontSize: 11, fontWeight: phase === key ? 600 : 400,
              cursor: 'pointer',
            }}>{val.label}</button>
          ))}
        </div>
      </FormField>

      <FormField label="カテゴリ">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: tag === t ? c.ink : c.paper,
              color: tag === t ? c.paper : c.inkSoft,
              border: `1px solid ${tag === t ? c.ink : c.border}`,
              fontFamily: fontBody, fontSize: 11, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </FormField>

      <FormField label="プロジェクトカラー">
        <div style={{ display: 'flex', gap: 8 }}>
          {projectColors.map((color, i) => (
            <button key={i} onClick={() => setColorIdx(i)} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: color, cursor: 'pointer',
              border: colorIdx === i ? `3px solid ${c.ink}` : `2px solid ${c.border}`,
              boxShadow: colorIdx === i ? `0 0 0 2px ${c.paper} inset` : 'none',
            }}/>
          ))}
        </div>
      </FormField>

      <FormField label="次のマイルストーン" hint="任意">
        <input value={next} onChange={e => setNext(e.target.value)}
          placeholder="例：第1章のドラフトを完成" style={inputStyle} />
      </FormField>

      <FormField label="メンバー">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {state.profiles.map(u => {
            const selected = memberIds.includes(u.id);
            return (
              <button key={u.id} onClick={() => {
                setMemberIds(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id]);
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 5px', borderRadius: 999,
                background: selected ? c.ink : c.paper,
                border: `1px solid ${selected ? c.ink : c.border}`,
                color: selected ? c.paper : c.inkSoft,
                fontFamily: fontBody, fontSize: 11, cursor: 'pointer',
              }}>
                <Avatar name={u.short} size={20} accent={u.accent} />
                {u.short}
              </button>
            );
          })}
        </div>
      </FormField>

      <p style={{
        fontFamily: fontBody, fontSize: 10, color: c.inkLight, lineHeight: 1.6,
        margin: '4px 0 0',
      }}>オーナーは作成者（{me.short}）に設定されます。あとで変更できます。</p>
    </ModalShell>
  );
}

// ── WEEKLY UPDATE MODAL ──────────────────────────────────────
function WeeklyUpdateModal({ state, projectId, onClose, addUpdate, updateProject }) {
  const p = state.projects.find(x => x.id === projectId);
  const [did, setDid] = useState('');
  const [will, setWill] = useState('');
  const [block, setBlock] = useState('');
  const [status, setStatus] = useState(p.status);
  const [progress, setProgress] = useState(p.progress);

  const submit = () => {
    if (!did.trim()) return;
    addUpdate({
      project_id: projectId,
      user_id: state.currentUserId,
      week_of: new Date().toISOString().split('T')[0],
      did: did.trim(), will_do: will.trim(), blockers: block.trim(),
      status_at_update: status, progress_at_update: progress,
    });
    const changes = {};
    if (status !== p.status) changes.status = status;
    if (progress !== p.progress) changes.progress = progress;
    if (Object.keys(changes).length > 0) {
      updateProject(projectId, changes, '今週の更新を投稿');
    } else {
      updateProject(projectId, {}, '今週の更新を投稿');
    }
    onClose();
  };

  return (
    <ModalShell title="今週の更新" onClose={onClose} onSubmit={submit} submitLabel="送信" canSubmit={did.trim().length > 0}>
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontFamily: fontBody, fontSize: 9, color: p.accent,
          letterSpacing: '0.22em', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600,
        }}>● {p.tag}</div>
        <div style={{ fontFamily: fontDisplay, fontSize: 16, color: c.ink, fontWeight: 500 }}>{p.name}</div>
      </div>

      <FormField label="今週やったこと" required iconColor={c.sage} icon="check">
        <textarea value={did} onChange={e => setDid(e.target.value)} autoFocus
          placeholder="3行ほどで簡潔に" style={{ ...inputStyle, minHeight: 60, resize: 'none' }} />
      </FormField>

      <FormField label="来週やること" iconColor={c.sky} icon="arrow">
        <textarea value={will} onChange={e => setWill(e.target.value)}
          placeholder="次の一歩を3つまで" style={{ ...inputStyle, minHeight: 60, resize: 'none' }} />
      </FormField>

      <FormField label="困っていること" hint="任意" iconColor={c.warning} icon="warn">
        <textarea value={block} onChange={e => setBlock(e.target.value)}
          placeholder="助けてほしいこと、悩んでいること" style={{ ...inputStyle, minHeight: 50, resize: 'none' }} />
      </FormField>

      <FormField label="ステータス">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.entries(STATUS).map(([key, val]) => (
            <button key={key} onClick={() => setStatus(key)} style={{
              padding: '5px 11px', borderRadius: 999,
              background: status === key ? val.bg : c.paper,
              border: `1px solid ${status === key ? 'transparent' : c.border}`,
              color: status === key ? val.fg : c.inkSoft,
              fontFamily: fontBody, fontSize: 11, fontWeight: status === key ? 600 : 400,
              cursor: 'pointer',
            }}>{val.label}</button>
          ))}
        </div>
      </FormField>

      <FormField label="進捗">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkLight }}>前回 {p.progress}%</span>
          <span style={{ fontFamily: fontMono, fontSize: 18, color: c.ink, fontWeight: 600 }}>{progress}%</span>
        </div>
        <input type="range" min="0" max="100" value={progress} onChange={e => setProgress(Number(e.target.value))}
          style={{ width: '100%', accentColor: p.accent }} />
      </FormField>
    </ModalShell>
  );
}

// ── EDIT PROJECT MODAL ───────────────────────────────────────
function EditProjectModal({ state, projectId, onClose, updateProject, deleteProject }) {
  const p = state.projects.find(x => x.id === projectId);
  const [name, setName] = useState(p.name);
  const [tag, setTag] = useState(p.tag);
  const [vision, setVision] = useState(p.vision || '');
  const [phase, setPhase] = useState(p.phase || 'ideation');
  const [next, setNext] = useState(p.next_milestone || '');
  const [memberIds, setMemberIds] = useState(p.member_ids);
  const [colorIdx, setColorIdx] = useState(projectColors.indexOf(p.accent) >= 0 ? projectColors.indexOf(p.accent) : 0);
  const [ownerId, setOwnerId] = useState(p.owner_id);

  const submit = () => {
    if (!name.trim()) return;
    updateProject(p.id, {
      name: name.trim(), tag,
      vision: vision.trim(),
      phase,
      next_milestone: next.trim(),
      member_ids: memberIds.includes(ownerId) ? memberIds : [...memberIds, ownerId],
      accent: projectColors[colorIdx],
      owner_id: ownerId,
    }, '情報を編集');
    onClose();
  };

  const remove = () => {
    if (confirm(`「${p.name}」を削除しますか？\nこの操作は元に戻せません。`)) {
      deleteProject(p.id);
      onClose();
    }
  };

  return (
    <ModalShell title="プロジェクトを編集" onClose={onClose} onSubmit={submit} submitLabel="保存" canSubmit={name.trim().length > 0}>
      <FormField label="プロジェクト名" required>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      </FormField>

      <FormField label="ビジョン・目的">
        <input value={vision} onChange={e => setVision(e.target.value)} style={inputStyle} />
      </FormField>

      <FormField label="現在のフェーズ">
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {Object.entries(PHASES).map(([key, val]) => (
            <button key={key} onClick={() => setPhase(key)} style={{
              padding: '5px 11px', borderRadius: 999,
              background: phase === key ? val.bg : c.paper,
              border: `1px solid ${phase === key ? 'transparent' : c.border}`,
              color: phase === key ? val.color : c.inkSoft,
              fontFamily: fontBody, fontSize: 11, fontWeight: phase === key ? 600 : 400,
              cursor: 'pointer',
            }}>{val.label}</button>
          ))}
        </div>
      </FormField>

      <FormField label="カテゴリ">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {TAGS.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{
              padding: '6px 12px', borderRadius: 999,
              background: tag === t ? c.ink : c.paper,
              color: tag === t ? c.paper : c.inkSoft,
              border: `1px solid ${tag === t ? c.ink : c.border}`,
              fontFamily: fontBody, fontSize: 11, cursor: 'pointer',
            }}>{t}</button>
          ))}
        </div>
      </FormField>

      <FormField label="プロジェクトカラー">
        <div style={{ display: 'flex', gap: 8 }}>
          {projectColors.map((color, i) => (
            <button key={i} onClick={() => setColorIdx(i)} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: color, cursor: 'pointer',
              border: colorIdx === i ? `3px solid ${c.ink}` : `2px solid ${c.border}`,
              boxShadow: colorIdx === i ? `0 0 0 2px ${c.paper} inset` : 'none',
            }}/>
          ))}
        </div>
      </FormField>

      <FormField label="次のマイルストーン">
        <input value={next} onChange={e => setNext(e.target.value)} style={inputStyle} />
      </FormField>

      <FormField label="オーナー">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {state.profiles.map(u => {
            const selected = ownerId === u.id;
            return (
              <button key={u.id} onClick={() => setOwnerId(u.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 5px', borderRadius: 999,
                background: selected ? c.ink : c.paper,
                border: `1px solid ${selected ? c.ink : c.border}`,
                color: selected ? c.paper : c.inkSoft,
                fontFamily: fontBody, fontSize: 11, cursor: 'pointer',
              }}>
                <Avatar name={u.short} size={20} accent={u.accent} />
                {u.short}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="メンバー">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {state.profiles.map(u => {
            const selected = memberIds.includes(u.id);
            const isOwner = u.id === ownerId;
            return (
              <button key={u.id} disabled={isOwner} onClick={() => {
                setMemberIds(prev => prev.includes(u.id) ? prev.filter(x => x !== u.id) : [...prev, u.id]);
              }} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px 5px 5px', borderRadius: 999,
                background: selected ? c.ink : c.paper,
                border: `1px solid ${selected ? c.ink : c.border}`,
                color: selected ? c.paper : c.inkSoft,
                fontFamily: fontBody, fontSize: 11,
                cursor: isOwner ? 'not-allowed' : 'pointer',
                opacity: isOwner ? 0.6 : 1,
              }}>
                <Avatar name={u.short} size={20} accent={u.accent} />
                {u.short}{isOwner && ' (オーナー)'}
              </button>
            );
          })}
        </div>
      </FormField>

      <button onClick={remove} style={{
        marginTop: 16, width: '100%', background: 'transparent',
        border: `1px solid ${c.warningSoft}`, color: c.warning,
        padding: 11, borderRadius: 10, cursor: 'pointer',
        fontFamily: fontBody, fontSize: 12, fontWeight: 500,
      }}>このプロジェクトを削除</button>
    </ModalShell>
  );
}

// ── Modal shell ──────────────────────────────────────────────
function ModalShell({ title, onClose, onSubmit, submitLabel, canSubmit, children }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      background: c.cream, display: 'flex', flexDirection: 'column',
      zIndex: 50, animation: 'slideUp 240ms cubic-bezier(0.32, 0.72, 0.32, 1)',
    }}>
      <div style={{
        padding: '12px 16px 10px',
        background: c.cream, borderBottom: `1px solid ${c.borderSoft}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: fontBody, fontSize: 12, color: c.inkSoft,
        }}>キャンセル</button>
        <div style={{ fontFamily: fontDisplay, fontSize: 14, color: c.ink, fontWeight: 500 }}>{title}</div>
        <button onClick={onSubmit} disabled={!canSubmit} style={{
          background: 'transparent', border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed',
          fontFamily: fontBody, fontSize: 12, color: canSubmit ? c.accent : c.inkLight,
          fontWeight: 600, opacity: canSubmit ? 1 : 0.5,
        }}>{submitLabel}</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 24px' }} className="scroll-hide">
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: c.paper, border: `1px solid ${c.border}`,
  borderRadius: 10, padding: 12,
  fontFamily: fontBody, fontSize: 13, color: c.ink, lineHeight: 1.5,
  outline: 'none',
};

function FormField({ label, hint, required, icon, iconColor, children }) {
  const iconNode = icon === 'check' ? (
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: `${iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="8" height="8" viewBox="0 0 12 12"><path d="M2 6.5L4.5 9L10 3" stroke={iconColor} strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
    </span>
  ) : icon === 'arrow' ? (
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: `${iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke={iconColor} strokeWidth="2"><path d="M3 6h6M7 3l3 3-3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
  ) : icon === 'warn' ? (
    <span style={{ width: 14, height: 14, borderRadius: '50%', background: `${iconColor}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: iconColor, fontWeight: 700 }}>!</span>
  ) : null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        {iconNode}
        <span style={{
          fontFamily: fontBody, fontSize: 11,
          color: iconColor || c.inkSoft, fontWeight: iconColor ? 600 : 500,
          letterSpacing: '0.04em',
        }}>{label}{required && <span style={{ color: c.accent, marginLeft: 3 }}>*</span>}</span>
        {hint && <span style={{ fontFamily: fontBody, fontSize: 10, color: c.inkLight }}>（{hint}）</span>}
      </div>
      {children}
    </div>
  );
}

// ── BOTTOM TABS ──────────────────────────────────────────────
function BottomTabs({ active, setView }) {
  const tabs = [
    { id: 'home',     label: 'ホーム',     icon: 'home' },
    { id: 'projects', label: 'プロジェクト', icon: 'stack' },
    { id: 'feed',     label: '動き',       icon: 'pulse' },
    { id: 'me',       label: 'マイ',       icon: 'user' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${c.border}`,
      padding: '6px 4px 8px',
      display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
      background: c.paper, flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} onClick={() => setView(t.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            padding: '6px 4px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 3, position: 'relative',
          }}>
            <TabIcon name={t.icon} active={isActive} />
            <span style={{
              fontFamily: fontBody, fontSize: 9,
              color: isActive ? c.accent : c.inkLight,
              fontWeight: isActive ? 600 : 400,
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TabIcon({ name, active }) {
  const s = active ? c.accent : c.inkLight;
  if (name === 'home') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1v-9z" stroke={s} strokeWidth="1.5" strokeLinejoin="round" fill={active ? c.accentSoft : 'none'}/>
    </svg>
  );
  if (name === 'stack') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="4" width="16" height="4" rx="1" stroke={s} strokeWidth="1.5" fill={active ? c.accentSoft : 'none'}/>
      <rect x="4" y="10" width="16" height="4" rx="1" stroke={s} strokeWidth="1.5"/>
      <rect x="4" y="16" width="16" height="4" rx="1" stroke={s} strokeWidth="1.5"/>
    </svg>
  );
  if (name === 'pulse') return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 12h3l3-7 4 14 3-7h5" stroke={s} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke={s} strokeWidth="1.5" fill={active ? c.accentSoft : 'none'}/>
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke={s} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ── FAB ──────────────────────────────────────────────────────
function FAB({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 16, bottom: 78, zIndex: 25,
      width: 50, height: 50, borderRadius: '50%',
      background: `linear-gradient(155deg, ${c.accent} 0%, ${c.accentDeep} 100%)`,
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 24px -6px ${c.accentDeep}AA, 0 4px 8px -2px rgba(28, 25, 22, 0.15), inset 0 1px 0 rgba(255,255,255,0.3)`,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.paper} strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </button>
  );
}

// ── ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [state, setState, loaded] = useAppState();
  const [view, setView] = useState('home');
  const [selectedId, setSelectedId] = useState(null);
  const [modal, setModal] = useState(null);

  const me = state?.profiles.find(p => p.id === state.currentUserId);

  // ── Mutations ──
  const addProject = (data) => {
    const id = uid();
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      projects: [...prev.projects, { id, created_at: now, updated_at: now, ...data }],
      activity: [
        { id: uid(), project_id: id, user_id: prev.currentUserId, kind: 'create', text: 'プロジェクトを作成', created_at: now },
        ...prev.activity,
      ],
    }));
  };

  const updateProject = (id, changes, activityText) => {
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, ...changes, updated_at: now } : p),
      activity: activityText ? [
        { id: uid(), project_id: id, user_id: prev.currentUserId,
          kind: changes.progress !== undefined ? 'progress' : changes.status !== undefined ? 'status' : 'edit',
          text: activityText, created_at: now },
        ...prev.activity,
      ] : prev.activity,
    }));
  };

  const deleteProject = (id) => {
    setState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      updates: prev.updates.filter(u => u.project_id !== id),
      activity: prev.activity.filter(a => a.project_id !== id),
    }));
    setView('projects');
    setSelectedId(null);
  };

  const addUpdate = (data) => {
    const id = uid();
    const now = new Date().toISOString();
    setState(prev => ({
      ...prev,
      updates: [{ id, created_at: now, ...data }, ...prev.updates],
    }));
  };

  const switchUser = (userId) => {
    setState(prev => ({ ...prev, currentUserId: userId }));
  };

  const addProfile = (data) => {
    const id = uid();
    setState(prev => ({
      ...prev,
      profiles: [...prev.profiles, { id, ...data }],
    }));
  };

  const updateProfile = (id, data) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => p.id === id ? { ...p, ...data } : p),
    }));
  };

  const deleteProfile = (id) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.filter(p => p.id !== id),
      projects: prev.projects.map(p => ({
        ...p,
        member_ids: p.member_ids.filter(mid => mid !== id),
      })),
    }));
  };

  // ── Render ──
  if (!loaded || !state) {
    return (
      <div style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at 50% 0%, #EFE4D0 0%, #DFD2BC 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: fontDisplay, fontSize: 18, color: c.inkSoft, letterSpacing: '0.18em',
      }}>SONOSAKI</div>
    );
  }

  const showFAB = (view === 'home' || view === 'projects') && modal === null;
  const fabAction = () => {
    if (view === 'projects' || view === 'home') setModal('addProject');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 50% 0%, #EFE4D0 0%, #DFD2BC 100%)`,
      fontFamily: fontBody, color: c.ink,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '24px 16px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@400;500;700&family=Zen+Kaku+Gothic+New:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        body, html { margin: 0; padding: 0; }
        button:active:not(:disabled) { transform: scale(0.98); }
        em { font-style: italic; }
        .scroll-hide::-webkit-scrollbar { display: none; }
        .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.4); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        textarea, input { font-family: inherit; }
        textarea::placeholder, input::placeholder { color: ${c.inkLight}; }
        input[type=range] { height: 4px; }
      `}</style>

      <div style={{
        width: 390, maxWidth: '100%',
        background: c.cream,
        borderRadius: 44,
        boxShadow: '0 24px 60px -20px rgba(28, 25, 22, 0.25), 0 8px 16px -4px rgba(28, 25, 22, 0.08), inset 0 0 0 1px rgba(255,255,255,0.6)',
        overflow: 'hidden', position: 'relative',
        height: 'min(844px, calc(100vh - 48px))',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* iOS status bar */}
        <div style={{
          padding: '12px 28px 4px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          fontSize: 14, fontWeight: 600, color: c.ink,
          background: c.cream, position: 'relative', zIndex: 11, flexShrink: 0,
        }}>
          <span>9:41</span>
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: 110, height: 28, background: c.ink, borderRadius: 999,
          }}/>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            <svg width="17" height="11" viewBox="0 0 17 11" fill={c.ink}>
              <rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
              <rect x="9" y="3" width="3" height="8" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
            </svg>
            <svg width="20" height="9" viewBox="0 0 25 11">
              <rect x="0.5" y="0.5" width="22" height="10" rx="2" fill="none" stroke={c.ink} opacity="0.4"/>
              <rect x="2" y="2" width="18" height="7" rx="1" fill={c.ink}/>
              <rect x="23" y="3.5" width="1.5" height="4" rx="0.5" fill={c.ink} opacity="0.4"/>
            </svg>
          </div>
        </div>

        {/* App header (only outside detail view) */}
        {view !== 'detail' && (
          <TopBar
            user={me}
            onAvatarClick={() => setView('me')}
          />
        )}

        {/* Main content */}
        {view === 'home'     && <HomeView state={state} setView={setView} setSelectedId={setSelectedId} openModal={setModal} />}
        {view === 'projects' && <ProjectsView state={state} setView={setView} setSelectedId={setSelectedId} openModal={setModal} />}
        {view === 'feed'     && <FeedView state={state} setView={setView} setSelectedId={setSelectedId} />}
        {view === 'me'       && <ProfileView state={state} setState={setState} switchUser={switchUser}
          addProfile={addProfile} updateProfile={updateProfile} deleteProfile={deleteProfile} />}
        {view === 'detail'   && (
          <DetailView state={state} projectId={selectedId} setView={setView} openModal={setModal} updateProject={updateProject} />
        )}

        {/* FAB */}
        {showFAB && <FAB onClick={fabAction} />}

        {/* Modals */}
        {modal === 'addProject' && (
          <AddProjectModal state={state} onClose={() => setModal(null)} addProject={addProject} />
        )}
        {modal === 'weeklyUpdate' && selectedId && (
          <WeeklyUpdateModal state={state} projectId={selectedId} onClose={() => setModal(null)}
            addUpdate={addUpdate} updateProject={updateProject} />
        )}
        {modal === 'editProject' && selectedId && (
          <EditProjectModal state={state} projectId={selectedId} onClose={() => setModal(null)}
            updateProject={updateProject} deleteProject={deleteProject} />
        )}

        {/* Bottom tabs (hide in detail) */}
        {view !== 'detail' && <BottomTabs active={view} setView={(v) => { setView(v); setSelectedId(null); }} />}

        {/* Home indicator */}
        <div style={{
          padding: '6px 0 10px', display: 'flex', justifyContent: 'center',
          background: c.paper, flexShrink: 0,
        }}>
          <div style={{ width: 134, height: 5, borderRadius: 3, background: c.ink, opacity: 0.85 }}/>
        </div>
      </div>
    </div>
  );
}
