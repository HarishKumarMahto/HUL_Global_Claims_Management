import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import type { Claim } from '../workspace/RelatedClaimsTab';

interface SelectClaimsTabProps {
  onAddClaims: (claims: Claim[]) => void;
  linkedProductIds: string[];
  existingClaims: Claim[];
  initialSelectedClaims?: Claim[];
}

// Mock claim library for all products
const CLAIM_LIBRARY: Claim[] = [
  {
    id: 'lib-c1',
    order: 1,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Dermatologist tested and hypoallergenic formula',
    status: 'Approved',
    qualifier: 'Tested on sensitive skin',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Tested on 100+ individuals with sensitive skin. No significant adverse reactions.',
    supportStrategy: 'Third-party dermatological testing per ISO 10993-5.',
    riskAssessment: 'Risk: LOW. Standard hypoallergenic claim with appropriate support.',
    comments: 'Pre-approved for most markets. Check regional requirements.'
  },
  {
    id: 'lib-c2',
    order: 2,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Contains natural extracts and plant-based ingredients',
    status: 'Approved',
    qualifier: 'At least 50% natural content',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Ingredient analysis confirms natural content percentage.',
    supportStrategy: 'USDA or equivalent certification for natural ingredients.',
    riskAssessment: 'Risk: LOW. Transparent ingredient sourcing documented.',
    comments: 'Verify with Supply Chain for ingredient sourcing.'
  },
  {
    id: 'lib-c3',
    order: 3,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Cruelty-free and not tested on animals',
    status: 'Approved',
    qualifier: 'Certified by Leaping Bunny or equivalent',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Valid certification from recognized cruelty-free organization.',
    supportStrategy: 'Active certification from Leaping Bunny or PETA.',
    riskAssessment: 'Risk: LOW. Third-party verified certification.',
    comments: 'Annual recertification required. Schedule review date.'
  },
  {
    id: 'lib-c4',
    order: 4,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Clinically proven to reduce appearance of wrinkles',
    status: 'Approved',
    qualifier: 'In visible light conditions after 12 weeks',
    channel: 'Digital, Print',
    riskLevel: 'Medium',
    rcfSummary: '3 clinical studies (n=150 each). 82% efficacy rate reported.',
    supportStrategy: 'Double-blind clinical study with instrumental measurement.',
    riskAssessment: 'Risk: MEDIUM. Efficacy claims require robust methodology.',
    comments: 'Request instrumental data files from Clinical Affairs.'
  },
  {
    id: 'lib-c5',
    order: 5,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Reduces dark circles and under-eye puffiness',
    status: 'Under Review',
    qualifier: 'Measured by digital imaging analysis',
    channel: 'Digital, Print',
    riskLevel: 'Medium',
    rcfSummary: 'Consumer use study in progress. Preliminary data promising.',
    supportStrategy: 'Home use test with consumer feedback and measurements.',
    riskAssessment: 'Risk: MEDIUM. Awaiting full study completion.',
    comments: 'RA team review scheduled for Q3 2026.'
  },
  {
    id: 'lib-c6',
    order: 6,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Sustainably sourced and eco-friendly packaging',
    status: 'Approved',
    qualifier: '100% recyclable or compostable packaging',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Packaging material certified by environmental standards body.',
    supportStrategy: 'Third-party environmental certification (FSC, Cradle to Cradle).',
    riskAssessment: 'Risk: LOW. Environmental claims supported by certification.',
    comments: 'Verify packaging specifications with Sustainability team.'
  },
  {
    id: 'lib-c7',
    order: 7,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Long-lasting formula with 24-hour protection',
    status: 'Approved',
    qualifier: 'When used as directed',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Stability and performance testing confirms 24-hour efficacy.',
    supportStrategy: 'Accelerated stability testing and consumer use study.',
    riskAssessment: 'Risk: LOW. Duration claims well-substantiated.',
    comments: 'Standard claim for this product category.'
  },
  {
    id: 'lib-c8',
    order: 8,
    version: 'v1.0',
    allVersions: ['v1.0'],
    statement: 'Fast-absorbing and non-greasy formula',
    status: 'Approved',
    qualifier: 'Measured by skin feel assessment',
    channel: 'All Channels',
    riskLevel: 'Low',
    rcfSummary: 'Consumer perception study confirms non-greasy sensory profile.',
    supportStrategy: 'Blinded consumer sensory evaluation.',
    riskAssessment: 'Risk: LOW. Sensory claims supported by consumer data.',
    comments: 'Pre-approved standard claim.'
  },
];

