import { useState, useRef, useEffect } from 'react';
import { X, Send, AtSign, CheckSquare, Square, Plus, Calendar, ChevronDown, Check, Bell } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar: string;
  timestamp: string;
  content: string;
  mentions?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Done';
}

const mockComments: Comment[] = [
  {
    id: 'c1', author: 'Sarah Johnson', avatar: 'SJ', timestamp: '2026-04-25 09:15',
    content: 'Clinical study results are in. All primary endpoints met. Ready to progress to RA review.',
    mentions: ['Michael Chen']
  },
  {
    id: 'c2', author: 'Michael Chen', avatar: 'MC', timestamp: '2026-04-25 10:30',
    content: '@Sarah Johnson Great news! I\'ll kick off the RA review today. Need the full study report uploaded to Linked Assets.',
  },
  {
    id: 'c3', author: 'Dr. Priya Sharma', avatar: 'PS', timestamp: '2026-04-25 11:00',
    content: 'Study report uploaded – AST-2026-0041. All data tables included. Please review the TEWL measurement appendix.',
  },
  {
    id: 'c4', author: 'Emma Williams', avatar: 'EW', timestamp: '2026-04-25 14:20',
    content: 'Initial RA review complete for EU markets. Some concerns about the #1 dermatologist claim for Germany. BfR has stricter interpretations. @Robert Taylor can Legal advise?',
    mentions: ['Robert Taylor']
  },
  {
    id: 'c5', author: 'Robert Taylor', avatar: 'RT', timestamp: '2026-04-25 16:05',
    content: '@Emma Williams I\'ll review the BfR guidelines tonight. May need to add a qualifier for DE market. Will share a memo tomorrow.',
    mentions: ['Emma Williams']
  }
];

const mockTasks: Task[] = [
  { id: 't1', title: 'Upload remaining clinical data files', description: 'Upload appendices B and C from the clinical study to Linked Assets', assignee: 'Dr. Priya Sharma', dueDate: '2026-04-30', status: 'In Progress' },
  { id: 't2', title: 'RA sign-off on global claims 1 & 2', description: 'Final regulatory sign-off required before market deployment', assignee: 'Emma Williams', dueDate: '2026-05-10', status: 'Open' },
  { id: 't3', title: 'Legal review of DE market qualifier', description: 'Review BfR guidelines and draft qualifier language for Germany', assignee: 'Robert Taylor', dueDate: '2026-04-28', status: 'In Progress' },
  { id: 't4', title: 'Consumer study methodology documented', description: 'Document the home use test methodology for claims substantiation file', assignee: 'Michael Chen', dueDate: '2026-04-22', status: 'Done' },
  { id: 't5', title: 'FTC pre-clearance for US claim #5', description: 'Submit claim language to FTC for informal review before deployment', assignee: 'Robert Taylor', dueDate: '2026-05-15', status: 'Open' },
];

const STATUS_STYLES: Record<Task['status'], string> = {
  'Open': 'bg-gray-100 text-gray-600',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Done': 'bg-green-100 text-green-700'
};

interface CollaborationDrawerProps {
  onClose: () => void;
  projectName: string;
}

const TEAM_MEMBERS = [
  { id: 'u1', name: 'Sarah Johnson', avatar: 'SJ', role: 'Project Creator' },
  { id: 'u2', name: 'Michael Chen', avatar: 'MC', role: 'Claims Lead' },
  { id: 'u3', name: 'Emma Williams', avatar: 'EW', role: 'RA Manager' },
  { id: 'u4', name: 'Robert Taylor', avatar: 'RT', role: 'Legal Counsel' },
  { id: 'u5', name: 'Dr. Priya Sharma', avatar: 'PS', role: 'R&D Scientist' },
  { id: 'u6', name: 'Lisa Park', avatar: 'LP', role: 'Regulatory Specialist' },
];

