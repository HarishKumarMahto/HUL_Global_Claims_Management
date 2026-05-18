import { useState } from 'react';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Project } from '../types';

interface CancelProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  onConfirm: (category: string, reason: string) => void;
}

export const CANCEL_CATEGORIES = [
  'Strategic Realignment',
  'Budget Cut',
  'Market Shift',
  'Technical Feasibility',
  'Regulatory Hurdle',
  'Other'
];

export default function CancelProjectModal({
  isOpen,
  onClose,
  project,
  onConfirm
}: CancelProjectModalProps) {
  if (!isOpen) return null;

  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');

  const isFormValid = category.trim().length > 0 && reason.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onConfirm(category.trim(), reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-amber-100/80 border-b border-amber-200 text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200/60 rounded-xl border border-amber-300">
              <AlertTriangle className="w-6 h-6 text-amber-900" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-amber-950">Cancel Project</h2>
              <p className="text-xs text-amber-900 mt-0.5 font-semibold tracking-wide">
                {project.name} ({project.projectId})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-amber-800 hover:text-amber-950 rounded-lg hover:bg-amber-200/50 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Information banner */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed">
              <p className="font-bold mb-1">Cancellation Policy</p>
              <p>Cancelling this project will remove it from active workspaces while retaining full history, audit logs, comments, and linked records. Projects can be restored to Draft at any time.</p>
              <p className="mt-1 font-semibold text-red-700">Archival is automated after 90 days of no action.</p>
            </div>
          </div>

          {/* Reason Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            >
              <option value="">Select a reason category...</option>
              {CANCEL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Free text reason */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Detailed Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Provide detailed context for why this project is being cancelled..."
              className="w-full px-3 py-2.5 bg-white border border-pebble rounded-xl text-sm text-night focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">Required. Please provide sufficient justification for auditing purposes.</p>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-earth border-t border-pebble flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-pebble text-night rounded-xl text-sm font-semibold hover:bg-earth transition-colors"
            >
              Keep Active
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" /> Confirm Cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
