import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Claim } from '../workspace/RelatedClaimsTab';

interface CreateClaimsTabProps {
  onCreateClaims: (claims: Claim[]) => void;
  linkedProductIds: string[];
}

// Mock products data
const MOCK_PRODUCTS = [
  { id: 'prod-1', name: 'Dove Intensive Repair Moisturizer', type: 'Standard' },
  { id: 'prod-2', name: 'Dove Advanced Repair Serum', type: 'Standard' },
  { id: 'prod-3', name: 'Dove Regional Variant - EMEA', type: 'Regional Variant' },
  { id: 'prod-4', name: 'Dove Local Variant - India', type: 'Local Variant' },
  { id: 'prod-5', name: 'Dove SKU - Premium India', type: 'SKU' },
];

const MARKETING_CHANNELS = [
  'All Channels',
  'TV',
  'Digital',
  'Print',
  'OOH (Out of Home)',
  'Social Media',
  'Email',
  'In-Store'
];

const GEOGRAPHIES = [
  'Global',
  'EMEA',
  'North America',
  'LATAM',
  'APAC',
  'South Asia'
];

interface NewClaim {
  statement: string;
  productId: string;
  geography: string;
  channels: string[];
}

export default function CreateClaimsTab({
  onCreateClaims,
  linkedProductIds
}: CreateClaimsTabProps) {
  const [claims, setClaims] = useState<NewClaim[]>([
    { statement: '', productId: '', geography: '', channels: [] }
  ]);

  // Get linked products
  const linkedProducts = MOCK_PRODUCTS.filter(p => linkedProductIds.includes(p.id));
  const availableProducts = linkedProducts.length > 0 ? linkedProducts : MOCK_PRODUCTS;

  const handleAddClaimRow = () => {
    setClaims([...claims, { statement: '', productId: '', geography: '', channels: [] }]);
  };

  const handleRemoveClaimRow = (index: number) => {
    setClaims(claims.filter((_, i) => i !== index));
  };

  const handleClaimChange = (index: number, field: keyof NewClaim, value: any) => {
    const newClaims = [...claims];
    newClaims[index] = { ...newClaims[index], [field]: value };
    setClaims(newClaims);
  };

  const handleChannelToggle = (index: number, channel: string) => {
    const newClaims = [...claims];
    const channels = newClaims[index].channels;
    if (channels.includes(channel)) {
      newClaims[index].channels = channels.filter(c => c !== channel);
    } else {
      newClaims[index].channels = [...channels, channel];
    }
    setClaims(newClaims);
  };

  const handleCreateClaims = () => {
    // Filter out empty claims
    const validClaims = claims.filter(c => c.statement.trim() && c.productId && c.geography && c.channels.length > 0);
    
    if (validClaims.length === 0) return;

    // Create claim objects with unique IDs
    const createdClaims: Claim[] = validClaims.map((claim, index) => {
      const product = availableProducts.find(p => p.id === claim.productId);
      return {
        id: `new-claim-${Date.now()}-${index}`,
        order: index + 1,
        version: 'v1.0',
        allVersions: ['v1.0'],
        statement: claim.statement,
        status: 'Draft',
        qualifier: `For ${product?.name}`,
        channel: claim.channels.join(', '),
        riskLevel: 'Medium',
        rcfSummary: 'Awaiting substantiation',
        supportStrategy: 'To be defined during development phase',
        riskAssessment: 'Risk assessment pending',
        comments: `Created for ${claim.geography} market`
      };
    });

    onCreateClaims(createdClaims);
  };

  const isValid = claims.some(c => c.statement.trim() && c.productId && c.geography && c.channels.length > 0);

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-6 pr-2">
        <div className="space-y-6">
          {claims.map((claim, index) => {
            const selectedProduct = availableProducts.find(p => p.id === claim.productId);
            const isLocalVariant = selectedProduct?.type === 'Local Variant' || selectedProduct?.type === 'SKU';

            return (
              <div key={index} className="border-2 border-pebble rounded-lg p-4 space-y-4">
                {/* Header with remove button */}
                <div className="flex items-center justify-between">
                  <h4 className="text-sm text-night" style={{ fontWeight: 600 }}>
                    Claim {index + 1}
                  </h4>
                  {claims.length > 1 && (
                    <button
                      onClick={() => handleRemoveClaimRow(index)}
                      className="p-1 hover:bg-earth rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Product Selection */}
                <div>
                  <label className="block text-sm text-night mb-2" style={{ fontWeight: 500 }}>
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={claim.productId}
                    onChange={(e) => handleClaimChange(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 border border-pebble rounded-lg focus:outline-none focus:ring-2 focus:ring-sky text-sm"
                  >
                    <option value="">Select a product</option>
                    {availableProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Geography */}
                <div>
                  <label className="block text-sm text-night mb-2" style={{ fontWeight: 500 }}>
                    Geography <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={claim.geography}
                    onChange={(e) => handleClaimChange(index, 'geography', e.target.value)}
                    disabled={isLocalVariant}
                    className={`w-full px-3 py-2 border border-pebble rounded-lg text-sm ${
                      isLocalVariant ? 'bg-gray-100 cursor-not-allowed' : 'focus:outline-none focus:ring-2 focus:ring-sky'
                    }`}
                  >
                    <option value="">Select geography</option>
                    {GEOGRAPHIES.map(geo => (
                      <option key={geo} value={geo}>
                        {geo}
                      </option>
                    ))}
                  </select>
                  {isLocalVariant && (
                    <p className="text-xs text-gray-500 mt-1">
                      Geography auto-set for Local Variant products
                    </p>
                  )}
                </div>

                {/* Claim Statement */}
                <div>
                  <label className="block text-sm text-night mb-2" style={{ fontWeight: 500 }}>
                    Claim Statement <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={claim.statement}
                    onChange={(e) => handleClaimChange(index, 'statement', e.target.value)}
                    placeholder="Enter the claim statement (e.g., 'Clinically proven to moisturize skin for 24 hours')"
                    className="w-full px-3 py-2 border border-pebble rounded-lg focus:outline-none focus:ring-2 focus:ring-sky text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {claim.statement.length} characters
                  </p>
                </div>

                {/* Marketing Channels */}
                <div>
                  <label className="block text-sm text-night mb-2" style={{ fontWeight: 500 }}>
                    Marketing Channels <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {MARKETING_CHANNELS.map(channel => (
                      <label
                        key={channel}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-pale cursor-pointer transition-colors"
                      >
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          claim.channels.includes(channel)
                            ? 'bg-sky border-sky'
                            : 'border-pebble'
                        }`}>
                          {claim.channels.includes(channel) && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{channel}</span>
                      </label>
                    ))}
                  </div>
                  {claim.channels.length > 0 && (
                    <p className="text-xs text-gray-500 mt-2">
                      {claim.channels.length} channel{claim.channels.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Another Claim Button */}
      <div className="mb-6 pt-4 border-t border-pebble">
        <button
          onClick={handleAddClaimRow}
          className="text-sm text-sky hover:underline" style={{ fontWeight: 500 }}
        >
          + Add Another Claim
        </button>
      </div>

      {/* Footer with Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-pebble">
        <p className="text-sm text-gray-600">
          {isValid ? (
            <span>
              <span style={{ fontWeight: 600 }}>{claims.filter(c => c.statement.trim() && c.productId && c.geography && c.channels.length > 0).length}</span> claim{claims.filter(c => c.statement.trim() && c.productId && c.geography && c.channels.length > 0).length !== 1 ? 's' : ''} ready to create
            </span>
          ) : (
            'Complete at least one claim to proceed'
          )}
        </p>
        <button
          onClick={handleCreateClaims}
          disabled={!isValid}
          className="px-6 py-2 bg-sky text-white rounded-lg text-sm hover:bg-sky/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          style={{ fontWeight: 600 }}
        >
          Create Claims
        </button>
      </div>
    </div>
  );
}
