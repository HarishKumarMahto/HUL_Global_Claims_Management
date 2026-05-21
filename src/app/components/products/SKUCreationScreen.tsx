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
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackAttempt}
            className="p-1.5 hover:bg-earth rounded-xl text-brand-night transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="p-2 bg-brand-sky rounded-xl text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-night leading-tight">SKU Creation Form</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {sourceContext === "productCreation"
                ? "Create SKUs for your local variants and return to product creation"
                : "Create SKUs for your product variants"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6 max-w-5xl mx-auto">
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
            <div className="flex items-center gap-2 pb-3 border-b border-pebble">
              <Layers className="w-5 h-5 text-brand-sky" />
              <h2 className="text-sm font-bold uppercase text-brand-night">SKU Configuration</h2>
            </div>

            {/* Table Header for Desktop */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 px-4 py-3 bg-gray-50/50 rounded-lg border border-pebble/40">
              <div className="sm:col-span-3 text-xs font-bold uppercase text-brand-muted-text">Local Variant</div>
              <div className="sm:col-span-3 text-xs font-bold uppercase text-brand-muted-text">SKU Code</div>
              <div className="sm:col-span-4 text-xs font-bold uppercase text-brand-muted-text">Description</div>
              <div className="sm:col-span-2 text-xs font-bold uppercase text-brand-muted-text text-right">Actions</div>
            </div>

            {/* SKU Rows */}
            <div className="space-y-3">
              {skus.map((sku, idx) => (
                <div
                  key={sku.key}
                  className="border border-pebble/60 rounded-xl p-4 bg-white hover:border-pebble transition-all"
                >
                  {/* Mobile View */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold bg-sky/10 text-sky px-2 py-1 rounded-lg">SKU {idx + 1}</span>
                      {skus.length > 1 && (
                        <button
                          onClick={() => deleteRow(sku.key)}
                          className="p-1 hover:bg-red-50 text-brand-muted-text hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-brand-muted-text block mb-2">Local Variant *</label>
                      <select
                        value={sku.localVariantId}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) => (s.key === sku.key ? { ...s, localVariantId: e.target.value } : s))
                          )
                        }
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none"
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
                      <label className="text-xs font-bold uppercase text-brand-muted-text block mb-2">SKU Code *</label>
                      <input
                        type="text"
                        value={sku.skuCode}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) => (s.key === sku.key ? { ...s, skuCode: e.target.value } : s))
                          )
                        }
                        placeholder="e.g., DOVE-REPAIR-UK-001"
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase text-brand-muted-text block mb-2">Description</label>
                      <textarea
                        value={sku.description}
                        onChange={(e) =>
                          setSkus((prev) =>
                            prev.map((s) => (s.key === sku.key ? { ...s, description: e.target.value } : s))
                          )
                        }
                        placeholder="Optional description..."
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none min-h-[80px] resize-none"
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
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none"
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
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none"
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
                        className="w-full px-3 py-2 bg-white border border-pebble rounded-lg text-sm font-semibold focus:ring-2 focus:ring-sky outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end">
                      {skus.length > 1 && (
                        <button
                          onClick={() => deleteRow(sku.key)}
                          className="p-2 hover:bg-red-50 text-brand-muted-text hover:text-red-600 rounded transition-colors"
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
              className="w-full py-3 border border-dashed border-pebble hover:border-sky/50 rounded-xl text-sm font-bold text-brand-muted-text hover:text-sky flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Another SKU
            </button>
          </div>

          {/* Hierarchy Preview (Right Sidebar on Desktop) */}
          <div className="mt-8 pt-6 border-t border-pebble/40">
            <div className="flex items-center gap-2 pb-3">
              <Sparkles className="w-5 h-5 text-brand-sky" />
              <h3 className="text-sm font-bold uppercase text-brand-night">SKU Hierarchy Preview</h3>
            </div>

            <div className="space-y-3 text-sm">
              {skus.length === 0 ? (
                <div className="text-xs text-gray-400 italic py-4">No SKUs created yet</div>
              ) : (
                skus.map((sku) => {
                  const selectedLV = availableLocalVariants.find((lv) => lv.id === sku.localVariantId);
                  if (!selectedLV) return null;

                  return (
                    <div key={sku.key} className="space-y-2">
                      {/* Local Variant Node */}
                      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-pebble/60 shadow-xs">
                        <Globe2 className="w-4 h-4 text-brand-lilac flex-shrink-0" />
                        <span className="text-xs font-semibold text-brand-night flex-1">{selectedLV.name}</span>
                        <span className="text-[10px] font-bold text-gray-400">{selectedLV.geography}</span>
                      </div>

                      {/* SKU Node */}
                      {sku.skuCode && (
                        <div className="pl-4 border-l border-dashed border-pebble">
                          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-pebble/60 shadow-xs">
                            <Layers className="w-4 h-4 text-brand-sky flex-shrink-0" />
                            <span className="text-xs font-semibold text-brand-night flex-1">{sku.skuCode}</span>
                            <span className="text-[10px] font-bold px-2 py-1 rounded bg-sky/10 text-sky">NEW</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 border-t border-pebble bg-earth flex items-center justify-between flex-shrink-0">
        <button
          onClick={handleBackAttempt}
          className="px-5 py-2.5 border border-pebble rounded-xl text-sm font-semibold text-brand-night bg-white hover:bg-gray-50 transition-all cursor-pointer"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <span className="text-xs text-brand-muted-text font-medium hidden sm:inline">
            {canSave() ? "Ready to save SKUs" : "Enter SKU codes to save"}
          </span>
          <button
            onClick={handleSave}
            disabled={!canSave()}
            className="px-6 py-2.5 bg-brand-sky text-white rounded-xl text-sm font-bold shadow-lg shadow-sky/15 hover:bg-sky-dark transition-all disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
          >
            Save SKUs
          </button>
        </div>
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
