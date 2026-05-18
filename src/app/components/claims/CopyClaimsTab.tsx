import { useState, useMemo } from 'react';
import { Search, Check, Copy, Globe } from 'lucide-react';
import type { Claim } from '../workspace/RelatedClaimsTab';

interface CopyClaimsTabProps {
  onAddClaims: (claims: Claim[]) => void;
  linkedProductIds: string[];
  existingClaims: Claim[];
}

const MOCK_SOURCE_CLAIMS = [
  {
    id: 'src-c1',
    text: 'Clinically proven 24-hour hydration barrier',
    source: 'Hydrating Lotion Ultra',
    geography: 'North America',
    qualifier: 'Instrumental test, 30 subjects',
    riskLevel: 'Low' as const,
    rcfSummary: '30 subjects evaluated via Corneometer. Significant hydration boost observed at 24h.',
    supportStrategy: 'Double-blind placebo controlled clinical trial measuring skin moisture levels.',
    riskAssessment: 'Risk: LOW. Standard 24h hydration claim with instrumental data.',
    comments: 'Copied from Hydrating Lotion Ultra parent product formulation.'
  },
  {
    id: 'src-c2',
    text: 'Soothes dry, irritated skin instantly',
    source: 'Advanced Moisture Cream',
    geography: 'EMEA',
    qualifier: 'Self-assessment on 100 subjects',
    riskLevel: 'Low' as const,
    rcfSummary: 'Consumer perception study. 92% agreed skin felt soothed instantly.',
    supportStrategy: 'Blinded consumer home-use study over 7 days under dermatological control.',
    riskAssessment: 'Risk: LOW. Sensory relief claim supported by robust consumer panel.',
    comments: 'Copied from Advanced Moisture Cream.'
  },
  {
    id: 'src-c3',
    text: 'Visible wrinkle reduction in 4 weeks',
    source: 'Anti-Aging Night Serum',
    geography: 'Global',
    qualifier: 'Clinical grading under dermatological control',
    riskLevel: 'Medium' as const,
    rcfSummary: 'Dermatologist grading showed 18% average reduction in crow-feet wrinkle depth at week 4.',
    supportStrategy: 'Clinical expert grading combined with 3D optical profilometry imaging.',
    riskAssessment: 'Risk: MEDIUM. Anti-wrinkle efficacy requires robust before/after imagery.',
    comments: 'Copied from Anti-Aging Night Serum core study.'
  },
  {
    id: 'src-c4',
    text: 'Dermatologist tested & fragrance-free',
    source: 'Hypoallergenic Cleanser',
    geography: 'EMEA',
    qualifier: 'Suitable for sensitive skin',
    riskLevel: 'Low' as const,
    rcfSummary: 'HRIPT test completed on 110 sensitive skin subjects. Zero sensitization observed.',
    supportStrategy: 'Repeat Insult Patch Testing (HRIPT) conducted by independent derm lab.',
    riskAssessment: 'Risk: LOW. Verified hypoallergenic formula.',
    comments: 'Standard copied safety claim.'
  },
  {
    id: 'src-c5',
    text: 'Protects against environmental aggressors & pollution',
    source: 'Urban Defense Day Shield',
    geography: 'APAC',
    qualifier: 'Ex-vivo lipid peroxidation test',
    riskLevel: 'Medium' as const,
    rcfSummary: 'Ex-vivo testing demonstrated reduction in pollutant adherence and oxidation.',
    supportStrategy: 'Laboratory ex-vivo evaluation measuring carbon particle adhesion to skin explants.',
    riskAssessment: 'Risk: MEDIUM. Anti-pollution claims require specific ex-vivo or in-vivo protocol.',
    comments: 'Copied from Urban Defense core substantiation package.'
  }
];

