import React, { useState } from "react";
import { X, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import type { DocumentRecord } from "./documentsData";

interface CancelDocumentModalProps {
  isOpen: boolean;
  document: DocumentRecord;
  onClose: () => void;
  onConfirm: (updatedDoc: DocumentRecord) => void;
  allDocuments?: DocumentRecord[];
}

export default function CancelDocumentModal({
  isOpen,
  document,
  onClose,
  onConfirm,
  allDocuments = [],
}: CancelDocumentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"confirm" | "impact">("impact");

  if (!isOpen) return null;

  // Impact analysis
  const linkedClaimCount = (document.linkedClaimIds || []).length;
  const linkedAssetCount = (document.linkedAssetIds || []).length;
  const linkedProductCount = (document.linkedProductIds || []).length;
  const linkedProjectCount = (document.linkedProjectIds || []).length;

  // Block Formulation Documents with Related products
  const isBlocked =
    document.documentType === "Formulation Document" && linkedProductCount > 0;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Cancellation reason is required");
      return;
    }
    if (isBlocked) return;

    const now = new Date().toISOString();
    const updated: DocumentRecord = {
      ...document,
      lifecycleState: "Cancelled",
      cancelReason: reason.trim(),
      modifiedDate: now,
      versions: document.versions.map((v) =>
        v.versionNumber === document.currentVersion
          ? { ...v, lifecycleState: "Cancelled" }
          : v,
      ),
      // Remove all linkages
      linkedClaimIds: [],
      linkedAssetIds: [],
      linkedProductIds: [],
      linkedProjectIds:
        document.documentType === "Project Document"
          ? []
          : document.linkedProjectIds,
    };
    onConfirm(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-night">
                Cancel Document
              </h2>
              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[280px]">
                {document.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-earth rounded-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Blocked state — Formulation with products */}
          {isBlocked && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Cannot Cancel</p>
                <p className="text-xs text-red-600 mt-1">
                  This Formulation Document is currently linked to{" "}
                  <strong>{linkedProductCount}</strong> product
                  {linkedProductCount !== 1 ? "s" : ""}. Remove all product
                  linkages before cancelling.
                </p>
              </div>
            </div>
          )}

          {/* Impact summary */}
          {!isBlocked && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Impact Summary
                  </span>
                </div>
                {linkedClaimCount > 0 && (
                  <p className="text-xs text-amber-700">
                    • <strong>{linkedClaimCount}</strong> Related Claim
                    {linkedClaimCount !== 1 ? "s" : ""} will be unlinked from
                    this document
                  </p>
                )}
                {linkedAssetCount > 0 && (
                  <p className="text-xs text-amber-700">
                    • <strong>{linkedAssetCount}</strong> Related Asset
                    {linkedAssetCount !== 1 ? "s" : ""} will be unlinked from
                    this document
                  </p>
                )}
                {linkedProjectCount > 0 &&
                  document.documentType === "Project Document" && (
                    <p className="text-xs text-amber-700">
                      • <strong>{linkedProjectCount}</strong> Project linkage
                      {linkedProjectCount !== 1 ? "s" : ""} will be removed
                    </p>
                  )}
                {linkedClaimCount === 0 &&
                  linkedAssetCount === 0 &&
                  linkedProjectCount === 0 && (
                    <p className="text-xs text-amber-600">
                      No active linkages — safe to cancel.
                    </p>
                  )}
                <p className="text-xs text-amber-700 mt-2 font-medium">
                  This action cannot be undone. The document will move to{" "}
                  <strong>Cancelled</strong> state.
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-night mb-1.5">
                  Reason for Cancellation{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  rows={3}
                  placeholder="Explain why this document is being cancelled…"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-sky outline-none resize-none ${error ? "border-red-400" : "border-pebble"}`}
                />
                {error && (
                  <p className="flex items-center gap-1.5 mt-1 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-earth rounded-xl transition-colors"
          >
            {isBlocked ? "Close" : "Cancel"}
          </button>
          {!isBlocked && (
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-all active:scale-95"
            >
              Confirm Cancellation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
