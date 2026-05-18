import { useState } from 'react';
import { Search, Plus, X, Globe, MapPin } from 'lucide-react';
import { TablePagination } from '../ui/tableUtils';

interface Geography {
  id: string;
  region: string;
  country: string;
  code: string;
  regulatory: string;
  addedDate: string;
  addedBy: string;
}

const ALL_GEOGRAPHIES = [
  { id: 'geo1', region: 'EMEA', country: 'United Kingdom', code: 'GB', regulatory: 'UK FSA / ASA' },
  { id: 'geo2', region: 'EMEA', country: 'Germany', code: 'DE', regulatory: 'BfR / EFSA' },
  { id: 'geo3', region: 'EMEA', country: 'France', code: 'FR', regulatory: 'ANSES / EFSA' },
  { id: 'geo4', region: 'EMEA', country: 'Netherlands', code: 'NL', regulatory: 'EFSA / NVWA' },
  { id: 'geo5', region: 'EMEA', country: 'Italy', code: 'IT', regulatory: 'ISS / EFSA' },
  { id: 'geo6', region: 'EMEA', country: 'Spain', code: 'ES', regulatory: 'AESAN / EFSA' },
  { id: 'geo7', region: 'North America', country: 'United States', code: 'US', regulatory: 'FDA / FTC' },
  { id: 'geo8', region: 'North America', country: 'Canada', code: 'CA', regulatory: 'Health Canada' },
  { id: 'geo9', region: 'LATAM', country: 'Brazil', code: 'BR', regulatory: 'ANVISA' },
  { id: 'geo10', region: 'LATAM', country: 'Mexico', code: 'MX', regulatory: 'COFEPRIS' },
  { id: 'geo11', region: 'LATAM', country: 'Argentina', code: 'AR', regulatory: 'ANMAT' },
  { id: 'geo12', region: 'APAC', country: 'Australia', code: 'AU', regulatory: 'TGA / FSANZ' },
  { id: 'geo13', region: 'APAC', country: 'China', code: 'CN', regulatory: 'NMPA / SAMR' },
  { id: 'geo14', region: 'APAC', country: 'Japan', code: 'JP', regulatory: 'MHLW' },
  { id: 'geo15', region: 'APAC', country: 'South Korea', code: 'KR', regulatory: 'MFDS' },
  { id: 'geo16', region: 'South Asia', country: 'India', code: 'IN', regulatory: 'CDSCO / FSSAI' },
  { id: 'geo17', region: 'South Asia', country: 'Pakistan', code: 'PK', regulatory: 'DRAP' },
];

const initialAdded: Geography[] = [
  { id: 'geo1', region: 'EMEA', country: 'United Kingdom', code: 'GB', regulatory: 'UK FSA / ASA', addedDate: '2026-01-20', addedBy: 'Sarah Johnson' },
  { id: 'geo2', region: 'EMEA', country: 'Germany', code: 'DE', regulatory: 'BfR / EFSA', addedDate: '2026-01-20', addedBy: 'Sarah Johnson' },
  { id: 'geo7', region: 'North America', country: 'United States', code: 'US', regulatory: 'FDA / FTC', addedDate: '2026-02-05', addedBy: 'Michael Chen' },
];

const regionColors: Record<string, string> = {
  'EMEA': 'bg-blue-100 text-blue-700',
  'North America': 'bg-green-100 text-green-700',
  'LATAM': 'bg-orange-100 text-orange-700',
  'APAC': 'bg-purple-100 text-purple-700',
  'South Asia': 'bg-yellow-100 text-yellow-700',
  'Global': 'bg-sky text-white',
};

interface AddGeographyPanelProps {
  onAdd: (geos: typeof ALL_GEOGRAPHIES) => void;
  onClose: () => void;
  alreadyAdded: string[];
}

