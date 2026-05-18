import { useState, useEffect } from 'react';
import { Plus, X, UserCheck, Clock, UserX, Search, ChevronDown, Check } from 'lucide-react';
import { Project, TeamMember, generateTeamMembersForProject } from '../../types';

const SCOPES = ['Global', 'Local', 'Global + Local'];

const ALL_USERS = [
  { id: 'u1', name: 'Amanda Wilson', email: 'a.wilson@unilever.com', department: 'R&D' },
  { id: 'u2', name: 'Christopher Lee', email: 'c.lee@unilever.com', department: 'RA' },
  { id: 'u3', name: 'Daniel Garcia', email: 'd.garcia@unilever.com', department: 'Legal' },
  { id: 'u4', name: 'Jennifer Davis', email: 'j.davis@unilever.com', department: 'R&D' },
  { id: 'u5', name: 'Karen White', email: 'k.white@unilever.com', department: 'RA' },
  { id: 'u6', name: 'Thomas Moore', email: 't.moore@unilever.com', department: 'Legal' },
  { id: 'u7', name: 'Nancy Rodriguez', email: 'n.rodriguez@unilever.com', department: 'R&D' },
  { id: 'u8', name: 'Matthew Jackson', email: 'm.jackson@unilever.com', department: 'RA' },
  { id: 'u9', name: 'James Liu', email: 'j.liu@unilever.com', department: 'R&D' },
  { id: 'u10', name: 'Dr. Sarah Johnson', email: 's.johnson@unilever.com', department: 'R&D' },
  { id: 'u11', name: 'Dr. Priya Sharma', email: 'p.sharma@unilever.com', department: 'R&D' },
  { id: 'u12', name: 'Michael Chen', email: 'm.chen@unilever.com', department: 'RA' },
  { id: 'u13', name: 'Emma Williams', email: 'e.williams@unilever.com', department: 'RA' },
  { id: 'u14', name: 'Robert Taylor', email: 'r.taylor@unilever.com', department: 'Legal' },
  { id: 'u15', name: 'Patricia Martinez', email: 'p.martinez@unilever.com', department: 'Legal' }
];

const ROLES_BY_TEAM = {
  rd: ['R&D Scientist', 'R&D Lead', 'R&D Nutritionist', 'Lab Analyst', 'Formulator'],
  ra: ['Regulatory Specialist', 'Regulatory Manager', 'RA Expert', 'Claims Specialist'],
  legal: ['Legal Counsel', 'IP Attorney', 'IP Counsel', 'Legal Specialist']
};

interface TeamCard {
  id: 'rd' | 'ra' | 'legal';
  team: string;
  color: string;
  bgColor: string;
  members: TeamMember[];
}

const StatusChip = ({ status }: { status: TeamMember['status'] }) => {
  const styles = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };
  const icons = {
    active: <UserCheck className="w-3 h-3" />,
    pending: <Clock className="w-3 h-3" />,
    rejected: <UserX className="w-3 h-3" />
  };
  const labels = { active: 'Active', pending: 'Pending', rejected: 'Rejected' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status]}`}>
      {icons[status]}
      {labels[status]}
    </span>
  );
};

const AvatarCircle = ({ initials, status }: { initials: string; status: TeamMember['status'] }) => {
  const ring = status === 'active' ? 'ring-2 ring-green-400' : status === 'pending' ? 'ring-2 ring-amber-400' : 'ring-2 ring-red-300';
  return (
    <div className={`w-8 h-8 rounded-full bg-[#0052A3] text-white flex items-center justify-center text-xs ${ring} flex-shrink-0 font-bold shadow-sm`}>
      {initials}
    </div>
  );
};

interface AddMemberModalProps {
  teamName: string;
  teamId: 'rd' | 'ra' | 'legal';
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id'>) => void;
  existingEmails: Set<string>;
}