export default function CollaborationDrawer({ onClose, projectName }: CollaborationDrawerProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'tasks'>('comments');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignee: '', dueDate: '' });

  // @mention autocomplete state (US-M1-112)
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewComment(val);

    // Detect @mention trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setMentionPosition(cursorPos - mentionMatch[0].length);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
      setMentionQuery('');
    }
  };

  const handleMentionSelect = (member: typeof TEAM_MEMBERS[0]) => {
    const before = newComment.slice(0, mentionPosition);
    const after = newComment.slice(mentionPosition + mentionQuery.length + 1); // +1 for @
    const newVal = `${before}@${member.name} ${after}`;
    setNewComment(newVal);
    setShowMentionSuggestions(false);
    textareaRef.current?.focus();
  };

  const mentionSuggestions = TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const highlightMentions = (text: string) => {
    const parts = text.split(/(@\w[\w\s]*?)(?=\s|$)/g);
    return parts.map((part, i) =>
      part.startsWith('@')
        ? <span key={i} className="text-sky font-medium">{part}</span>
        : <span key={i}>{part}</span>
    );
  };

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      author: 'Sarah Johnson',
      avatar: 'SJ',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content: newComment
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    const task: Task = {
      id: `t${Date.now()}`,
      ...newTask,
      status: 'Open'
    };
    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', description: '', assignee: '', dueDate: '' });
    setShowNewTask(false);
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Task['status'] = t.status === 'Done' ? 'Open' : t.status === 'Open' ? 'In Progress' : 'Done';
      return { ...t, status: next };
    }));
  };

  return (
    <div className="w-80 border-l border-pebble bg-white flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-pebble flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-sm text-night" style={{ fontWeight: 600 }}>Collaboration</div>
          <div className="text-xs text-gray-400 truncate max-w-[180px]">{projectName}</div>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-earth rounded-lg transition-colors">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pebble flex-shrink-0">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-2.5 text-sm transition-colors ${activeTab === 'comments' ? 'text-sky border-b-2 border-sky' : 'text-gray-500 hover:text-night'}`}
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-2.5 text-sm transition-colors ${activeTab === 'tasks' ? 'text-sky border-b-2 border-sky' : 'text-gray-500 hover:text-night'}`}
        >
          Tasks ({tasks.filter(t => t.status !== 'Done').length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'comments' && (
          <div className="p-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-sky text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {comment.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-night" style={{ fontWeight: 500 }}>{comment.author}</span>
                      <span className="text-xs text-gray-400">{comment.timestamp}</span>
                    </div>
                    {/* Bell Icon with Send Notification hover */}
                    <div className="relative group/bell flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-gray-400 hover:text-sky cursor-pointer transition-colors" />
                      <div className="absolute right-0 bottom-full mb-1 bg-night text-white text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover/bell:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        Send notification
                      </div>
                    </div>
                  </div>
                  <div className="bg-earth rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-700 leading-relaxed">
                    {comment.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-4 space-y-3">
            {showNewTask && (
              <div className="bg-earth rounded-xl p-3 border border-pebble space-y-2">
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                  placeholder="Task title..."
                  className="w-full px-2 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky"
                />
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                  placeholder="Description (optional)..."
                  rows={2}
                  className="w-full px-2 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky resize-none"
                />
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))}
                  placeholder="Assignee..."
                  className="w-full px-2 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full px-2 py-1.5 text-xs border border-pebble rounded-lg focus:outline-none focus:ring-1 focus:ring-sky"
                />
                <div className="flex gap-2">
                  <button onClick={() => setShowNewTask(false)} className="flex-1 py-1.5 border border-pebble text-gray-600 rounded-lg text-xs hover:bg-white">Cancel</button>
                  <button onClick={handleAddTask} className="flex-1 py-1.5 bg-sky text-white rounded-lg text-xs hover:bg-dark">Add Task</button>
                </div>
              </div>
            )}

            {tasks.map(task => (
              <div key={task.id} className="bg-white border border-pebble rounded-xl p-3 hover:border-sky transition-colors">
                <div className="flex items-start gap-2">
                  <button onClick={() => toggleTaskStatus(task.id)} className="mt-0.5 flex-shrink-0">
                    {task.status === 'Done'
                      ? <CheckSquare className="w-4 h-4 text-green-500" />
                      : <Square className="w-4 h-4 text-gray-300" />
                    }
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs text-night mb-0.5 ${task.status === 'Done' ? 'line-through text-gray-400' : ''}`} style={{ fontWeight: 500 }}>
                      {task.title}
                    </div>
                    {task.description && (
                      <div className="text-xs text-gray-500 mb-2 leading-relaxed">{task.description}</div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${STATUS_STYLES[task.status]}`}>{task.status}</span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {task.dueDate}
                        </div>
                      )}
                    </div>
                    {task.assignee && (
                      <div className="mt-1.5 flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full bg-mid text-white flex items-center justify-center text-xs">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-gray-500">{task.assignee}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-pebble flex-shrink-0">
        {activeTab === 'comments' && (
          <div className="p-3">
            <div className="bg-earth rounded-xl border border-pebble focus-within:border-sky transition-colors relative">
              <textarea
                value={newComment}
                onChange={handleCommentChange}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSendComment(); if (e.key === 'Escape') setShowMentionSuggestions(false); }}
                placeholder="Write a comment... Use @name to mention"
                rows={3}
                className="w-full px-3 pt-3 pb-1 text-xs bg-transparent focus:outline-none resize-none text-night"
                ref={textareaRef}
              />
              <div className="px-3 pb-2 flex items-center justify-between">
                <button
                  onClick={() => { setNewComment(prev => prev + '@'); textareaRef.current?.focus(); }}
                  className="p-1 hover:bg-pebble rounded text-gray-400 hover:text-sky transition-colors"
                  title="Mention someone">
                  <AtSign className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleSendComment} disabled={!newComment.trim()}
                  className="flex items-center gap-1.5 px-3 py-1 bg-sky text-white rounded-lg text-xs hover:bg-dark disabled:opacity-40 disabled:cursor-not-allowed">
                  <Send className="w-3 h-3" /> Send
                </button>
              </div>

              {/* @mention autocomplete suggestions (US-M1-112) */}
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-pebble rounded-xl shadow-xl overflow-hidden z-30">
                  <div className="px-3 py-2 border-b border-pebble text-xs text-gray-400 flex items-center gap-1.5">
                    <AtSign className="w-3 h-3" />
                    Mention a team member
                    <button onClick={() => setShowMentionSuggestions(false)} className="ml-auto hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {mentionSuggestions.map(member => (
                    <button
                      key={member.id}
                      onClick={() => handleMentionSelect(member)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-earth transition-colors text-left"
                    >
                      <div className="w-6 h-6 rounded-full bg-sky text-white flex items-center justify-center text-xs flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div>
                        <div className="text-xs text-night" style={{ fontWeight: 500 }}>{member.name}</div>
                        <div className="text-xs text-gray-400">{member.role}</div>
                      </div>
                      {mentionQuery && member.name.toLowerCase().includes(mentionQuery.toLowerCase()) && (
                        <Check className="w-3 h-3 text-sky ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">⌘ + Enter to send · @ to mention</p>
          </div>
        )}

        {activeTab === 'tasks' && !showNewTask && (
          <div className="p-3">
            <button
              onClick={() => setShowNewTask(true)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-sky text-sky rounded-xl text-xs hover:bg-pale transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}