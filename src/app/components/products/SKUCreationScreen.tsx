import { useState, useEffect } from "react";
import {
  ChevronLeft,
  X,
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  FileText,
  Layers,
  Sparkles,
  Globe2,
  Check,
  AlertCircle,
} from "lucide-react";

interface SKUCreationScreenProps {
  onBack: () => void;
  onCreate: (sku: any) => void;
  recentLocalVariants?: Array<{ id: string; name: string; variant: string; geography: string }>;
  sourceContext?: "products" | "productCreation";
}

interface SKURow {
  key: string;
  localVariantId: string;
  skuCode: string;
  description: string;
  isNew: boolean;
}

const MOCK_LOCAL_VARIANTS = [
  { id: "lv-1", name: "UK - Intensive Repair", variant: "Intensive Repair", geography: "United Kingdom" },
  { id: "lv-2", name: "FR - Intensive Repair", variant: "Intensive Repair", geography: "France" },
  { id: "lv-3", name: "DE - Advanced Repair", variant: "Advanced Repair", geography: "Germany" },
  { id: "lv-4", name: "US - Intensive Repair", variant: "Intensive Repair", geography: "United States" },
];

export default function SKUCreationScreen({
  onBack,
  onCreate,
  recentLocalVariants = [],
  sourceContext = "products",
}: SKUCreationScreenProps) {
  const [skus, setSkus] = useState<SKURow[]>([
    { key: "sku-1", localVariantId: "", skuCode: "", description: "", isNew: true }
  ]);

  const [selectedLocalVariant, setSelectedLocalVariant] = useState<string>("");
  const [focusedRowKey, setFocusedRowKey] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Use recent local variants if provided, otherwise use mock data
  const availableLocalVariants = recentLocalVariants.length > 0 ? recentLocalVariants : MOCK_LOCAL_VARIANTS;

  const hasChanges = () => {
    return skus.some((sku) => sku.skuCode.trim() !== "" || sku.description.trim() !== "");
  };

  const handleBackAttempt = () => {
    if (hasChanges()) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  const canSave = () => {
    return skus.some((sku) => sku.skuCode.trim() !== "" && sku.localVariantId.trim() !== "");
  };

  const handleSave = () => {
    if (!canSave()) return;

    const itemsToCreate = skus
      .filter((sku) => sku.skuCode.trim() !== "" && sku.localVariantId.trim() !== "")
      .map((sku, idx) => {
        const selectedLV = availableLocalVariants.find((lv) => lv.id === sku.localVariantId);
        return {
          id: `sku-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          skuCode: sku.skuCode.trim().toUpperCase(),
          description: sku.description.trim(),
          localVariantId: sku.localVariantId,
          localVariantName: selectedLV?.name || "",
          variant: selectedLV?.variant || "",
          geography: selectedLV?.geography || "",
          createdBy: "Sarah Johnson",
          createdDate: new Date().toISOString().split("T")[0],
        };
      });

    onCreate(itemsToCreate);
  };

  const deleteRow = (key: string) => {
    if (skus.length > 1) {
      setSkus((prev) => prev.filter((s) => s.key !== key));
    }
  };

  const addRow = () => {
    const newKey = `sku-${Date.now()}`;
    setSkus((prev) => [
      ...prev,
      { key: newKey, localVariantId: "", skuCode: "", description: "", isNew: true }
    ]);
  };

  return (
    <div className="fixed inset-0 top-[56px] z-45 flex flex-col bg-white overflow-hidden text-night">
      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky" />
          <div>
            <h2 className="text-night text-sm font-extrabold">SKU Creation Form</h2>
            <p className="text-[10px] text-gray-400 font-medium">
              {sourceContext === "productCreation"
                ? "Create SKUs for your local variants"
                : "Create SKUs for your product variants"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <button
            onClick={handleBackAttempt}
            className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-night transition-colors border border-gray-200 bg-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex min-h-0 overflow-hidden bg-gray-50/30">
        {/* Left workspace: 70% */}
        <div className="flex flex-col overflow-hidden border-r border-gray-200" style={{ width: "70%" }}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
            {/* Instructions */}
            <div className="p-4 bg-sky/5 border border-sky/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-sky flex-shrink-0 mt-0.5" />
              <div className="text-sm text-sky space-y-1">
                <p className="font-semibold">SKU Mapping Required</p>
                <p className="text-xs opacity-90">
                  Select a local variant and assign a unique SKU code. You can create multiple SKUs by adding rows below.
                </p>
              </div>
            </div>

            {/* SKUs Grid */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
                <Layers className="w-4 h-4 text-sky" />
                <h2 className="text-sm font-extrabold uppercase text-night tracking-wider">SKU Configuration</h2>
              </div>

              {/* Table Header for Desktop */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="sm:col-span-3 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Local Variant</div>
                <div className="sm:col-span-3 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">SKU Code</div>
                <div className="sm:col-span-4 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider">Description</div>
                <div className="sm:col-span-2 text-[10px] font-extrabold uppercase text-gray-500 tracking-wider text-right">Actions</div>
              </div>

              {/* SKU Rows */}
              <div className="space-y-3">
                {skus.map((sku, idx) => (
                  <div
                    key={sku.key}
                    className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 transition-all shadow-sm"
                  >
                    {/* Mobile View */}
                    <div className="sm:hidden space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold bg-sky/10 text-sky px-2 py-1 rounded-lg">SKU {idx + 1}</span>
                        {skus.length > 1 && (
                          <button
                            onClick={() => deleteRow(sku.key)}
                            className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block mb-2">Local Variant *</label>
                        <select
                          value={sku.localVariantId}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, localVariantId: e.target.value } : s))
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-night focus:ring-1 focus:ring-sky/50 outline-none"
                        >
                          <option value="">Select local variant...</option>
                          {availableLocalVariants.map((lv) => (
                            <option key={lv.id} value={lv.id}>
                              {lv.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block mb-2">SKU Code *</label>
                        <input
                          type="text"
                          value={sku.skuCode}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, skuCode: e.target.value } : s))
                            )
                          }
                          placeholder="e.g., DOVE-REPAIR-UK-001"
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-night focus:ring-1 focus:ring-sky/50 outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-extrabold uppercase text-gray-500 tracking-wider block mb-2">Description</label>
                        <textarea
                          value={sku.description}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, description: e.target.value } : s))
                            )
                          }
                          placeholder="Optional description..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-night focus:ring-1 focus:ring-sky/50 outline-none min-h-[80px] resize-none"
                        />
                      </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden sm:grid sm:grid-cols-12 gap-3 items-start">
                      <div className="sm:col-span-3">
                        <select
                          value={sku.localVariantId}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, localVariantId: e.target.value } : s))
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-night focus:ring-1 focus:ring-sky/50 outline-none"
                        >
                          <option value="">Select variant...</option>
                          {availableLocalVariants.map((lv) => (
                            <option key={lv.id} value={lv.id}>
                              {lv.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={sku.skuCode}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, skuCode: e.target.value } : s))
                            )
                          }
                          placeholder="SKU Code..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-night focus:ring-1 focus:ring-sky/50 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <input
                          type="text"
                          value={sku.description}
                          onChange={(e) =>
                            setSkus((prev) =>
                              prev.map((s) => (s.key === sku.key ? { ...s, description: e.target.value } : s))
                            )
                          }
                          placeholder="Description..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-night focus:ring-1 focus:ring-sky/50 outline-none"
                        />
                      </div>

                      <div className="sm:col-span-2 flex justify-end">
                        {skus.length > 1 && (
                          <button
                            onClick={() => deleteRow(sku.key)}
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Row Button */}
              <button
                onClick={addRow}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-sky/40 rounded-xl text-[11px] font-bold tracking-wider text-gray-400 hover:text-sky bg-white hover:bg-sky/5 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                ADD SKU ROW
              </button>
            </div>
          </div>
        </div>

        {/* Right: Hierarchy (30%) */}
        <div className="flex-shrink-0 flex flex-col bg-white" style={{ width: "30%" }}>
          <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-gray-400" />
            <span className="text-[10px] font-extrabold text-night uppercase tracking-wider">Hierarchy Preview</span>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col px-4 py-3 bg-white no-scrollbar">
            {skus.length === 0 || !skus.some(s => s.skuCode || s.localVariantId) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-6 text-gray-400 px-3">
                <Layers className="w-7 h-7 text-gray-300" />
                <p className="text-[10px] leading-relaxed text-gray-400">Hierarchy preview appears here as you fill in details</p>
              </div>
            ) : (
              <div className="space-y-3">
                {skus.map((sku) => {
                  const selectedLV = availableLocalVariants.find((lv) => lv.id === sku.localVariantId);
                  if (!selectedLV && !sku.skuCode) return null;

                  return (
                    <div key={sku.key} className="space-y-1">
                      {/* Local Variant Node */}
                      {selectedLV && (
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                          <Globe2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span className="text-[11px] font-bold text-night flex-1 truncate">{selectedLV.name}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{selectedLV.geography}</span>
                        </div>
                      )}

                      {/* SKU Node */}
                      {sku.skuCode && (
                        <div className="ml-3 pl-3 border-l-2 border-gray-100">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-200">
                            <Layers className="w-3 h-3 text-sky flex-shrink-0" />
                            <span className="text-[11px] font-bold text-night flex-1 truncate">{sku.skuCode}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky/10 text-sky">NEW</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 border-t border-gray-200 bg-white px-5 py-3 flex items-center justify-end gap-2">
        <button
          onClick={handleBackAttempt}
          className="px-4 py-2 border border-gray-200 text-gray-500 hover:text-night bg-white hover:bg-gray-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave()}
          className="flex items-center gap-1.5 px-5 py-2 bg-sky text-white rounded-xl text-xs font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
          Create SKUs
        </button>
      </div>

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-pebble rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-night">Discard Changes?</h3>
                <p className="text-xs text-gray-500 mt-0.5">All unsaved SKU data will be lost permanently.</p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-pebble text-brand-night font-bold rounded-lg text-xs hover:bg-earth transition-colors cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
