'use client';

import { useState, useEffect, useTransition, useRef, useCallback, type DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createOrgTask, createOrgProject, updateTaskStatus, deleteOrgTask, addOrgProjectMember, removeOrgProjectMember, updateTask, addTaskComment, getTaskComments, getTaskActivity, addTaskAttachment, getTaskAttachments, deleteTaskAttachment, updateTaskComment } from './kanban-actions';
import { ToastProvider, useToast } from '../../toast';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  project_id: string;
  created_at: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: string;
};

type Member = {
  user_id: string;
  email: string;
  role: string;
};

type ProjectMembership = {
  project_id: string;
  user_id: string;
  role: string;
  email: string;
};

type SelectOption = { value: string; label: string };

function PentarchSelect({ value, onChange, options, className = '', style, placeholder }: {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`} style={style}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left cursor-pointer transition-all duration-150"
        style={{
          background: 'var(--surface-input, var(--surface-muted))',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: open ? 'var(--accent-solid)' : 'var(--border-default)',
          color: selected ? 'var(--text-primary)' : 'var(--text-subtle)',
          boxShadow: open ? '0 0 0 2px color-mix(in srgb, var(--accent-solid) 20%, transparent)' : 'none',
        }}
      >
        <span className="truncate text-[13px]">{selected?.label ?? placeholder ?? 'Select...'}</span>
        <svg className="w-3 h-3 shrink-0 transition-transform duration-150" style={{ color: 'var(--text-subtle)', transform: open ? 'rotate(180deg)' : '' }} fill="none" viewBox="0 0 12 8">
          <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-lg py-1 shadow-xl overflow-auto"
          style={{
            background: 'var(--surface-card)',
            border: '1px solid var(--border-default)',
            maxHeight: '200px',
          }}
        >
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[13px] cursor-pointer transition-colors duration-100"
              style={{
                color: o.value === value ? 'var(--accent-text, var(--accent-solid))' : 'var(--text-primary)',
                background: o.value === value ? 'var(--surface-muted)' : 'transparent',
              }}
              onMouseEnter={e => { if (o.value !== value) e.currentTarget.style.background = 'var(--surface-hover, var(--surface-muted))'; }}
              onMouseLeave={e => { e.currentTarget.style.background = o.value === value ? 'var(--surface-muted)' : 'transparent'; }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const COLUMNS = [
  { key: 'todo', label: 'To Do', icon: '○' },
  { key: 'in_progress', label: 'In Progress', icon: '◐' },
  { key: 'review', label: 'Review', icon: '◑' },
  { key: 'done', label: 'Done', icon: '●' },
] as const;

const PRIORITY_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  low: { bg: 'var(--surface-muted)', color: 'var(--text-muted)', dot: 'var(--text-subtle)' },
  medium: { bg: 'var(--surface-muted)', color: 'var(--text-muted)', dot: 'var(--accent-solid)' },
  high: { bg: 'rgba(251,191,36,0.12)', color: 'rgb(251,191,36)', dot: 'rgb(251,191,36)' },
  urgent: { bg: 'var(--danger-tint)', color: 'var(--danger-text)', dot: 'var(--danger-solid)' },
};

export default function KanbanBoard(props: {
  orgId: string;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  projectMemberships: ProjectMembership[];
}) {
  return (
    <ToastProvider>
      <KanbanBoardInner {...props} />
    </ToastProvider>
  );
}

function KanbanBoardInner({
  orgId,
  tasks: initialTasks,
  projects,
  members,
  projectMemberships,
}: {
  orgId: string;
  tasks: Task[];
  projects: Project[];
  members: Member[];
  projectMemberships: ProjectMembership[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const [tasks, setTasks] = useState(initialTasks);
  useEffect(() => { setTasks(initialTasks); }, [initialTasks]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>(projects[0]?.id ?? '');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [expandedTask, setExpandedTask] = useState<Task | null>(null);
  const [error, setError] = useState('');

  const filteredTasks = selectedProject
    ? tasks.filter(t => t.project_id === selectedProject)
    : tasks;

  const handleDragStart = (e: DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, col: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(col);
  };

  const handleDrop = (e: DragEvent, newStatus: string) => {
    e.preventDefault();
    setDropTarget(null);
    if (!draggedId) return;

    const task = tasks.find(t => t.id === draggedId);
    if (!task || task.status === newStatus) { setDraggedId(null); return; }

    setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status: newStatus } : t));
    setDraggedId(null);

    startTransition(async () => {
      const res = await updateTaskStatus(draggedId, newStatus, orgId);
      if (res.error) {
        setTasks(prev => prev.map(t => t.id === draggedId ? { ...t, status: task.status } : t));
        toast(res.error, 'error');
      } else {
        const label = COLUMNS.find(c => c.key === newStatus)?.label || newStatus;
        toast(`Task moved to ${label}`);
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    startTransition(async () => {
      const res = await deleteOrgTask(taskId, orgId);
      if (res.error) toast(res.error, 'error');
      else { toast('Task deleted'); router.refresh(); }
    });
  };

  const currentProjectMembers = projectMemberships.filter(pm => pm.project_id === selectedProject);
  const currentProject = projects.find(p => p.id === selectedProject);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
          </svg>
          <h2 className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Projects & Tasks</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Project selector */}
          {projects.length > 0 && (
            <PentarchSelect
              value={selectedProject}
              onChange={setSelectedProject}
              options={projects.map(p => ({ value: p.id, label: p.name }))}
              className="min-w-[140px]"
              style={{ fontSize: '12px' }}
            />
          )}

          <button
            onClick={() => setShowMembers(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 hover:brightness-110"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Members
          </button>

          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold cursor-pointer transition-all duration-150 hover:brightness-110 hover:shadow-md"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Task
          </button>

          <button
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 hover:brightness-110"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-default)', color: 'var(--text-muted)' }}
          >
            + Project
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-5 mt-3 px-3 py-2 rounded-md text-[12px]" style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)' }}>
          {error}
          <button onClick={() => setError('')} className="ml-2 font-semibold">×</button>
        </div>
      )}

      {/* Kanban Columns */}
      {projects.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>No projects yet</p>
          <p className="text-[12px] mb-4" style={{ color: 'var(--text-subtle)' }}>Create a project to start adding tasks</p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 rounded-md text-[12px] font-semibold"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0" style={{ minHeight: '320px' }}>
          {COLUMNS.map((col, ci) => {
            const colTasks = filteredTasks.filter(t => t.status === col.key);
            const isOver = dropTarget === col.key;

            return (
              <div
                key={col.key}
                className="flex flex-col"
                style={{ borderRight: ci < 3 ? '1px solid var(--border-default)' : 'none' }}
                onDragOver={e => handleDragOver(e, col.key)}
                onDragLeave={() => setDropTarget(null)}
                onDrop={e => handleDrop(e, col.key)}
              >
                {/* Column header */}
                <div
                  className="flex items-center justify-between px-4 py-2.5"
                  style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border-default)' }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>{col.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-subtle)' }}>{col.label}</span>
                  </div>
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
                    style={{ background: 'var(--surface-card)', color: 'var(--text-subtle)' }}
                  >
                    {colTasks.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  className="flex-1 p-2.5 space-y-2 transition-colors duration-150"
                  style={{
                    background: isOver ? 'rgba(99,149,255,0.06)' : 'transparent',
                    minHeight: '200px',
                  }}
                >
                  {colTasks.map(task => {
                    const pri = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
                    const assignee = members.find(m => m.user_id === task.assigned_to);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onDragEnd={() => { setDraggedId(null); setDropTarget(null); }}
                        onClick={() => setExpandedTask(task)}
                        className="rounded-lg p-3.5 cursor-pointer active:cursor-grabbing transition-all duration-200 group hover:-translate-y-0.5"
                        style={{
                          background: 'var(--surface-card)',
                          border: '1px solid var(--border-default)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
                          opacity: draggedId === task.id ? 0.4 : 1,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-solid)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-default)';
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-[13px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                            {task.title}
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            className="opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer transition-opacity duration-150 p-0.5 rounded hover:bg-[var(--danger-tint)]"
                            style={{ color: 'var(--text-subtle)' }}
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-[11px] mb-2.5 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: pri.bg, color: pri.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: pri.dot }} />
                            {task.priority}
                          </span>

                          {assignee && (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                              style={{ background: 'var(--accent-tint)', color: 'var(--accent-solid)' }}
                              title={assignee.email}
                            >
                              {assignee.email[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {colTasks.length === 0 && !isOver && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <TaskModal
          orgId={orgId}
          projects={projects}
          selectedProject={selectedProject}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => {
            setShowCreateTask(false);
            toast('Task created');
            router.refresh();
          }}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <ProjectModal
          orgId={orgId}
          onClose={() => setShowCreateProject(false)}
          onCreated={(id) => {
            setShowCreateProject(false);
            setSelectedProject(id);
            toast('Project created');
            router.refresh();
          }}
        />
      )}

      {/* Task Detail Modal */}
      {expandedTask && (
        <TaskDetailModal
          task={expandedTask}
          orgId={orgId}
          members={members}
          projects={projects}
          onClose={() => setExpandedTask(null)}
          onDeleted={() => {
            setExpandedTask(null);
            handleDeleteTask(expandedTask.id);
          }}
          onStatusChanged={(status) => {
            startTransition(async () => {
              const res = await updateTaskStatus(expandedTask.id, status, orgId);
              if (!res.error) {
                setTasks(prev => prev.map(t => t.id === expandedTask.id ? { ...t, status } : t));
                setExpandedTask(prev => prev ? { ...prev, status } : null);
                const label = COLUMNS.find(c => c.key === status)?.label || status;
                toast(`Status changed to ${label}`);
              } else {
                toast(res.error, 'error');
              }
            });
          }}
        />
      )}

      {/* Members Modal */}
      {showMembers && currentProject && (
        <MembersModal
          orgId={orgId}
          project={currentProject}
          projectMembers={currentProjectMembers}
          orgMembers={members}
          onClose={() => setShowMembers(false)}
          onChanged={() => router.refresh()}
        />
      )}
    </div>
  );
}

/* ---------- Task Creation Modal ---------- */
function TaskModal({
  orgId, projects, selectedProject, members, onClose, onCreated,
}: {
  orgId: string;
  projects: Project[];
  selectedProject: string;
  members: Member[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [projectId, setProjectId] = useState(selectedProject);
  const [assignedTo, setAssignedTo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const res = await createOrgTask({
      title,
      projectId,
      orgId,
      description: description || undefined,
      priority,
      assignedTo: assignedTo || undefined,
    });
    setSubmitting(false);
    if (res.error) setError(res.error);
    else onCreated();
  };

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-lg overflow-hidden mx-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>New Task</h3>
          <button onClick={onClose} className="cursor-pointer p-1 rounded-md transition-colors duration-150 hover:bg-[var(--surface-muted)]" style={{ color: 'var(--text-subtle)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          {error && (
            <div className="px-3 py-2 rounded-md text-[12px]" style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)' }}>{error}</div>
          )}

          <div>
            <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Task title" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
          </div>

          <div>
            <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional description" className="w-full rounded-md px-3 py-2 text-[13px] outline-none resize-none" style={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Project *</label>
              <PentarchSelect value={projectId} onChange={setProjectId} options={projects.map(p => ({ value: p.id, label: p.name }))} />
            </div>
            <div>
              <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Priority</label>
              <PentarchSelect value={priority} onChange={setPriority} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} />
            </div>
          </div>

          <div>
            <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Assign To</label>
            <PentarchSelect value={assignedTo} onChange={setAssignedTo} options={[{ value: '', label: 'Unassigned' }, ...members.map(m => ({ value: m.user_id, label: m.email }))]} />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
            className="w-full rounded-md py-2.5 text-[13px] font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 hover:brightness-110 hover:shadow-md disabled:cursor-not-allowed"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Project Creation Modal ---------- */
function ProjectModal({
  orgId, onClose, onCreated,
}: {
  orgId: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    const res = await createOrgProject(orgId, name, description);
    setSubmitting(false);
    if (res.error) setError(res.error);
    else if (res.projectId) onCreated(res.projectId);
  };

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-sm rounded-lg overflow-hidden mx-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>New Project</h3>
          <button onClick={onClose} className="cursor-pointer p-1 rounded-md transition-colors duration-150 hover:bg-[var(--surface-muted)]" style={{ color: 'var(--text-subtle)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-3.5">
          {error && (
            <div className="px-3 py-2 rounded-md text-[12px]" style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)' }}>{error}</div>
          )}
          <div>
            <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="w-full rounded-md px-3 py-2 text-[13px] outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="data-sm block mb-1" style={{ color: 'var(--text-subtle)' }}>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Optional" className="w-full rounded-md px-3 py-2 text-[13px] outline-none resize-none" style={inputStyle} />
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting || !name.trim()}
            className="w-full rounded-md py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 hover:brightness-110 hover:shadow-md"
            style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Task Detail Panel (Slide-over) ---------- */
function TaskDetailModal({
  task, orgId, members, projects, onClose, onDeleted, onStatusChanged,
}: {
  task: Task;
  orgId: string;
  members: Member[];
  projects: Project[];
  onClose: () => void;
  onDeleted: () => void;
  onStatusChanged: (status: string) => void;
}) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments' | 'activity'>('details');
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [editingDesc, setEditingDesc] = useState(false);
  const [priority, setPriority] = useState(task.priority);
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || '');
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [uploadingCommentImage, setUploadingCommentImage] = useState(false);
  const commentImageRef = useRef<HTMLInputElement>(null);

  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activity, setActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const project = projects.find(p => p.id === task.project_id);
  const assignee = members.find(m => m.user_id === task.assigned_to);
  const pri = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const statusLabel = COLUMNS.find(c => c.key === task.status);

  const loadComments = async () => {
    setLoadingComments(true);
    const res = await getTaskComments(task.id);
    setComments(res.comments || []);
    setLoadingComments(false);
  };

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    const res = await getTaskAttachments(task.id);
    setAttachments(res.attachments || []);
    setLoadingAttachments(false);
  };

  const loadActivity = async () => {
    setLoadingActivity(true);
    const res = await getTaskActivity(task.id);
    setActivity(res.activity || []);
    setLoadingActivity(false);
  };

  useEffect(() => {
    if (activeTab === 'comments') loadComments();
    if (activeTab === 'attachments') loadAttachments();
    if (activeTab === 'activity') loadActivity();
  }, [activeTab]);

  const handleSaveField = async (field: string, value: any) => {
    setSaving(true);
    const res = await updateTask(task.id, orgId, { [field]: value });
    setSaving(false);
    if (res.error) toast(res.error, 'error');
    else toast('Task updated');
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPostingComment(true);
    const res = await addTaskComment(task.id, orgId, newComment);
    if (!res.error) {
      setNewComment('');
      loadComments();
      toast('Comment added');
    } else {
      toast(res.error, 'error');
    }
    setPostingComment(false);
  };

  const handleEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) return;
    const res = await updateTaskComment(commentId, orgId, editingCommentText);
    setEditingCommentId(null);
    setEditingCommentText('');
    loadComments();
    if (res.error) toast(res.error, 'error');
    else toast('Comment updated');
  };

  const handleCommentImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploadingCommentImage(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const filePath = `${task.id}/comments/${Date.now()}_${file.name}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/task-attachments/${filePath}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': file.type },
      body: file,
    });

    if (uploadRes.ok) {
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/task-attachments/${filePath}`;
      const commentContent = `![${file.name}](${imageUrl})`;
      await addTaskComment(task.id, orgId, commentContent);
      loadComments();
      toast('Image shared in comments');
    } else {
      toast('Image upload failed', 'error');
    }
    setUploadingCommentImage(false);
    if (commentImageRef.current) commentImageRef.current.value = '';
  };

  const renderCommentContent = (content: string) => {
    const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = imgRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{content.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <a key={key++} href={match[2]} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img src={match[2]} alt={match[1]} className="rounded-md max-w-full max-h-48 object-cover" style={{ border: '1px solid var(--border-default)' }} />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < content.length) {
      parts.push(<span key={key++}>{content.slice(lastIndex)}</span>);
    }
    return parts.length > 0 ? parts : content;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const filePath = `${task.id}/${Date.now()}_${file.name}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/task-attachments/${filePath}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${anonKey}`, 'Content-Type': file.type },
      body: file,
    });

    if (uploadRes.ok) {
      const fileUrl = `${supabaseUrl}/storage/v1/object/public/task-attachments/${filePath}`;
      await addTaskAttachment(task.id, orgId, file.name, fileUrl, file.size, file.type);
      loadAttachments();
      toast('File uploaded');
    } else {
      toast('File upload failed', 'error');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteAttachment = async (id: string) => {
    const res = await deleteTaskAttachment(id, orgId);
    loadAttachments();
    if (res.error) toast(res.error, 'error');
    else toast('File removed');
  };

  const getMemberEmail = (userId: string) => members.find(m => m.user_id === userId)?.email || 'Unknown';

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  const TABS = [
    { key: 'details' as const, label: 'Details', icon: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z' },
    { key: 'comments' as const, label: 'Comments', icon: 'M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z' },
    { key: 'attachments' as const, label: 'Files', icon: 'M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13' },
    { key: 'activity' as const, label: 'Activity', icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const inputStyle = { background: 'var(--surface-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div
        className="w-full max-w-2xl h-full flex flex-col"
        style={{ background: 'var(--surface-card)', borderLeft: '1px solid var(--border-default)', boxShadow: '-8px 0 30px rgba(0,0,0,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-3 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0" style={{ background: pri.bg, color: pri.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: pri.dot }} />
              {task.priority}
            </span>
            <span className="text-[11px] font-medium shrink-0" style={{ color: 'var(--text-subtle)' }}>{statusLabel?.icon} {statusLabel?.label}</span>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1.5 rounded-md transition-colors duration-150 hover:bg-[var(--surface-muted)]" style={{ color: 'var(--text-subtle)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title + Description */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={() => { setEditingTitle(false); if (title !== task.title) handleSaveField('title', title); }}
              onKeyDown={e => { if (e.key === 'Enter') { setEditingTitle(false); if (title !== task.title) handleSaveField('title', title); } }}
              className="w-full text-[18px] font-bold outline-none rounded-md px-2 py-1 -ml-2"
              style={{ ...inputStyle, background: 'var(--surface-muted)' }}
            />
          ) : (
            <h3
              onClick={() => setEditingTitle(true)}
              className="text-[18px] font-bold cursor-text rounded-md px-2 py-1 -ml-2 transition-colors duration-150 hover:bg-[var(--surface-muted)]"
              style={{ color: 'var(--text-primary)' }}
            >
              {task.title}
            </h3>
          )}

          {editingDesc ? (
            <textarea
              autoFocus
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={() => { setEditingDesc(false); if (description !== (task.description || '')) handleSaveField('description', description); }}
              rows={3}
              className="w-full text-[13px] outline-none rounded-md px-2 py-1.5 -ml-2 mt-1 resize-none"
              style={{ ...inputStyle, background: 'var(--surface-muted)' }}
              placeholder="Add a description..."
            />
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              className="text-[13px] leading-relaxed mt-1 cursor-text rounded-md px-2 py-1.5 -ml-2 transition-colors duration-150 hover:bg-[var(--surface-muted)]"
              style={{ color: task.description ? 'var(--text-muted)' : 'var(--text-subtle)' }}
            >
              {task.description || 'Add a description...'}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium cursor-pointer transition-colors duration-150 relative"
              style={{ color: activeTab === tab.key ? 'var(--accent-solid)' : 'var(--text-subtle)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
              </svg>
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: 'var(--accent-solid)' }} />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'details' && (
            <div className="p-6 space-y-4">
              {/* Status */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>Status</p>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map(col => (
                    <button
                      key={col.key}
                      onClick={() => { if (col.key !== task.status) onStatusChanged(col.key); }}
                      className="px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 hover:-translate-y-px hover:shadow-sm"
                      style={{
                        background: col.key === task.status ? 'var(--accent-tint)' : 'var(--surface-muted)',
                        border: `1px solid ${col.key === task.status ? 'var(--accent-solid)' : 'var(--border-default)'}`,
                        color: col.key === task.status ? 'var(--accent-solid)' : 'var(--text-muted)',
                      }}
                    >
                      {col.icon} {col.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>Priority</p>
                <PentarchSelect value={priority} onChange={v => { setPriority(v); handleSaveField('priority', v); }} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} />
              </div>

              {/* Project */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>Project</p>
                <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{project?.name ?? '—'}</span>
              </div>

              {/* Assigned To */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>Assigned To</p>
                <PentarchSelect value={assignedTo} onChange={v => { setAssignedTo(v); handleSaveField('assigned_to', v || null); }} options={[{ value: '', label: 'Unassigned' }, ...members.map(m => ({ value: m.user_id, label: m.email }))]} />
              </div>

              {/* Meta */}
              <div className="pt-3 space-y-1.5" style={{ borderTop: '1px solid var(--border-default)' }}>
                <p className="text-[11px]" style={{ color: 'var(--text-subtle)' }}>Created {new Date(task.created_at).toLocaleDateString()}</p>
              </div>

              {/* Delete */}
              <div className="pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
                <button
                  onClick={onDeleted}
                  className="px-3 py-1.5 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150 hover:brightness-110"
                  style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)' }}
                >
                  Delete Task
                </button>
              </div>
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="p-6 flex flex-col gap-4">
              {loadingComments ? (
                <p className="text-[12px] text-center py-8" style={{ color: 'var(--text-subtle)' }}>Loading comments...</p>
              ) : comments.length === 0 ? (
                <p className="text-[12px] text-center py-8" style={{ color: 'var(--text-subtle)' }}>No comments yet</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((c: any) => (
                    <div key={c.id} className="group rounded-lg p-3" style={{ background: 'var(--surface-muted)' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: 'var(--accent-tint)', color: 'var(--accent-solid)' }}>
                          {getMemberEmail(c.user_id)[0]?.toUpperCase()}
                        </div>
                        <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{getMemberEmail(c.user_id)}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>{formatTime(c.created_at)}</span>
                        {c.updated_at && c.updated_at !== c.created_at && (
                          <span className="text-[9px] italic" style={{ color: 'var(--text-subtle)' }}>(edited)</span>
                        )}
                        <button
                          onClick={() => { setEditingCommentId(c.id); setEditingCommentText(c.content); }}
                          className="ml-auto text-[10px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--text-subtle)' }}
                          title="Edit comment"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                          </svg>
                        </button>
                      </div>
                      {editingCommentId === c.id ? (
                        <div className="pl-7 space-y-2">
                          <textarea
                            value={editingCommentText}
                            onChange={e => setEditingCommentText(e.target.value)}
                            className="w-full rounded-md px-3 py-2 text-[13px] outline-none resize-none"
                            style={inputStyle}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditComment(c.id)}
                              className="px-3 py-1 rounded-md text-[11px] font-semibold cursor-pointer transition-all duration-150 hover:brightness-110"
                              style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingCommentId(null); setEditingCommentText(''); }}
                              className="px-3 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-all duration-150"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[13px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>{renderCommentContent(c.content)}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-auto pt-2 items-center" style={{ borderTop: '1px solid var(--border-default)' }}>
                <input ref={commentImageRef} type="file" accept="image/*" className="hidden" onChange={handleCommentImageUpload} />
                <button
                  onClick={() => commentImageRef.current?.click()}
                  disabled={uploadingCommentImage}
                  className="p-2 rounded-md cursor-pointer transition-all duration-150 hover:brightness-110 shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  title="Upload image"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                </button>
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
                  placeholder={uploadingCommentImage ? 'Uploading image...' : 'Write a comment...'}
                  className="flex-1 rounded-md px-3 py-2 text-[13px] outline-none"
                  style={inputStyle}
                  disabled={uploadingCommentImage}
                />
                <button
                  onClick={handlePostComment}
                  disabled={postingComment || !newComment.trim()}
                  className="px-3 py-2 rounded-md text-[12px] font-semibold cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110"
                  style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}
                >
                  {postingComment ? '...' : 'Send'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="p-6 space-y-4">
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full py-6 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150 hover:brightness-105 flex flex-col items-center gap-2"
                style={{ border: '2px dashed var(--border-default)', color: 'var(--text-muted)', background: 'var(--surface-muted)' }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                {uploading ? 'Uploading...' : 'Click to upload a file'}
              </button>

              {loadingAttachments ? (
                <p className="text-[12px] text-center py-4" style={{ color: 'var(--text-subtle)' }}>Loading...</p>
              ) : attachments.length === 0 ? (
                <p className="text-[12px] text-center py-4" style={{ color: 'var(--text-subtle)' }}>No attachments</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg p-3" style={{ background: 'var(--surface-muted)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-md flex items-center justify-center shrink-0" style={{ background: 'var(--accent-tint)' }}>
                          {a.mime_type?.startsWith('image/') ? (
                            <svg className="w-4 h-4" style={{ color: 'var(--accent-solid)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" style={{ color: 'var(--accent-solid)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-medium truncate block hover:underline" style={{ color: 'var(--text-primary)' }}>{a.file_name}</a>
                          <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>
                            {a.file_size ? `${(a.file_size / 1024).toFixed(1)} KB` : ''} · {formatTime(a.created_at)} · {getMemberEmail(a.uploaded_by)}
                          </p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteAttachment(a.id)} className="cursor-pointer p-1 rounded-md transition-colors duration-150 hover:bg-[var(--danger-tint)]" style={{ color: 'var(--text-subtle)' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-6">
              {loadingActivity ? (
                <p className="text-[12px] text-center py-8" style={{ color: 'var(--text-subtle)' }}>Loading activity...</p>
              ) : activity.length === 0 ? (
                <p className="text-[12px] text-center py-8" style={{ color: 'var(--text-subtle)' }}>No activity yet</p>
              ) : (
                <div className="space-y-0">
                  {activity.map((a: any, i: number) => (
                    <div key={a.id} className="flex gap-3 pb-4 relative">
                      {i < activity.length - 1 && (
                        <div className="absolute left-[9px] top-6 bottom-0 w-px" style={{ background: 'var(--border-default)' }} />
                      )}
                      <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--surface-muted)', border: '2px solid var(--border-default)' }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-subtle)' }} />
                      </div>
                      <div>
                        <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-medium">{getMemberEmail(a.user_id)}</span>{' '}
                          <span style={{ color: 'var(--text-muted)' }}>
                            {a.action === 'commented' && 'left a comment'}
                            {a.action === 'updated' && `updated ${(a.details as any)?.fields?.join(', ') || 'task'}`}
                            {a.action === 'attached_file' && `attached ${(a.details as any)?.file_name || 'a file'}`}
                            {!['commented', 'updated', 'attached_file'].includes(a.action) && a.action}
                          </span>
                        </p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{formatTime(a.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Members Modal ---------- */
function MembersModal({
  orgId, project, projectMembers, orgMembers, onClose, onChanged,
}: {
  orgId: string;
  project: Project;
  projectMembers: ProjectMembership[];
  orgMembers: Member[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [role, setRole] = useState('contributor');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const nonMembers = orgMembers.filter(m => !projectMembers.some(pm => pm.user_id === m.user_id));

  const handleAdd = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    const res = await addOrgProjectMember(project.id, selectedUser, role, orgId);
    setSubmitting(false);
    if (res.error) { setError(res.error); toast(res.error, 'error'); }
    else { setAdding(false); setSelectedUser(''); toast('Member added'); onChanged(); }
  };

  const handleRemove = async (userId: string) => {
    const res = await removeOrgProjectMember(project.id, userId, orgId);
    if (res.error) { setError(res.error); toast(res.error, 'error'); }
    else { toast('Member removed'); onChanged(); }
  };

  const inputStyle = {
    background: 'var(--surface-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-md rounded-lg overflow-hidden mx-4"
        style={{ background: 'var(--surface-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div>
            <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>Project Members</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{project.name}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-subtle)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5">
          {error && (
            <div className="px-3 py-2 rounded-md text-[12px] mb-3" style={{ background: 'var(--danger-tint)', color: 'var(--danger-text)' }}>{error}</div>
          )}

          {projectMembers.length === 0 ? (
            <p className="text-[12px] text-center py-4" style={{ color: 'var(--text-subtle)' }}>No members assigned to this project</p>
          ) : (
            <div className="space-y-2 mb-4">
              {projectMembers.map(pm => (
                <div key={pm.user_id} className="flex items-center justify-between px-3 py-2 rounded-md" style={{ background: 'var(--surface-muted)' }}>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                      {pm.email[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{pm.email}</p>
                      <p className="text-[10px] capitalize" style={{ color: 'var(--text-subtle)' }}>{pm.role}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(pm.user_id)} className="text-[11px] font-medium" style={{ color: 'var(--danger-text)' }}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {adding ? (
            <div className="space-y-2.5 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <PentarchSelect value={selectedUser} onChange={setSelectedUser} placeholder="Select member..." options={[{ value: '', label: 'Select member...' }, ...nonMembers.map(m => ({ value: m.user_id, label: m.email }))]} />
              <PentarchSelect value={role} onChange={setRole} options={[{ value: 'viewer', label: 'Viewer' }, { value: 'contributor', label: 'Contributor' }, { value: 'manager', label: 'Manager' }]} />
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={submitting || !selectedUser} className="flex-1 rounded-md py-2 text-[12px] font-semibold disabled:opacity-50" style={{ background: 'var(--accent-solid)', color: 'var(--text-on-accent)' }}>
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
                <button onClick={() => setAdding(false)} className="px-4 py-2 rounded-md text-[12px] font-medium" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>Cancel</button>
              </div>
            </div>
          ) : (
            nonMembers.length > 0 && (
              <button
                onClick={() => setAdding(true)}
                className="w-full py-2 rounded-md text-[12px] font-medium mt-2"
                style={{ border: '1px dashed var(--border-default)', color: 'var(--text-muted)' }}
              >
                + Add Member
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
