import React from 'react';
import {
  FolderKanban, Paperclip, CheckSquare,
  Film, Image as ImageIcon, Package, FileText,
  Shield, AlertTriangle, CheckCircle, Minus,
  User, Plus, Globe
} from 'lucide-react';
import type { Project } from '../../types';
import {
  mockHomeAssets, mockHomeTasks,
  CURRENT_USER,
} from '../../types';

interface HomePageProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  onViewAllProjects: () => void;
  onAssetClick: (asset: typeof mockHomeAssets[0]) => void;
  onViewAllAssets: () => void;
  onViewAllTasks: () => void;
  onViewAllActivities: () => void;
  onCreateProjectClick?: () => void;
  onCreateAssetClick?: () => void;
}

// ──────────────────────────────────────────────────────────────────────────
// LIFECYCLE STAGES CONFIG
// ──────────────────────────────────────────────────────────────────────────

const LIFECYCLE_STAGES_LIST = [
  'Draft',
  'Substantiate',
  'Review & Risk Assessment',
  'Complete',
] as const;

type LifecycleStageType = typeof LIFECYCLE_STAGES_LIST[number];

function getLifecycleDotStyle(
  dotStage: LifecycleStageType,
  currentStage: string
): string {
  const currentIdx = LIFECYCLE_STAGES_LIST.indexOf(currentStage as LifecycleStageType);
  const dotIdx = LIFECYCLE_STAGES_LIST.indexOf(dotStage);
  if (currentIdx === -1) return 'bg-gray-200';
  if (dotIdx < currentIdx) return 'bg-green-500';
  if (dotIdx === currentIdx) return 'bg-sky';
  return 'bg-gray-200';
}

// ──────────────────────────────────────────────────────────────────────────
// FINAL RISK ICON
// ──────────────────────────────────────────────────────────────────────────

