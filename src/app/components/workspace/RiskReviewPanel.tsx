import { useState } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown,
  Minus, ChevronDown, ChevronRight, Info, AlertCircle, Globe, FileText,
  BarChart3, Eye, Flag, XCircle
} from 'lucide-react';

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High';
type ReviewStatus = 'Not Started' | 'In Progress' | 'Complete' | 'Blocked';

interface RiskCategory {
  id: string;
  name: string;
  level: RiskLevel;
  score: number; // 1-5
  trend: 'up' | 'down' | 'stable';
  description: string;
  mitigations: string[];
}

interface ReviewItem {
  id: string;
  reviewer: string;
  role: string;
  avatar: string;
  status: ReviewStatus;
  dueDate: string;
  comment?: string;
  completedDate?: string;
}

interface MarketRisk {
  market: string;
  code: string;
  region: string;
  overallRisk: RiskLevel;
  regulatoryBody: string;
  concerns: string[];
}

const riskCategories: RiskCategory[] = [
  {
    id: 'scientific', name: 'Scientific Substantiation', level: 'Low', score: 2, trend: 'down',
    description: 'Clinical evidence quality and robustness of supporting data',
    mitigations: ['3 independent clinical studies completed', 'ICH E6 GCP compliance verified', 'All primary endpoints met']
  },
  {
    id: 'regulatory', name: 'Regulatory Compliance', level: 'Medium', score: 3, trend: 'stable',
    description: 'Alignment with market-specific regulatory guidelines',
    mitigations: ['EU Cosmetics Regulation reviewed', 'FTC guidelines under review', 'BfR submission pending']
  },
  {
    id: 'legal', name: 'Legal & IP Exposure', level: 'Low', score: 2, trend: 'stable',
    description: 'Intellectual property, trademark, and legal challenge risk',
    mitigations: ['Trademark cleared in 12 markets', 'No competitor prior art identified', 'Qualifier language reviewed']
  },
  {
    id: 'consumer', name: 'Consumer Perception', level: 'Medium', score: 3, trend: 'up',
    description: 'Risk of consumer misinterpretation or misleading claims',
    mitigations: ['Consumer copy testing planned for Q3', 'Claim hierarchy defined', 'Qualifier added to superlative claims']
  },
  {
    id: 'competitive', name: 'Competitive Intelligence', level: 'High', score: 4, trend: 'up',
    description: 'Risk from competitor challenges, ASA/NAD referrals',
    mitigations: ['Competitive landscape monitored monthly', 'NAD pre-clearance option under evaluation']
  },
  {
    id: 'market', name: 'Market Deployment', level: 'Low', score: 1, trend: 'stable',
    description: 'Timing, coordination, and execution risk across markets',
    mitigations: ['Launch timeline confirmed with CMO', 'Market readiness checklist complete']
  }
];

const reviewItems: ReviewItem[] = [
  { id: 'r1', reviewer: 'Michael Chen', role: 'Claims Lead', avatar: 'MC', status: 'Complete', dueDate: '2026-04-20', completedDate: '2026-04-18', comment: 'All claims reviewed. No blocking issues found for global claims 1 & 2.' },
  { id: 'r2', reviewer: 'Emma Williams', role: 'RA Manager', avatar: 'EW', status: 'In Progress', dueDate: '2026-05-10', comment: 'EU review complete. US and APAC markets pending.' },
  { id: 'r3', reviewer: 'Robert Taylor', role: 'Legal Counsel', avatar: 'RT', status: 'In Progress', dueDate: '2026-04-28', comment: 'BfR qualifier language memo in draft.' },
  { id: 'r4', reviewer: 'Lisa Park', role: 'Regulatory Specialist', avatar: 'LP', status: 'Not Started', dueDate: '2026-05-15' },
  { id: 'r5', reviewer: 'Dr. Sarah Johnson', role: 'Project Creator', avatar: 'SJ', status: 'Complete', dueDate: '2026-04-15', completedDate: '2026-04-14', comment: 'Clinical data package finalised and uploaded.' },
];

const marketRisks: MarketRisk[] = [
  { market: 'United Kingdom', code: 'GB', region: 'EMEA', overallRisk: 'Low', regulatoryBody: 'ASA / UK FSA', concerns: [] },
  { market: 'Germany', code: 'DE', region: 'EMEA', overallRisk: 'Medium', regulatoryBody: 'BfR / EFSA', concerns: ['Stricter BfR interpretation of #1 claim', 'Qualifier language needs market approval'] },
  { market: 'United States', code: 'US', region: 'North America', overallRisk: 'High', regulatoryBody: 'FTC / FDA', concerns: ['FTC "restoration" claim standard not met', 'Endorsement claim methodology under review'] },
  { market: 'France', code: 'FR', region: 'EMEA', overallRisk: 'Low', regulatoryBody: 'ANSES / EFSA', concerns: [] },
  { market: 'India', code: 'IN', region: 'South Asia', overallRisk: 'Low', regulatoryBody: 'CDSCO', concerns: ['BIS certification obtained'] },
];