export default function SelectClaimsTab({
  onAddClaims,
  existingClaims,
  initialSelectedClaims = []
}: SelectClaimsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const combinedLibrary = useMemo(() => {
    const map = new Map<string, Claim>();
    CLAIM_LIBRARY.forEach(c => map.set(c.id, c));
    initialSelectedClaims.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  }, [initialSelectedClaims]);

  const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(() => new Set(initialSelectedClaims.map(c => c.id)));

  // Filter and sort library claims
  const filteredClaims = useMemo(() => {
    const existingClaimIds = new Set(existingClaims.map(c => c.id));
    const initialIds = new Set(initialSelectedClaims.map(c => c.id));
    const list = combinedLibrary.filter(claim => {
      const matchesSearch = claim.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.qualifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.status.toLowerCase().includes(searchQuery.toLowerCase());
      const isExisting = existingClaimIds.has(claim.id) && !initialIds.has(claim.id);
      return matchesSearch && !isExisting;
    });

    return list.sort((a, b) => {
      const aSelected = initialIds.has(a.id);
      const bSelected = initialIds.has(b.id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.order - b.order;
    });
  }, [combinedLibrary, searchQuery, existingClaims, initialSelectedClaims]);

  const toggleClaimSelection = (claimId: string) => {
    setSelectedClaimIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  };

  const handleAddClaims = () => {
    const claimsToAdd = combinedLibrary.filter(claim => selectedClaimIds.has(claim.id));
    onAddClaims(claimsToAdd);
  };

  const isDisabled = selectedClaimIds.size === 0;

  return (
    <div className="p-6 flex flex-col h-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search claims by statement, qualifier, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-pebble rounded-lg focus:outline-none focus:ring-2 focus:ring-sky"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {filteredClaims.length} claim{filteredClaims.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Claims List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
        {filteredClaims.length > 0 ? (
          filteredClaims.map(claim => {
            const isSelected = selectedClaimIds.has(claim.id);
            const statusStyles: Record<string, string> = {
              'Draft': 'bg-gray-100 text-gray-600',
              'Under Review': 'bg-amber-100 text-amber-700',
              'Approved': 'bg-green-100 text-green-700',
              'Rejected': 'bg-red-100 text-red-700',
              'Pending': 'bg-blue-100 text-blue-700'
            };

            return (
              <button
                key={claim.id}
                onClick={() => toggleClaimSelection(claim.id)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  isSelected
                    ? 'border-sky bg-pale'
                    : 'border-pebble hover:border-gray-400'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected ? 'bg-sky border-sky' : 'border-pebble'
                  }`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-night leading-relaxed" style={{ fontWeight: 500 }}>
                      {claim.statement}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2 py-1 rounded ${statusStyles[claim.status]}`}>
                        {claim.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Qualifier: {claim.qualifier}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-400">
            <p className="text-sm">
              {searchQuery ? 'No claims match your search' : 'No additional claims available'}
            </p>
          </div>
        )}
      </div>

      {/* Footer with Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-pebble">
        <p className="text-sm text-gray-600">
          {selectedClaimIds.size > 0 ? (
            <span>
              <span style={{ fontWeight: 600 }}>{selectedClaimIds.size}</span> claim{selectedClaimIds.size !== 1 ? 's' : ''} selected
            </span>
          ) : (
            'Select claims to add'
          )}
        </p>
        <button
          onClick={handleAddClaims}
          disabled={isDisabled}
          className="px-6 py-2 bg-sky text-white rounded-lg text-sm hover:bg-sky/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ fontWeight: 600 }}
        >
          Add Selected Claims
        </button>
      </div>
    </div>
  );
}
