import React, { useState } from 'react';
import { Plus, Search, ExternalLink, FileText, Image, Film, File, ChevronRight, Settings, X, Check, Eye, EyeOff, Download, Link2, Trash2, ChevronDown } from 'lucide-react';

type AssetType = 'Study Report' | 'Clinical Data' | 'Certificate' | 'Image' | 'Video' | 'Regulatory Submission' | 'Protocol';
type LifecycleState = 'Active' | 'Archived' | 'Draft' | 'Superseded';
type AssetStatus = 'Approved' | 'Pending Review' | 'Draft' | 'Expired';

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  lifecycleState: LifecycleState;
  assetNumber: string;
  status: AssetStatus;
  uploadedBy: string;
  uploadedDate: string;
  size: string;
}

const mockAssets: Asset[] = [
  {
    id: 'a1',
    name: 'Dove IR Clinical Study Report 2026',
    type: 'Study Report',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0041',
    status: 'Approved',
    uploadedBy: 'Dr. Priya Sharma',
    uploadedDate: '2026-02-15',
    size: '4.2 MB',
    
  },
  {
    id: 'a2',
    name: 'TEWL Measurement Protocol v2',
    type: 'Protocol',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0042',
    status: 'Approved',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedDate: '2026-01-20',
    size: '1.8 MB',
  },
  {
    id: 'a3',
    name: 'Consumer Perception Study Results',
    type: 'Clinical Data',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0043',
    status: 'Approved',
    uploadedBy: 'Emma Williams',
    uploadedDate: '2026-03-10',
    size: '2.1 MB',
  },
  {
    id: 'a4',
    name: 'Dermatologist Survey Methodology',
    type: 'Protocol',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0044',
    status: 'Pending Review',
    uploadedBy: 'Michael Chen',
    uploadedDate: '2026-04-01',
    size: '0.9 MB',
  },
  {
    id: 'a5',
    name: 'BIS Certification Certificate',
    type: 'Certificate',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0045',
    status: 'Approved',
    uploadedBy: 'Robert Taylor',
    uploadedDate: '2026-02-28',
    size: '0.3 MB',
  },
  {
    id: 'a6',
    name: 'Product Photography - Dove IR Range',
    type: 'Image',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0046',
    status: 'Approved',
    uploadedBy: 'Amanda Wilson',
    uploadedDate: '2026-03-20',
    size: '45.2 MB'
  },
  {
    id: 'a7',
    name: 'EU Cosmetics Regulation Submission',
    type: 'Regulatory Submission',
    lifecycleState: 'Active',
    assetNumber: 'AST-2026-0047',
    status: 'Pending Review',
    uploadedBy: 'Lisa Park',
    uploadedDate: '2026-04-10',
    size: '3.6 MB'
  },
  {
    id: 'a8',
    name: 'Original Clinical Study 2024 (Superseded)',
    type: 'Study Report',
    lifecycleState: 'Superseded',
    assetNumber: 'AST-2024-0018',
    status: 'Expired',
    uploadedBy: 'Dr. Sarah Johnson',
    uploadedDate: '2024-09-15',
    size: '3.8 MB'
  }
];

const ASSET_TYPE_ICONS: Record<AssetType, JSX.Element> = {
  'Study Report': <FileText className="w-4 h-4 text-blue-500" />,
  'Clinical Data': <FileText className="w-4 h-4 text-purple-500" />,
  'Certificate': <FileText className="w-4 h-4 text-green-500" />,
  'Image': <Image className="w-4 h-4 text-pink-500" />,
  'Video': <Film className="w-4 h-4 text-red-500" />,
  'Regulatory Submission': <FileText className="w-4 h-4 text-orange-500" />,
  'Protocol': <File className="w-4 h-4 text-gray-500" />
};

const STATUS_STYLES: Record<AssetStatus, string> = {
  'Approved': 'bg-green-100 text-green-700',
  'Pending Review': 'bg-amber-100 text-amber-700',
  'Draft': 'bg-gray-100 text-gray-600',
  'Expired': 'bg-red-100 text-red-600'
};

