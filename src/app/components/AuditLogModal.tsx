import React, { useState } from 'react';
import { X, Clock, User, Shield, Search, ArrowRight, Calendar, CheckCircle2, RefreshCw, PlusCircle, AlertCircle, Trash2, Edit } from 'lucide-react';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  details?: string;
  type: 'create' | 'update' | 'delete' | 'status' | 'link' | 'system';
}

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName: string;
  itemId: string;
  logs: AuditLogItem[];
}

export default function AuditLogModal({
  isOpen,
  onClose,
  title,
  itemName,
  itemId,
  logs,
}: AuditLogModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  if (!isOpen) return null;

  const getIcon = (type: AuditLogItem['type']) => {
    switch (type) {
      case 'create':
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'status':
        return <RefreshCw className="w-4 h-4 text-sky" />;
      case 'link':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'update':
        return <Edit className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBgClass = (type: AuditLogItem['type']) => {
    switch (type) {
      case 'create':
        return 'bg-emerald-50 border border-emerald-200';
      case 'delete':
        return 'bg-red-50 border border-red-200';
      case 'status':
        return 'bg-blue-50 border border-blue-150';
      case 'link':
        return 'bg-purple-50 border border-purple-200';
      case 'update':
        return 'bg-amber-50 border border-amber-200';
      default:
        return 'bg-gray-50 border border-gray-200';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || log.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between flex-shrink-0 bg-earth/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-sky/10 text-sky px-2.5 py-1 rounded-full font-semibold font-mono tracking-wide">{itemId}</span>
              <h2 className="text-night text-lg font-bold">{title}</h2>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Showing audit trail history for <span className="font-semibold text-night">{itemName}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-earth rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="px-6 py-3 border-b border-pebble bg-earth/20 flex gap-3 flex-shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search actions, actors or details..."
              className="w-full pl-9 pr-4 py-2 border border-pebble rounded-lg text-sm text-night bg-white focus:outline-none focus:ring-2 focus:ring-sky"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-pebble rounded-lg text-sm bg-white text-night focus:outline-none focus:ring-2 focus:ring-sky"
          >
            <option value="all">All Event Types</option>
            <option value="create">Creations</option>
            <option value="update">Updates</option>
            <option value="status">Status Changes</option>
            <option value="link">Platform Links</option>
            <option value="delete">Deletions</option>
          </select>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredLogs.length > 0 ? (
            <div className="relative pl-6 border-l-2 border-pebble/70 ml-3 space-y-6">
              {filteredLogs.map((log, index) => (
                <div key={log.id} className="relative group">
                  {/* Icon Node */}
                  <div className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-white transition-transform group-hover:scale-110 shadow-sm ${getBgClass(log.type)}`}>
                    {getIcon(log.type)}
                  </div>

                  {/* Log Content Card */}
                  <div className="bg-earth/10 hover:bg-earth/20 border border-pebble/30 rounded-xl p-4 transition-all duration-200">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <span className="text-sm text-night font-semibold tracking-tight leading-snug">
                        {log.action}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                        <Calendar className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </div>
                    </div>

                    {log.details && (
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed bg-white/60 p-2 rounded-lg border border-pebble/10">
                        {log.details}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-5 h-5 rounded-full bg-sky text-white flex items-center justify-center text-[10px] font-bold">
                        {log.actor.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {log.actor}
                      </span>
                      <span className="text-[10px] bg-sky/10 text-sky px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">
                        {log.role}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-sm text-night font-semibold">No audit entries match</p>
              <p className="text-xs text-gray-400 mt-1">Try resetting your search query or type filters.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-pebble flex items-center justify-between flex-shrink-0 bg-earth/5">
          <span className="text-xs text-gray-400 font-medium">
            {filteredLogs.length} event{filteredLogs.length !== 1 ? 's' : ''} logged in history
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-sky text-white rounded-lg text-sm hover:bg-dark transition-colors font-medium shadow-sm"
          >
            Close Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
}