const RISK_CONFIG: Record<RiskLevel, { bg: string; text: string; dot: string; icon: React.ReactNode; scoreRange: string }> = {
  'Low':      { bg: '#D1FAE5', text: '#065F46', dot: '#10B981', icon: <CheckCircle className="w-4 h-4" />, scoreRange: '1–2' },
  'Medium':   { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', icon: <Info className="w-4 h-4" />, scoreRange: '3' },
  'High':     { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444', icon: <AlertTriangle className="w-4 h-4" />, scoreRange: '4' },
  'Very High':{ bg: '#FEE2E2', text: '#7F1D1D', dot: '#DC2626', icon: <XCircle className="w-4 h-4" />, scoreRange: '5' },
};

const REVIEW_CONFIG: Record<ReviewStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  'Not Started': { bg: '#F3F4F6', text: '#6B7280', icon: <Clock className="w-3.5 h-3.5" /> },
  'In Progress': { bg: '#DBEAFE', text: '#1D4ED8', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  'Complete':    { bg: '#D1FAE5', text: '#065F46', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  'Blocked':     { bg: '#FEE2E2', text: '#991B1B', icon: <XCircle className="w-3.5 h-3.5" /> },
};

function ScoreBar({ score, level }: { score: number; level: RiskLevel }) {
  const config = RISK_CONFIG[level];
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="w-6 h-1.5 rounded-sm transition-colors"
            style={{ background: i <= score ? config.dot : '#E5E7EB' }} />
        ))}
      </div>
      <span className="text-xs" style={{ color: config.text }}>{score}/5</span>
    </div>
  );
}