const LIFECYCLE_STYLES: Record<LifecycleState, string> = {
  'Active': 'bg-green-100 text-green-700',
  'Archived': 'bg-gray-100 text-gray-600',
  'Draft': 'bg-blue-100 text-blue-600',
  'Superseded': 'bg-red-100 text-red-600'
};

// Asset column config
const ASSET_COLUMNS = [
  { id: 'name', label: 'Asset Name', visible: true },
  { id: 'type', label: 'Type', visible: true },
  { id: 'lifecycleState', label: 'Lifecycle State', visible: true },
  { id: 'assetNumber', label: 'Asset Number', visible: true },
  { id: 'status', label: 'Status', visible: true },
  { id: 'uploadedBy', label: 'Uploaded By', visible: true },
  { id: 'uploadedDate', label: 'Date', visible: true },
  { id: 'size', label: 'Size', visible: true },
];

export default function LinkedAssetsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [assetColumns, setAssetColumns] = useState(ASSET_COLUMNS);
  const [colConfigOpen, setColConfigOpen] = useState(false);
  const [addAssetMenuOpen, setAddAssetMenuOpen] = useState(false);

  const isColVisible = (id: string) => assetColumns.find(c => c.id === id)?.visible !== false;

  const toggleColumn = (id: string) => {
    setAssetColumns(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const assetTypes = ['All', ...Array.from(new Set(mockAssets.map(a => a.type)))];

  const filtered = mockAssets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assetNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'All' || a.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
        <div className="p-0 h-full flex flex-col overflow-hidden no-scrollbar">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-night">Linked Assets</h2>
            <p className="text-sm text-gray-500 mt-0.5">Documents, studies, certificates, and media supporting this project</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setAddAssetMenuOpen(!addAssetMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Asset
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {addAssetMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setAddAssetMenuOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-pebble rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                    <button
                      onClick={() => {
                        console.log('Upload existing file');
                        setAddAssetMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 text-sky" />
                      <div>
                        <div className="font-medium">Upload Existing File</div>
                        <div className="text-xs text-gray-500">Upload from your device</div>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        console.log('Navigate to Assets module to create new asset');
                        alert('This would navigate to the Assets module and open the Create Asset modal');
                        setAddAssetMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-sky" />
                      <div>
                        <div className="font-medium">Create New Asset</div>
                        <div className="text-xs text-gray-500">Go to Assets module</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="flex-1 bg-white rounded-xl border border-pebble overflow-hidden flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="px-4 py-3 border-b border-pebble flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Type filter chips */}
          <div className="flex gap-1 flex-wrap">
            {assetTypes.map(type => (
              <button key={type} onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filterType === type ? 'bg-sky text-white' : 'bg-earth text-gray-600 hover:bg-pebble'}`}>
                {type}
              </button>
            ))}
          </div>

          {/* Column config (US-M1-108) */}
          <div className="relative ml-auto">
            <button onClick={() => setColConfigOpen(!colConfigOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs transition-colors ${colConfigOpen ? 'border-sky text-sky bg-pale' : 'border-pebble text-gray-500 hover:bg-earth'}`}>
              <Settings className="w-3.5 h-3.5" />Columns
            </button>
            {colConfigOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setColConfigOpen(false)} />
                <div className="absolute right-0 top-full mt-1 bg-white border border-pebble rounded-xl shadow-xl z-30 w-52 overflow-hidden">
                  <div className="px-3 py-2 border-b border-pebble text-xs text-gray-500 uppercase tracking-wide">Show/Hide Columns</div>
                  <div className="p-2 max-h-56 overflow-y-auto">
                    {assetColumns.filter(c => c.id !== 'name').map(col => (
                      <button key={col.id} onClick={() => toggleColumn(col.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-earth text-left transition-colors">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${col.visible ? 'bg-sky border-sky' : 'border-gray-300'}`}>
                          {col.visible && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-sm text-night">{col.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="px-3 py-2 border-t border-pebble">
                    <button onClick={() => setColConfigOpen(false)} className="w-full text-center text-xs text-sky hover:underline">Done</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <span className="text-sm text-gray-500">{filtered.length} assets</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full">
            <thead className="bg-earth sticky top-0 z-10 border-b border-pebble">
              <tr>
                {isColVisible('name') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide min-w-[240px]">Asset Name</th>}
                {isColVisible('type') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Type</th>}
                {isColVisible('lifecycleState') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">State</th>}
                {isColVisible('assetNumber') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Asset No.</th>}
                {isColVisible('status') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Status</th>}
                {isColVisible('uploadedBy') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Uploaded By</th>}
                {isColVisible('uploadedDate') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Date</th>}
                {isColVisible('size') && <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Size</th>}
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {filtered.map(asset => (
                <React.Fragment key={asset.id}>
                  <tr key={asset.id}
                    onClick={() => setSelectedAsset(prev => prev?.id === asset.id ? null : asset)}
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && setSelectedAsset(prev => prev?.id === asset.id ? null : asset)}
                    className={`hover:bg-earth transition-colors cursor-pointer focus:outline-none focus:bg-pale/20 ${selectedAsset?.id === asset.id ? 'bg-pale/30' : ''} ${asset.lifecycleState === 'Superseded' ? 'opacity-60' : ''}`}>
                    {isColVisible('name') && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {ASSET_TYPE_ICONS[asset.type]}
                          <div>
                            <div className="text-sm text-night hover:text-sky transition-colors">{asset.name}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    {/* US-M1-107: Distinct asset metadata column styling */}
                    {isColVisible('type') && <td className="px-4 py-3"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{asset.type}</span></td>}
                    {isColVisible('lifecycleState') && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${LIFECYCLE_STYLES[asset.lifecycleState]}`}>{asset.lifecycleState}</span>
                      </td>
                    )}
                    {isColVisible('assetNumber') && <td className="px-4 py-3 text-xs text-gray-500 font-mono">{asset.assetNumber}</td>}
                    {isColVisible('status') && (
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_STYLES[asset.status]}`}>{asset.status}</span>
                      </td>
                    )}
                    {isColVisible('uploadedBy') && <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{asset.uploadedBy}</td>}
                    {isColVisible('uploadedDate') && <td className="px-4 py-3 text-xs text-gray-500">{asset.uploadedDate}</td>}
                    {isColVisible('size') && <td className="px-4 py-3 text-xs text-gray-400">{asset.size}</td>}
                    {/* US-M1-109: Asset click handler actions */}
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                        <button title="Open asset" className="p-1.5 hover:bg-pale rounded-lg text-gray-400 hover:text-sky transition-colors focus:outline-none focus:ring-2 focus:ring-sky">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button title="Download" className="p-1.5 hover:bg-earth rounded-lg text-gray-400 hover:text-sky transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button title="Unlink" className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${selectedAsset?.id === asset.id ? 'rotate-90' : ''}`} />
                      </div>
                    </td>
                  </tr>
                  {selectedAsset?.id === asset.id && (
                    <tr key={`${asset.id}-detail`}>
                      <td colSpan={10} className="px-0 py-0">
                        <div className="bg-pale/30 border-l-4 border-sky px-6 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-4">
                            <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Asset Number</div><div className="text-night font-mono">{asset.assetNumber}</div></div>
                            <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Uploaded By</div><div className="text-night">{asset.uploadedBy}</div></div>
                            <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Upload Date</div><div className="text-night">{asset.uploadedDate}</div></div>
                            <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">File Size</div><div className="text-night">{asset.size}</div></div>
                            {/* {asset.linkedClaim && <div><div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Linked Claim</div><button className="text-sky hover:underline">{asset.linkedClaim}</button></div>} */}
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark">
                              <ExternalLink className="w-3 h-3" /> Open Asset
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-pebble text-night rounded-lg text-xs hover:bg-earth">
                              <Download className="w-3 h-3" /> Download
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs hover:bg-red-50">
                              <Trash2 className="w-3 h-3" /> Unlink
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No assets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}