function AddGeographyPanel({ onAdd, onClose, alreadyAdded }: AddGeographyPanelProps) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = ALL_GEOGRAPHIES.filter(g =>
    !alreadyAdded.includes(g.id) &&
    (g.country.toLowerCase().includes(search.toLowerCase()) ||
      g.region.toLowerCase().includes(search.toLowerCase()) ||
      g.code.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filtered.reduce<Record<string, typeof ALL_GEOGRAPHIES>>((acc, g) => {
    if (!acc[g.region]) acc[g.region] = [];
    acc[g.region].push(g);
    return acc;
  }, {});

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleAdd = () => {
    const toAdd = ALL_GEOGRAPHIES.filter(g => selected.includes(g.id));
    onAdd(toAdd);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <h3 className="text-night">Add Geography</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-earth rounded-lg"><X className="w-4 h-4 text-gray-500" /></button>
        </div>
        <div className="px-6 py-3 border-b border-pebble">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country or region..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {Object.entries(grouped).map(([region, geos]) => (
            <div key={region} className="mb-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">{region}</div>
              <div className="space-y-1">
                {geos.map(geo => (
                  <label key={geo.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-earth cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.includes(geo.id)}
                      onChange={() => toggleSelect(geo.id)}
                      className="w-4 h-4 text-sky rounded border-pebble"
                    />
                    <div className="w-8 h-5 rounded flex items-center justify-center bg-earth text-xs text-night" style={{ fontWeight: 600 }}>
                      {geo.code}
                    </div>
                    <div>
                      <div className="text-sm text-night">{geo.country}</div>
                      <div className="text-xs text-gray-400">{geo.regulatory}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between">
          <span className="text-sm text-gray-500">{selected.length} selected</span>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-pebble text-night rounded-lg text-sm hover:bg-earth">Cancel</button>
            <button
              disabled={selected.length === 0}
              onClick={handleAdd}
              className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50"
            >
              Add {selected.length > 0 ? `(${selected.length})` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GeographyTab() {
  const [addedGeographies, setAddedGeographies] = useState<Geography[]>(initialAdded);
  const [showPanel, setShowPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (geos: typeof ALL_GEOGRAPHIES) => {
    const newGeos: Geography[] = geos.map(g => ({
      ...g,
      addedDate: new Date().toISOString().split('T')[0],
      addedBy: 'Current User'
    }));
    setAddedGeographies(prev => [...prev, ...newGeos]);
  };

  const handleRemove = (id: string) => {
    setAddedGeographies(prev => prev.filter(g => g.id !== id));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  
  const filtered = addedGeographies.filter(g =>
    g.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.region.toLowerCase().includes(searchQuery.toLowerCase())
  );
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedGeos = filtered.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="p-6 flex flex-col h-full overflow-hidden no-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-night">Geography</h2>
          <p className="text-sm text-gray-500 mt-0.5">Markets and regulatory jurisdictions for this project</p>
        </div>
        <button
          onClick={() => setShowPanel(true)}
          className="flex items-center gap-2 px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Geography
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(
          addedGeographies.reduce<Record<string, number>>((acc, g) => {
            acc[g.region] = (acc[g.region] || 0) + 1;
            return acc;
          }, {})
        ).map(([region, count]) => (
          <span key={region} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs ${regionColors[region] || 'bg-gray-100 text-gray-700'}`}>
            <Globe className="w-3 h-3" />
            {region}: {count}
          </span>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 bg-white rounded-xl border border-pebble overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-pebble flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search geographies..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky"
            />
          </div>
          <span className="text-sm text-gray-500">{filtered.length} markets</span>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto no-scrollbar">
          <table className="w-full">
            <thead className="bg-earth sticky top-0 z-10 border-b border-pebble">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Region</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Regulatory Body</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Added Date</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide">Added By</th>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pebble">
              {pagedGeos.map(geo => (
                <tr key={geo.id} className="hover:bg-earth transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-5 rounded flex items-center justify-center bg-earth border border-pebble text-xs text-night" style={{ fontWeight: 600 }}>
                        {geo.code}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-sky" />
                        <span className="text-sm text-night">{geo.country}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${regionColors[geo.region] || 'bg-gray-100 text-gray-700'}`}>
                      {geo.region}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{geo.regulatory}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{geo.addedDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{geo.addedBy}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRemove(geo.id)}
                      className="p-1.5 hover:bg-red-50 hover:text-red-500 text-gray-400 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Globe className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No geographies added yet</p>
              <button
                onClick={() => setShowPanel(true)}
                className="mt-3 text-sky text-sm hover:underline"
              >
                Add your first geography
              </button>
            </div>
          )}
        </div>
                <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filtered.length}
          startIndex={startIndex}
          itemsPerPage={PAGE_SIZE}
          label="markets"
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          onPageSelect={setCurrentPage}
        />
      </div>

      {showPanel && (
        <AddGeographyPanel
          onAdd={handleAdd}
          onClose={() => setShowPanel(false)}
          alreadyAdded={addedGeographies.map(g => g.id)}
        />
      )}
    </div>
  );
}