function RiskTile({ category }: { category: RiskCategory }) {
  const [expanded, setExpanded] = useState(false);
  const config = RISK_CONFIG[category.level];
  return (
    <div className="bg-white rounded-xl border border-pebble overflow-hidden hover:shadow-sm transition-shadow">
      <button className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-earth transition-colors"
        onClick={() => setExpanded(!expanded)}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: config.bg, color: config.text }}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-night" style={{ fontWeight: 500 }}>{category.name}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              {category.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-red-500" />}
              {category.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-green-500" />}
              {category.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-gray-400" />}
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: config.bg, color: config.text }}>
                {category.level}
              </span>
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
            </div>
          </div>
          <div className="mt-1">
            <ScoreBar score={category.score} level={category.level} />
          </div>
          <p className="text-xs text-gray-400 mt-1 truncate">{category.description}</p>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-pebble bg-earth/30">
          <p className="text-xs text-gray-600 mb-2 leading-relaxed">{category.description}</p>
          <div className="text-xs text-gray-500 mb-1" style={{ fontWeight: 500 }}>Mitigations in place:</div>
          <ul className="space-y-1">
            {category.mitigations.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ReviewCard({ item }: { item: ReviewItem }) {
  const config = REVIEW_CONFIG[item.status];
  const isOverdue = item.status !== 'Complete' && new Date(item.dueDate) < new Date('2026-04-28');
  return (
    <div className={`bg-white rounded-xl border ${isOverdue && item.status !== 'Complete' ? 'border-red-200' : 'border-pebble'} p-4 hover:shadow-sm transition-shadow`}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-sky text-white flex items-center justify-center text-xs flex-shrink-0">
          {item.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-sm text-night" style={{ fontWeight: 500 }}>{item.reviewer}</div>
              <div className="text-xs text-gray-400">{item.role}</div>
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs flex-shrink-0" style={{ background: config.bg, color: config.text }}>
              {config.icon}
              {item.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className={`flex items-center gap-1 text-xs ${isOverdue && item.status !== 'Complete' ? 'text-red-600' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3" />
              Due: {item.dueDate}
              {isOverdue && item.status !== 'Complete' && <span className="text-red-600 ml-1">(Overdue)</span>}
            </div>
            {item.completedDate && (
              <div className="text-xs text-green-600">✓ Completed {item.completedDate}</div>
            )}
          </div>
          {item.comment && (
            <div className="mt-2 text-xs text-gray-600 bg-earth rounded-lg px-3 py-2 leading-relaxed">
              {item.comment}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RiskReviewPanel() {
  const [activeView, setActiveView] = useState<'overview' | 'reviews' | 'markets'>('overview');

  const totalRiskScore = Math.round(riskCategories.reduce((sum, r) => sum + r.score, 0) / riskCategories.length);
  const overallLevel: RiskLevel = totalRiskScore <= 2 ? 'Low' : totalRiskScore === 3 ? 'Medium' : totalRiskScore === 4 ? 'High' : 'Very High';
  const overallConfig = RISK_CONFIG[overallLevel];

  const completedReviews = reviewItems.filter(r => r.status === 'Complete').length;
  const reviewProgress = Math.round((completedReviews / reviewItems.length) * 100);

  const highRiskMarkets = marketRisks.filter(m => m.overallRisk === 'High' || m.overallRisk === 'Very High').length;

  return (
   <div className="p-6 h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-night">Risk & Review</h2>
            <p className="text-sm text-gray-500 mt-0.5">Claim risk assessment and regulatory review status</p>
          </div>
          {/* Overall risk badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-0.5">Overall Project Risk</div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: overallConfig.dot }} />
                <span className="text-sm px-3 py-1 rounded-full" style={{ background: overallConfig.bg, color: overallConfig.text, fontWeight: 600 }}>
                  {overallLevel} Risk
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Summary tiles row (US-M1-117) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Shield className="w-5 h-5" />, label: 'Overall Risk Score', value: `${totalRiskScore}/5`, sub: overallLevel, color: overallConfig },
            { icon: <Eye className="w-5 h-5 text-sky" />, label: 'Reviews Complete', value: `${completedReviews}/${reviewItems.length}`, sub: `${reviewProgress}%`, color: { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' } },
            { icon: <Globe className="w-5 h-5 text-amber-600" />, label: 'High Risk Markets', value: String(highRiskMarkets), sub: `of ${marketRisks.length} markets`, color: highRiskMarkets > 0 ? { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' } : { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' } },
            { icon: <Flag className="w-5 h-5 text-purple-600" />, label: 'Open Actions', value: '3', sub: '1 overdue', color: { bg: '#F3E8FF', text: '#7C3AED', dot: '#8B5CF6' } },
          ].map((tile, i) => (
            <div key={i} className="bg-white rounded-xl border border-pebble p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ background: tile.color.bg }}>{tile.icon}</div>
                <div className="w-2 h-2 rounded-full mt-1" style={{ background: tile.color.dot }} />
              </div>
              <div className="text-xl text-night" style={{ fontWeight: 600 }}>{tile.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{tile.label}</div>
              <div className="text-xs mt-1" style={{ color: tile.color.text }}>{tile.sub}</div>
            </div>
           
        ))}
        </div>
      </div>

           <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskCategories.map(cat => (
            <RiskTile key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* View tabs */}
      {/* <div className="flex border-b border-pebble mb-5">
        {[
          { id: 'overview', label: 'Risk Categories', icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: 'reviews', label: 'Review Status', icon: <CheckCircle className="w-3.5 h-3.5" /> },
          { id: 'markets', label: 'Market Risk Map', icon: <Globe className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id as typeof activeView)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors -mb-px ${activeView === tab.id ? 'border-sky text-sky' : 'border-transparent text-gray-500 hover:text-night'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div> */}

      {/* Risk categories grid (US-M1-117-128) */}
      {/* {activeView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskCategories.map(cat => (
            <RiskTile key={cat.id} category={cat} />
          ))}
        </div>
      )} */}

      {/* Review status list */}
      {/* {activeView === 'reviews' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-earth rounded-full h-2">
              <div className="bg-sky h-2 rounded-full transition-all" style={{ width: `${reviewProgress}%` }} />
            </div>
            <span className="text-sm text-gray-600 flex-shrink-0">{reviewProgress}% complete</span>
          </div>
          <div className="space-y-3">
            {reviewItems.map(item => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )} */}

      {/* Market risk map */}
      {/* {activeView === 'markets' && (
        <div className="bg-white rounded-xl border border-pebble overflow-hidden">
          <table className="w-full">
            <thead className="bg-earth">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Market</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Region</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Regulatory Body</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Risk Level</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Concerns</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {marketRisks.map(market => {
                const rc = RISK_CONFIG[market.overallRisk];
                return (
                  <tr key={market.code} className="hover:bg-earth transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-5 rounded bg-earth border border-pebble flex items-center justify-center text-xs text-night" style={{ fontWeight: 600 }}>
                          {market.code}
                        </div>
                        <span className="text-sm text-night">{market.market}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-600">{market.region}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{market.regulatoryBody}</span></td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs w-fit" style={{ background: rc.bg, color: rc.text }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: rc.dot }} />
                        {market.overallRisk}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {market.concerns.length > 0 ? (
                        <ul className="space-y-0.5">
                          {market.concerns.map((c, i) => (
                            <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                              {c}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />No concerns
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )} */}
    </div>
  );
}