function AddMemberModal({ teamName, teamId, onClose, onAdd, existingEmails }: AddMemberModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof ALL_USERS[0] | null>(null);
  const [role, setRole] = useState(ROLES_BY_TEAM[teamId][0]);
  const [scope, setScope] = useState('Contributor');
  const [status, setStatus] = useState<'active' | 'pending'>('active');

  const filtered = ALL_USERS.filter(u =>
    !existingEmails.has(u.email) && (
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleSend = () => {
    if (!selectedUser) return;
    onAdd({
      name: selectedUser.name,
      email: selectedUser.email,
      role,
      status,
      avatar: selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase(),
      teamId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in backdrop-blur-xs">
      <div className="bg-white dark:bg-card border border-pebble rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-pebble flex items-center justify-between bg-earth/40 dark:bg-earth/10">
          <h3 className="text-night dark:text-white font-bold text-base">Add Member to {teamName}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-earth dark:hover:bg-earth/20 rounded-lg transition-colors text-gray-500 hover:text-night dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* User Search */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">Search User</label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); if (selectedUser && e.target.value !== selectedUser.name) setSelectedUser(null); }}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-background border border-pebble rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0052A3] text-night dark:text-white"
              />
            </div>
            {search && !selectedUser && (
              <div className="mt-1 border border-pebble rounded-lg overflow-hidden max-h-40 overflow-y-auto bg-white dark:bg-background shadow-lg z-50 relative">
                {filtered.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 text-center">No available matching users found</div>
                ) : (
                  filtered.map(user => (
                    <button
                      key={user.id}
                      onClick={() => { setSelectedUser(user); setSearch(user.name); }}
                      className="w-full text-left px-3 py-2 hover:bg-earth/40 dark:hover:bg-earth/10 text-sm flex items-center gap-3 border-b border-pebble/30 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#0052A3]/10 text-[#0052A3] dark:text-sky flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-night dark:text-white font-medium truncate">{user.name}</div>
                        <div className="text-gray-400 text-xs truncate">{user.email}</div>
                      </div>
                      <span className="text-[10px] text-gray-400 bg-earth dark:bg-earth/20 px-2 py-0.5 rounded font-medium">{user.department}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedUser && (
              <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-lg flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {selectedUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-green-800 dark:text-green-400 font-semibold text-xs truncate">{selectedUser.name} selected</div>
                  <div className="text-green-600 dark:text-green-500 text-[10px] truncate">{selectedUser.email}</div>
                </div>
                <button onClick={() => { setSelectedUser(null); setSearch(''); }} className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg text-green-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Role Choice */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">Role / Title</label>
            <div className="relative">
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-background border border-pebble rounded-lg text-sm text-night dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052A3] appearance-none cursor-pointer"
              >
                {ROLES_BY_TEAM[teamId].map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* User Scope / Access */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide font-semibold">User Scope</label>
            <div className="relative">
              <select
                value={scope}
                onChange={e => setScope(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-background border border-pebble rounded-lg text-sm text-night dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0052A3] appearance-none cursor-pointer"
              >
                {SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-pebble flex justify-end gap-3 bg-earth/20 dark:bg-earth/5">
          <button onClick={onClose} className="px-4 py-2 border border-pebble text-night dark:text-white rounded-lg text-sm hover:bg-earth/40 transition-colors">Cancel</button>
          <button
            disabled={!selectedUser}
            onClick={handleSend}
            className="px-4 py-2 bg-[#0052A3] text-white rounded-lg text-sm hover:bg-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Add Member
          </button>
        </div>
      </div>
    </div>
  );
}

interface ProjectTeamTabProps {
  project: Project;
  onSave: (updated: Project) => void;
}

export default function ProjectTeamTab({ project, onSave }: ProjectTeamTabProps) {
  const [addMemberModal, setAddMemberModal] = useState<{ teamId: 'rd' | 'ra' | 'legal'; teamName: string } | null>(null);

  // Auto-populate team members if they aren't initialized yet
  useEffect(() => {
    if (!project.teamMembers || project.teamMembers.length === 0) {
      const geos = project.region ? project.region.split(',').map(g => g.trim()) : [];
      const autoTeam = generateTeamMembersForProject(project.businessGroup, geos, project.projectLead);
      onSave({
        ...project,
        teamMembers: autoTeam
      });
    }
  }, [project.id]);

  const currentMembers = project.teamMembers || [];

  const handleAddMember = (newMember: Omit<TeamMember, 'id'>) => {
    const nextId = `user-m-${Date.now()}`;
    const updatedMembers = [
      ...currentMembers,
      {
        id: nextId,
        ...newMember,
        joinedDate: newMember.status === 'active' ? new Date().toISOString().split('T')[0] : undefined
      }
    ];
    onSave({
      ...project,
      teamMembers: updatedMembers
    });
  };

  const handleRemoveMember = (memberId: string) => {
    const updatedMembers = currentMembers.filter(m => m.id !== memberId);
    onSave({
      ...project,
      teamMembers: updatedMembers
    });
  };

  const handleApproveMember = (memberId: string) => {
    const updatedMembers = currentMembers.map(m =>
      m.id === memberId
        ? { ...m, status: 'active' as const, joinedDate: new Date().toISOString().split('T')[0] }
        : m
    );
    onSave({
      ...project,
      teamMembers: updatedMembers
    });
  };

  const handleRejectMember = (memberId: string) => {
    const updatedMembers = currentMembers.map(m =>
      m.id === memberId ? { ...m, status: 'rejected' as const } : m
    );
    onSave({
      ...project,
      teamMembers: updatedMembers
    });
  };

  const activeMembers = (members: TeamMember[]) => members.filter(m => m.status === 'active');
  const pendingMembers = (members: TeamMember[]) => members.filter(m => m.status === 'pending');
  const rejectedMembers = (members: TeamMember[]) => members.filter(m => m.status === 'rejected');

  const teams: TeamCard[] = [
    {
      id: 'rd',
      team: 'R&D Team',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50/70 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-900/30',
      members: currentMembers.filter(m => m.teamId === 'rd')
    },
    {
      id: 'ra',
      team: 'Regulatory Affairs (RA) Team',
      color: 'text-purple-700 dark:text-purple-400',
      bgColor: 'bg-purple-50/70 border-purple-200/50 dark:bg-purple-950/20 dark:border-purple-900/30',
      members: currentMembers.filter(m => m.teamId === 'ra')
    },
    {
      id: 'legal',
      team: 'Legal & IP Team',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-50/70 border-green-200/50 dark:bg-green-950/20 dark:border-green-900/30',
      members: currentMembers.filter(m => m.teamId === 'legal')
    }
  ];

  // Map existing emails to quick check duplicates
  const existingEmails = new Set(currentMembers.map(m => m.email));

  return (
    <div className="p-6 flex-1 overflow-y-auto no-scrollbar">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-night dark:text-white text-xl font-bold">Project Team Workspace</h2>
            <span className="text-xs bg-sky/10 text-sky px-2 py-0.5 rounded-full font-bold">Project Lead: {project.projectLead}</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Auto-populated from <b>{project.businessGroup}</b> specialists & <b>{project.region}</b> experts. Only the Project Lead can manage access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white dark:bg-card rounded-xl border border-pebble overflow-hidden flex flex-col shadow-xs">
            {/* Card Header */}
            <div className={`px-4 py-3 border-b border-pebble/40 ${team.bgColor}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-sm ${team.color}`} style={{ fontWeight: 700 }}>{team.team}</h3>
                <span className="text-xs text-gray-500 font-semibold">{activeMembers(team.members).length} Active</span>
              </div>
            </div>

            {/* Members List Container */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Active Members */}
              <div className="space-y-3 flex-1 min-h-[120px]">
                {activeMembers(team.members).length === 0 ? (
                  <div className="text-xs text-gray-400 py-6 text-center border border-dashed border-pebble rounded-lg">No active R&D specialists assigned.</div>
                ) : (
                  activeMembers(team.members).map(member => (
                    <div key={member.id} className="flex items-center gap-3 p-1.5 hover:bg-earth/20 dark:hover:bg-earth/5 rounded-lg transition-colors group">
                      <AvatarCircle initials={member.avatar} status={member.status} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-night dark:text-white font-semibold truncate leading-tight">{member.name}</div>
                        <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.role}</div>
                      </div>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <StatusChip status={member.status} />
                        {member.name !== project.projectLead && member.role !== 'Project Creator' && member.role !== 'Project Lead' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                            title="Remove from team"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pending Invitations */}
              {pendingMembers(team.members).length > 0 && (
                <div className="mt-4 pt-4 border-t border-pebble/60">
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Pending Invitations</div>
                  <div className="space-y-2.5">
                    {pendingMembers(team.members).map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-1.5 hover:bg-earth/20 dark:hover:bg-earth/5 rounded-lg transition-colors group">
                        <AvatarCircle initials={member.avatar} status={member.status} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-night dark:text-white font-semibold truncate leading-tight">{member.name}</div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.role}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusChip status={member.status} />
                          {/* Project Lead Approval Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-1 bg-white dark:bg-card border border-pebble p-0.5 rounded-lg shadow-sm">
                            <button
                              onClick={() => handleApproveMember(member.id)}
                              className="p-1 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 rounded-md transition-colors"
                              title="Approve Invitation"
                            >
                              <Check className="w-3.5 h-3.5 font-bold" />
                            </button>
                            <button
                              onClick={() => handleRejectMember(member.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-md transition-colors"
                              title="Decline Invitation"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Invitations */}
              {rejectedMembers(team.members).length > 0 && (
                <div className="mt-4 pt-4 border-t border-pebble/60">
                  <div className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">Declined / Inactive</div>
                  <div className="space-y-2.5">
                    {rejectedMembers(team.members).map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-1.5 hover:bg-earth/20 dark:hover:bg-earth/5 rounded-lg transition-colors group">
                        <AvatarCircle initials={member.avatar} status={member.status} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-night dark:text-white font-semibold truncate leading-tight">{member.name}</div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">{member.role}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusChip status={member.status} />
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleApproveMember(member.id)}
                              className="p-1 hover:bg-green-50 dark:hover:bg-green-950/20 text-green-600 rounded-md transition-colors"
                              title="Re-invite / Activate"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                              title="Remove Record"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Member Button */}
              <button
                onClick={() => setAddMemberModal({ teamId: team.id, teamName: team.team })}
                className="mt-5 w-full flex items-center justify-center gap-2 px-3 py-2 border border-dashed border-[#0052A3] text-[#0052A3] dark:text-sky rounded-lg text-sm hover:bg-[#0052A3]/5 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Team Member
              </button>
            </div>
          </div>
        ))}
      </div>

      {addMemberModal && (
        <AddMemberModal
          teamName={addMemberModal.teamName}
          teamId={addMemberModal.teamId}
          onClose={() => setAddMemberModal(null)}
          onAdd={handleAddMember}
          existingEmails={existingEmails}
        />
      )}
    </div>
  );
}