export default function CopyClaimsTab({
  onAddClaims,
  existingClaims
}: CopyClaimsTabProps) {
  const [copySearch, setCopySearch] = useState('');
  const [selectedCopyIds, setSelectedCopyIds] = useState<Set<string>>(new Set());
  const [copyOptions, setCopyOptions] = useState({
    substantiation: true,
    supportStrategy: true,
    riskAssessment: true,
    riskSummaries: true
  });

  const existingStatements = useMemo(() => new Set(existingClaims.map(c => c.statement.trim().toLowerCase())), [existingClaims]);

  const filteredClaims = useMemo(() => {
    return MOCK_SOURCE_CLAIMS.filter(claim => {
      const matchesSearch = claim.text.toLowerCase().includes(copySearch.toLowerCase()) ||
        claim.source.toLowerCase().includes(copySearch.toLowerCase()) ||
        claim.qualifier.toLowerCase().includes(copySearch.toLowerCase());
      return matchesSearch && !existingStatements.has(claim.text.trim().toLowerCase());
    });
  }, [copySearch, existingStatements]);

  const toggleClaimSelection = (claimId: string) => {
    setSelectedCopyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  };

  const handleCopyClaimsSubmit = () => {
    const claimsToCopy = MOCK_SOURCE_CLAIMS.filter(c => selectedCopyIds.has(c.id)).map((c, idx) => ({
      id: `CLM-COPIED-${Date.now()}-${idx}`,
      order: existingClaims.length + idx + 1,
      version: 'v1.0',
      allVersions: ['v1.0'],
      statement: c.text,
      status: 'Draft' as const,
      qualifier: c.qualifier,
      channel: 'All Channels',
      riskLevel: copyOptions.riskAssessment ? c.riskLevel : ('Low' as const),
      rcfSummary: copyOptions.substantiation ? c.rcfSummary : '',
      supportStrategy: copyOptions.supportStrategy ? c.supportStrategy : '',
      riskAssessment: copyOptions.riskAssessment ? c.riskAssessment : '',
      comments: c.comments
    }));
    onAddClaims(claimsToCopy);
  };

  const isDisabled = selectedCopyIds.size === 0;

  return (
    <div className="p-6 flex flex-col h-full animate-in fade-in duration-200">
      {/* Top Header & Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search source claims by statement, product name, or qualifier..."
            value={copySearch}
            onChange={(e) => setCopySearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-pebble rounded-lg focus:outline-none focus:ring-2 focus:ring-sky bg-white"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {filteredClaims.length} source claim{filteredClaims.length !== 1 ? 's' : ''} available to copy
        </p>
      </div>

      {/* Claims Table List */}
      <div className="flex-1 overflow-y-auto border border-pebble rounded-xl overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth/60 sticky top-0 backdrop-blur-md border-b border-pebble">
            <tr>
              <th className="w-12 px-4 py-3" />
              <th className="px-4 py-3 font-bold text-gray-600 uppercase tracking-wider text-xs">Source Product</th>
              <th className="px-4 py-3 font-bold text-gray-600 uppercase tracking-wider text-xs">Claim Statement</th>
              <th className="px-4 py-3 font-bold text-gray-600 uppercase tracking-wider text-xs">Qualifier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-pebble bg-white">
            {filteredClaims.length > 0 ? (
              filteredClaims.map(claim => {
                const isSelected = selectedCopyIds.has(claim.id);
                return (
                  <tr
                    key={claim.id}
                    onClick={() => toggleClaimSelection(claim.id)}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-sky/5' : 'hover:bg-earth'}`}
                  >
                    <td className="px-4 py-3.5">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-sky border-sky scale-110' : 'border-gray-300'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 font-semibold text-night">
                        <span>{claim.source}</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-earth text-gray-500 font-medium rounded border border-pebble flex items-center gap-0.5">
                          <Globe className="w-2.5 h-2.5" />{claim.geography}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-night">
                      {claim.text}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {claim.qualifier}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-400 text-sm">
                  {copySearch ? 'No source claims match your search' : 'No source claims available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Copy Options Bar */}
      <div className="flex flex-wrap items-center gap-6 bg-earth/50 px-4 py-3 rounded-xl border border-pebble mb-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Also Copy:</span>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={copyOptions.substantiation}
            onChange={e => setCopyOptions(p => ({ ...p, substantiation: e.target.checked }))}
            className="w-4 h-4 rounded text-sky focus:ring-sky"
          />
          <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Substantiation Summary</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={copyOptions.supportStrategy}
            onChange={e => setCopyOptions(p => ({ ...p, supportStrategy: e.target.checked }))}
            className="w-4 h-4 rounded text-sky focus:ring-sky"
          />
          <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Support Strategy</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={copyOptions.riskAssessment}
            onChange={e => setCopyOptions(p => ({ ...p, riskAssessment: e.target.checked }))}
            className="w-4 h-4 rounded text-sky focus:ring-sky"
          />
          <span className="text-sm font-semibold text-night group-hover:text-sky transition-colors">Risk Assessment</span>
        </label>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-pebble">
        <p className="text-sm text-gray-600 font-medium">
          {selectedCopyIds.size > 0 ? (
            <span>
              <span className="font-bold text-night">{selectedCopyIds.size}</span> claim{selectedCopyIds.size !== 1 ? 's' : ''} selected to copy
            </span>
          ) : (
            'Select source claims to copy'
          )}
        </p>
        <button
          onClick={handleCopyClaimsSubmit}
          disabled={isDisabled}
          className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-50 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Copy className="w-4 h-4" /> Copy Selected Claims
        </button>
      </div>
    </div>
  );
}