function FinalRiskIcon({ riskLevel }: { riskLevel: 'Low' | 'Medium' | 'High' | 'Very High' | null | undefined }) {
  if (!riskLevel) return null;
  const config: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    'Low': { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'text-green-600', bg: 'bg-green-50' },
    'Medium': { icon: <Shield className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50' },
    'High': { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600', bg: 'bg-red-50' },
    'Very High': { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-800', bg: 'bg-red-100' },
  };
  const c = config[riskLevel] || config['Low'];
  return (
    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${c.bg} ${c.color}`} title={`Final Risk: ${riskLevel}`}>
      {c.icon}
      <span className="text-xs" style={{ fontWeight: 600 }}>{riskLevel}</span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// SCOPE BADGE
// ──────────────────────────────────────────────────────────────────────────

function ScopeBadge({ scope }: { scope: string }) {
  const styles: Record<string, string> = {
    'Global': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Local': 'bg-purple-50 text-purple-700 border border-purple-200',
    'Global + Local': 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    'Regional': 'bg-teal-50 text-teal-700 border border-teal-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${styles[scope] || 'bg-gray-100 text-gray-500'}`} style={{ fontWeight: 500 }}>
      {scope}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (date.toDateString() === now.toDateString()) return 'Today';
  if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAssetTypeIcon(fileType: string): React.ReactNode {
  switch (fileType) {
    case 'Video': return <Film className="w-4 h-4 text-sky" />;
    case 'Image': return <ImageIcon className="w-4 h-4 text-purple-500" />;
    case 'PDF': return <FileText className="w-4 h-4 text-red-500" />;
    case 'PPT': return <FileText className="w-4 h-4 text-orange-500" />;
    default: return <FileText className="w-4 h-4 text-gray-400" />;
  }
}

function getAssetStateStyle(state: string): string {
  const styles: Record<string, string> = {
    'Approved': 'bg-green-50 text-green-700 border border-green-200',
    'In Production': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Under Review': 'bg-amber-50 text-amber-700 border border-amber-200',
    'On Hold': 'bg-gray-100 text-gray-500 border border-gray-200',
    'Draft': 'bg-earth text-gray-600 border border-pebble',
  };
  return styles[state] || 'bg-earth text-gray-600 border border-pebble';
}

function getPriorityDotStyle(priority: string): string {
  const styles: Record<string, string> = { 'High': 'bg-red-500', 'Medium': 'bg-amber-400', 'Low': 'bg-gray-300' };
  return styles[priority] || 'bg-gray-300';
}

function getTaskStatusStyle(status: string): string {
  const styles: Record<string, string> = {
    'Overdue': 'bg-red-50 text-red-600 border border-red-200',
    'Due Today': 'bg-amber-50 text-amber-700 border border-amber-200',
    'Upcoming': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Completed': 'bg-green-50 text-green-700 border border-green-200',
  };
  return styles[status] || 'bg-gray-100 text-gray-500 border border-gray-200';
}

// ──────────────────────────────────────────────────────────────────────────
// SECTION WRAPPER
// ──────────────────────────────────────────────────────────────────────────

function SectionWrapper({
  icon, title, subtitle, total, limit = 6,
  viewAllLabel = 'View All', onViewAll, children, className = '',
}: {
  icon: React.ReactNode; title: string; subtitle: string; total: number; limit?: number;
  viewAllLabel?: string; onViewAll: () => void; children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col h-full bg-white border border-pebble rounded-2xl p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pale rounded-lg">{icon}</div>
          <div>
            <h2 className="text-base text-night" style={{ fontWeight: 600 }}>{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
        {total > limit && (
          <button onClick={onViewAll} className="text-sm text-sky hover:underline transition-colors" style={{ fontWeight: 500 }}>
            {viewAllLabel}
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────

export default function HomePage({
  projects,
  onProjectClick,
  onViewAllProjects,
  onAssetClick,
  onViewAllAssets,
  onViewAllTasks,
  onViewAllActivities,
  onCreateProjectClick,
  onCreateAssetClick,
}: HomePageProps) {
  // ── Projects: max 3 (with 1 Create Project card, total 4) ───────────────────────────
  const myProjects = projects
    .filter(p => p.projectLead === CURRENT_USER || p.claimsLead === CURRENT_USER)
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  const totalProjects = projects.filter(
    p => p.projectLead === CURRENT_USER || p.claimsLead === CURRENT_USER
  ).length;

  // ── Assets: max 3 (with 1 Create Asset card, total 4) ────────────────────────────
  const myAssets = mockHomeAssets
    .filter(a => a.createdBy === CURRENT_USER || a.workflowParticipants.includes(CURRENT_USER))
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 3);

  const totalAssets = mockHomeAssets.filter(
    a => a.createdBy === CURRENT_USER || a.workflowParticipants.includes(CURRENT_USER)
  ).length;

  // ── Tasks: no limit cap on display, sorted by due date ──────────────
  const myTasks = mockHomeTasks
    .filter(t => t.assignedTo === CURRENT_USER)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 15);

  const totalTasks = mockHomeTasks.filter(t => t.assignedTo === CURRENT_USER).length;

  return (
    <div className="flex-1 overflow-y-auto bg-transparent">
      {/* Page header */}
      <div className="bg-white border-b border-pebble px-6 py-4 flex-shrink-0">
        <h1 className="text-night">Good morning, Sarah 👋</h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening across your projects today.
        </p>
      </div>

      {/* Content grid */}
      <div className="p-6 space-y-6">

        {/* TOP ROW: Projects (left) & Assets (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── PROJECTS ───────────────────────────────────────────── */}
          <SectionWrapper
            icon={<FolderKanban className="w-4 h-4 text-sky" />}
            title="My Projects"
            subtitle={`${totalProjects} projects total`}
            total={totalProjects}
            limit={4}
            onViewAll={onViewAllProjects}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Project Card */}
              <div
                onClick={onCreateProjectClick}
                className="bg-gradient-to-br from-blue-50/90 to-sky-100/70 hover:from-blue-100/80 hover:to-sky-200/60 rounded-xl border-2 border-dashed border-sky p-5 cursor-pointer shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-center h-[220px] text-center group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-sky font-bold" strokeWidth={3} />
                </div>
                <h3 className="text-base font-bold text-sky-800 mb-1 group-hover:text-sky-900 transition-colors">
                  Create New Project
                </h3>
                <p className="text-xs text-sky-600/80 font-medium">
                  Initiate a new project and track assessment progress
                </p>
              </div>

              {myProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => onProjectClick(project)}
                  className="bg-earth rounded-xl border border-pebble p-4 cursor-pointer hover:border-sky/40 hover:shadow-md transition-all group flex flex-col justify-between h-[220px]"
                >
                  <div>
                    {/* Project name */}
                    <h3 className="text-sm text-night leading-snug group-hover:text-sky transition-colors line-clamp-2 mb-3" style={{ fontWeight: 500 }}>
                      {project.name}
                    </h3>

                    {/* BG + Category + Scope */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                      <span className="text-xs bg-pale text-sky px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>
                        {project.businessGroup}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{project.category}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <ScopeBadge scope={project.scope} />
                    </div>

                    {/* Geography row */}
                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-4">
                      <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-400 uppercase tracking-wider text-[9px] flex-shrink-0">Geography:</span>
                      <span className="text-night font-medium truncate">{project.region || 'Global'}</span>
                    </div>

                    {/* Lifecycle progress tracker (Shifted downwards with mt-10 mb-2) */}
                    <div className="mt-10 mb-2">
                      <div className="flex items-start gap-1">
                        {LIFECYCLE_STAGES_LIST.map((stage) => {
                          const isCurrent = stage === project.lifecycleStage;
                          return (
                            <div key={stage} className="flex-1 flex flex-col">
                              <div
                                title={stage}
                                className={`h-2.5 rounded-sm ${getLifecycleDotStyle(stage, project.lifecycleStage)}`}
                              />
                              <div className="h-4 mt-1 relative flex justify-center">
                                {isCurrent && (
                                  <span className="text-[9px] text-sky font-bold whitespace-nowrap absolute text-center" title="Current Stage">
                                    {stage === "Review & Risk Assessment" ? "Review & Risk" : stage}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer: Creator name + last updated + Final Risk icon */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-pebble gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{project.projectCreator || project.projectLead}</span>
                      <span className="text-xs text-gray-300 flex-shrink-0 mx-0.5">·</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{formatRelativeDate(project.lastUpdated)}</span>
                    </div>
                    <FinalRiskIcon riskLevel={project.finalRiskLevel} />
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>

          {/* ── ASSETS ─────────────────────────────────────────────── */}
          <SectionWrapper
            icon={<Paperclip className="w-4 h-4 text-sky" />}
            title="My Assets"
            subtitle={`${totalAssets} assets total`}
            total={totalAssets}
            limit={4}
            onViewAll={onViewAllAssets}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Create Asset Card */}
              <div
                onClick={onCreateAssetClick}
                className="bg-gradient-to-br from-blue-50/90 to-sky-100/70 hover:from-blue-100/80 hover:to-sky-200/60 rounded-xl border-2 border-dashed border-sky p-5 cursor-pointer shadow-sm hover:shadow-lg transition-all flex flex-col items-center justify-center h-[220px] text-center group"
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-sky font-bold" strokeWidth={3} />
                </div>
                <h3 className="text-base font-bold text-sky-800 mb-1 group-hover:text-sky-900 transition-colors">
                  Create New Asset
                </h3>
                <p className="text-xs text-sky-600/80 font-medium">
                  Upload a new marketing asset or placeholder
                </p>
              </div>

              {myAssets.map(asset => (
                <div
                  key={asset.id}
                  onClick={() => onAssetClick(asset)}
                  className="bg-earth rounded-xl border border-pebble p-4 cursor-pointer hover:border-sky/40 hover:shadow-md transition-all group flex flex-col justify-between h-[220px]"
                >
                  <div>
                    {/* Asset icon + Name + version */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-pebble flex items-center justify-center flex-shrink-0 mt-0.5">
                        {getAssetTypeIcon(asset.fileType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm text-night leading-snug group-hover:text-sky transition-colors line-clamp-2" style={{ fontWeight: 500 }}>
                          {asset.name}
                          {asset.versionNumber && (
                            <span className="ml-1.5 text-xs text-gray-400 font-normal">({asset.versionNumber})</span>
                          )}
                        </h3>
                        {/* Subtype */}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {asset.subtype}
                        </p>
                      </div>
                    </div>

                    {/* Lifecycle State badge */}
                    <div className="mb-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getAssetStateStyle(asset.lifecycleState)}`} style={{ fontWeight: 500 }}>
                        {asset.lifecycleState}
                      </span>
                    </div>

                    {/* BG + Categories */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <span className="text-xs bg-pale text-sky px-2 py-0.5 rounded" style={{ fontWeight: 500 }}>
                        {asset.businessGroup}
                      </span>
                      {asset.categories?.length > 0 && (
                        <span className="text-xs text-gray-500 truncate">
                          {asset.categories.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Project name */}
                    <p className="text-xs text-gray-500 truncate mb-3" title={asset.projectName}>
                      {asset.projectName}
                    </p>
                  </div>

                  {/* Footer: Created by + last updated + Final Risk */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-pebble gap-2">
                    <div className="flex items-center gap-1 min-w-0">
                      <User className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{asset.createdBy}</span>
                      <span className="text-xs text-gray-300 flex-shrink-0 mx-0.5">·</span>
                      <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{formatRelativeDate(asset.lastUpdated)}</span>
                    </div>
                    <FinalRiskIcon riskLevel={asset.finalRiskLevel} />
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>

        {/* BOTTOM ROW: My Tasks (left) + Blank (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── MY TASKS ────────────────────────────────────────────── */}
          <SectionWrapper
            icon={<CheckSquare className="w-4 h-4 text-sky" />}
            title="My Tasks"
            subtitle={`${totalTasks} tasks assigned`}
            total={totalTasks}
            limit={6}
            viewAllLabel=" "
            onViewAll={onViewAllTasks}
          >
            {myTasks.length === 0 ? (
              <div className="bg-earth rounded-xl border border-pebble p-12 text-center">
                <p className="text-sm text-night mb-1" style={{ fontWeight: 500 }}>No tasks assigned</p>
                <p className="text-xs text-gray-400">You have no pending tasks at the moment.</p>
              </div>
            ) : (
              <div className="bg-earth rounded-xl border border-pebble divide-y divide-pebble h-[372px] overflow-y-auto no-scrollbar">
                {myTasks.map(task => {
                  const matchingProject = projects.find(p => p.id === task.projectId || p.projectId === task.projectId || p.name.toLowerCase() === task.projectName.toLowerCase());
                  const isClickable = !!matchingProject;

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        if (matchingProject) {
                          onProjectClick(matchingProject);
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 transition-all ${
                        isClickable
                          ? 'cursor-pointer hover:bg-pale/30 hover:translate-x-1'
                          : ''
                      }`}
                      title={isClickable ? `Go to project: ${task.projectName}` : undefined}
                    >
                      {/* Task type icon — Project or Asset */}
                      <div className="flex-shrink-0" title={task.taskType === 'asset' ? 'Asset task' : 'Project task'}>
                        {task.taskType === 'asset' ? (
                          <Paperclip className="w-4 h-4 text-gray-400" />
                        ) : (
                          <FolderKanban className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {/* Task info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-night truncate" style={{ fontWeight: 500 }}>
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{task.projectName}</p>
                      </div>

                      {/* Status + Due date */}
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getTaskStatusStyle(task.status)}`} style={{ fontWeight: 500 }}>
                          {task.status}
                        </span>
                        <span className="text-xs text-gray-400">Due {formatDate(task.dueDate)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionWrapper>

          {/* ── BLANK AREA (right bottom) ─────────────────────────── */}
          <div />
        </div>
      </div>
    </div>
  );
}