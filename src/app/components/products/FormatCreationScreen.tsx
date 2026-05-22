import { useState } from "react";
import {
  ChevronLeft,
  Layers,
  Sparkles,
  Check,
  AlertTriangle,
} from "lucide-react";

interface FormatCreationScreenProps {
  onBack: () => void;
  onCreate: (products: any[]) => void;
}

const BRAND_SUGGESTIONS = [
  "Dove",
  "TRESemmé",
  "Persil",
  "Vaseline",
  "Hellmann's",
  "Domestos",
  "Simple",
  "Comfort",
  "Sunsilk",
  "Knorr",
];

export default function FormatCreationScreen({
  onBack,
  onCreate,
}: FormatCreationScreenProps) {
  const [brand, setBrand] = useState("");
  const [formatName, setFormatName] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  const hasChanges = brand.trim() !== "" || formatName.trim() !== "";
  const isValid = brand.trim() !== "" && formatName.trim() !== "";

  const handleBackAttempt = () => {
    if (hasChanges) {
      setShowCancelConfirm(true);
    } else {
      onBack();
    }
  };

  const handleSave = () => {
    if (!isValid) return;

    const newFormat = {
      id: `fmt-${Date.now()}`,
      productId: `PROD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
      name: `${brand.trim()} ${formatName.trim()}`,
      levelName: formatName.trim(),
      type: "Format" as const,
      lifecycleState: "In-use" as const,
      parentId: null,
      parentName: null,
      childCount: 0,
      claimsCount: 0,
      projectsCount: 0,
      geographyCount: 1,
      geographies: ["Global"],
      category: "Skin Care", // Default fallback
      businessGroup: "Beauty & Wellbeing", // Default fallback
      brand: brand.trim(),
      description: `${brand.trim()} ${formatName.trim()} format.`,
      createdBy: "Sarah Johnson",
      createdDate: new Date().toISOString().split("T")[0],
      isFavorite: false,
    };

    // Auto-assign Business Group & Category based on brand if matched
    const lowerBrand = brand.toLowerCase();
    if (lowerBrand.includes("dove") || lowerBrand.includes("vaseline") || lowerBrand.includes("simple")) {
      newFormat.businessGroup = "Beauty & Wellbeing";
      newFormat.category = "Skin Care";
    } else if (lowerBrand.includes("tresemme") || lowerBrand.includes("sunsilk")) {
      newFormat.businessGroup = "Beauty & Wellbeing";
      newFormat.category = "Hair Care";
    } else if (lowerBrand.includes("persil") || lowerBrand.includes("comfort")) {
      newFormat.businessGroup = "Home Care";
      newFormat.category = "Fabric Care";
    } else if (lowerBrand.includes("domestos")) {
      newFormat.businessGroup = "Home Care";
      newFormat.category = "Home Hygiene";
    } else if (lowerBrand.includes("hellmann") || lowerBrand.includes("knorr")) {
      newFormat.businessGroup = "Foods";
      newFormat.category = "Condiments";
    }

    onCreate([newFormat]);
  };

  const filteredBrands = BRAND_SUGGESTIONS.filter((b) =>
    b.toLowerCase().includes(brand.toLowerCase())
  );
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden text-night">
      {/* Top Header bar */}
      <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-white flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackAttempt}
            className="p-2 text-gray-400 hover:text-night hover:bg-earth rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-sky/10 flex items-center justify-center text-sky">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-night leading-none">Format Creation</h1>
            <p className="text-sm text-gray-500 mt-1">
              Create a new top-level product format
            </p>
          </div>
        </div>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-earth/10">
        {/* Left: Input Form (70%) */}
        <div className="w-[70%] flex flex-col p-6 overflow-y-auto border-r border-pebble/65">
          <div className="bg-white rounded-2xl border border-pebble/50 shadow-sm p-6 space-y-6 max-w-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-night border-b border-pebble pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky" />
              Format Details
            </h2>

            {/* Brand Field */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Brand <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setBrandDropdownOpen(true);
                  }}
                  onFocus={() => setBrandDropdownOpen(true)}
                  placeholder="e.g. Dove, TRESemmé, Persil..."
                  className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
                />
              </div>
              {brandDropdownOpen && filteredBrands.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-pebble rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
                  {filteredBrands.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBrand(b);
                        setBrandDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-night hover:bg-earth transition-colors font-semibold"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              )}
              {brandDropdownOpen && (
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setBrandDropdownOpen(false)}
                />
              )}
            </div>

            {/* Format Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Format Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formatName}
                onChange={(e) => setFormatName(e.target.value)}
                placeholder="Enter format name only..."
                className="w-full px-3.5 py-2.5 bg-earth/50 border border-pebble rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky/50 focus:border-sky transition-all placeholder:font-normal"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Preview (30%) */}
        <div className="w-[30%] flex flex-col p-6 bg-earth/20 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky" />
              Live Preview
            </h3>

            {brand.trim() || formatName.trim() ? (
              <div className="bg-white border border-pebble/65 rounded-2xl shadow-sm p-4 space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2 pb-2.5 border-b border-pebble/50">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky" />
                  <span className="text-[10px] font-extrabold uppercase text-sky tracking-wider">
                    New Product Format
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">
                    Full Product Name
                  </div>
                  <div className="text-sm font-bold text-night truncate">
                    {brand.trim() || "Brand"} {formatName.trim() || "Format Name"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Brand
                    </div>
                    <div className="text-xs font-semibold text-night">
                      {brand.trim() || <span className="italic text-gray-300">Dove...</span>}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-400 uppercase">
                      Format Level Name
                    </div>
                    <div className="text-xs font-semibold text-night">
                      {formatName.trim() || <span className="italic text-gray-300">Body Wash...</span>}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-earth/30 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Lifecycle state</span>
                    <span className="font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase text-[9px]">
                      In-use
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Geographies</span>
                    <span className="font-semibold text-night">Global</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-pebble/70 rounded-2xl p-8 text-center text-gray-400 space-y-2">
                <Layers className="w-8 h-8 mx-auto text-gray-350" />
                <p className="text-xs font-bold leading-relaxed">
                  Start filling out the details on the left to see the live preview of your format.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-6 py-4 border-t border-pebble bg-white flex items-center justify-between flex-shrink-0 z-20">
        <button
          onClick={handleBackAttempt}
          className="px-6 py-2.5 border border-pebble rounded-xl text-sm font-bold text-gray-650 hover:bg-earth hover:text-night transition-all cursor-pointer bg-white"
        >
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="flex items-center gap-2 px-6 py-2.5 bg-sky text-white rounded-xl text-sm font-bold hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-sky/20 active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Create Format
          </button>
        </div>
      </div>

      {/* Cancel Confirmation Popup */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="bg-white border border-pebble rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-50 text-red-500 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-night">Discard Changes?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  All unsaved format details will be lost permanently.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 border border-pebble text-gray-600 hover:text-night hover:bg-earth font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white"
              >
                Keep Editing
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-red-650 hover:bg-red-750 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
