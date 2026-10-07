import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Layers,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Paperclip,
  DollarSign,
  ArrowLeftRight,
  Plus,
  Star,
  FolderOpen,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  User as UserIcon,
  CheckCheck,
} from 'lucide-react';
import { api } from '../services/api.js';
import { Project, Proposal, Message, ProjectTask, WorkSubmission } from '../types.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import PaymentModal from '../components/PaymentModal.js';
import ReviewModal from '../components/ReviewModal.js';
import ReportModal from '../components/ReportModal.js';

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [project, setProject] = useState<Project | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState<'tasks' | 'chat' | 'submissions' | 'files'>('tasks');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal submission form state (for freelancer viewing an open project)
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState('5000');
  const [deliveryDays, setDeliveryDays] = useState('7');
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);

  // Chat input
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Task creation form
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  // Work Submission form (Freelancer)
  const [submissionDesc, setSubmissionDesc] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('deliverable_archive_v1.zip');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Revision Form (Client)
  const [revisionComments, setRevisionComments] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);

  // Modals
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchWorkspace = async () => {
    if (!id) return;
    try {
      const [projRes, msgRes] = await Promise.all([
        api.projects.get(id),
        api.workspace.getMessages(id).catch(() => ({ messages: [] })),
      ]);
      setProject(projRes.project);
      setProposals(projRes.proposals || []);
      setMessages(msgRes.messages || []);
      if (!newTaskAssignee) {
        setNewTaskAssignee(projRes.project.freelancerId || projRes.project.clientId);
      }
      if (projRes.project.budget) {
        setProposedPrice(projRes.project.budget.toString());
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load project workspace.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    const interval = setInterval(async () => {
      if (id) {
        try {
          const msgRes = await api.workspace.getMessages(id);
          setMessages(msgRes.messages || []);
        } catch {}
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // Handle Proposal Submission
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setIsSubmittingProposal(true);
    try {
      await api.proposals.submit({
        projectId: project.id,
        coverLetter,
        proposedPrice: Number(proposedPrice),
        deliveryTimeDays: Number(deliveryDays),
        relevantSkills: project.requiredSkills,
      });
      await fetchWorkspace();
      setCoverLetter('');
      toast.success('Proposal submitted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Proposal failed');
    } finally {
      setIsSubmittingProposal(false);
    }
  };

  // Handle Client Accepting Proposal
  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await api.proposals.accept(proposalId);
      toast.success('Proposal accepted! Freelancer assigned to project.');
      await fetchWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept proposal');
    }
  };

  // Handle Client Rejecting Proposal
  const handleRejectProposal = async (proposalId: string) => {
    try {
      await api.proposals.reject(proposalId);
      toast.info('Proposal declined.');
      await fetchWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject proposal');
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !project) return;
    setIsSendingMessage(true);
    try {
      const res = await api.workspace.sendMessage(project.id, { content: messageInput.trim() });
      if (res && (res as any).message && typeof (res as any).message === 'object') {
        const newMsg = (res as any).message as Message;
        setMessages((prev) => [...prev, newMsg]);
      }
      setMessageInput('');
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to send message.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Handle Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !project) return;
    try {
      await api.projects.addTask(project.id, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        assignedTo: newTaskAssignee,
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      toast.success('Task created successfully!');
      await fetchWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add task.');
    }
  };

  // Handle Toggle Task Status
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    if (!project) return;
    try {
      await api.projects.updateTaskStatus(project.id, taskId, newStatus);
      await fetchWorkspace();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update task.');
    }
  };

  // Handle Work Submission (Freelancer)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !submissionDesc.trim()) return;
    setIsSubmittingWork(true);
    try {
      await api.workspace.submitWork(project.id, {
        description: submissionDesc.trim(),
        notes: submissionNotes.trim(),
        files: [
          {
            name: submissionFileName || 'final_deliverable.zip',
            url: '#',
            size: '8.4 MB',
          },
        ],
      });
      setSubmissionDesc('');
      setSubmissionNotes('');
      toast.success('Deliverables submitted for client review!');
      await fetchWorkspace();
      setActiveTab('submissions');
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Handle Client Review
  const handleReviewWork = async (action: 'ACCEPT' | 'REVISION') => {
    if (!project) return;
    if (action === 'REVISION' && !revisionComments.trim()) {
      toast.error('Please specify the required changes for revision.');
      return;
    }
    try {
      await api.workspace.reviewWork(project.id, {
        action,
        revisionComments: action === 'REVISION' ? revisionComments.trim() : undefined,
      });
      setShowRevisionForm(false);
      setRevisionComments('');
      if (action === 'ACCEPT') {
        toast.success('Work accepted! Project marked as completed.');
      } else {
        toast.info('Revision requested from freelancer.');
      }
      await fetchWorkspace();
    } catch (err: any) {
      toast.error(err.message || 'Review action failed.');
    }
  };

  // Handle Add to Portfolio (Section 18)
  const handleAddToPortfolio = async () => {
    if (!project) return;
    try {
      await api.workspace.addToPortfolio(project.id, {
        title: project.title,
        description: project.description,
        skills: project.requiredSkills,
      });
      toast.success('Project successfully added to your public portfolio!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to add to portfolio.');
    }
  };

  if (isLoading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-xs text-slate-400">Loading workspace...</div>;
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-base font-bold text-slate-800">Workspace Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/projects" className="mt-4 inline-block text-xs font-semibold text-indigo-600">
          Browse Projects
        </Link>
      </div>
    );
  }

  const isClient = user?.id === project.clientId;
  const isFreelancer = user?.id === project.freelancerId;
  const hasFreelancer = !!project.freelancerId;
  const isExchange = project.mode === 'SKILL_EXCHANGE';
  const hasApplied = proposals.some((p) => p.freelancerId === user?.id);

  // Status mapping
  const statusLabels: Record<string, { label: string; color: string }> = {
    DRAFT: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    PUBLISHED: { label: 'Open for Bids', color: 'bg-blue-50 text-blue-700' },
    PROPOSALS_RECEIVED: { label: 'Reviewing Proposals', color: 'bg-amber-50 text-amber-700' },
    HIRED: { label: 'Hired & Active', color: 'bg-indigo-50 text-indigo-700' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-indigo-50 text-indigo-700' },
    SUBMITTED: { label: 'Work Submitted for Review', color: 'bg-purple-50 text-purple-700' },
    REVISION_REQUESTED: { label: 'Revision Requested', color: 'bg-rose-50 text-rose-700' },
    RESUBMITTED: { label: 'Resubmitted for Review', color: 'bg-purple-50 text-purple-700' },
    ACCEPTED: { label: 'Accepted (Payment Pending)', color: 'bg-emerald-50 text-emerald-700' },
    COMPLETED: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
    EXCHANGE_IN_PROGRESS: { label: 'Exchange In Progress', color: 'bg-emerald-50 text-emerald-700' },
    EXCHANGE_COMPLETED: { label: 'Skill Barter Completed', color: 'bg-emerald-100 text-emerald-800' },
  };

  const currentStatusInfo = statusLabels[project.status] || {
    label: project.status,
    color: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Workspace Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${currentStatusInfo.color}`}>
                {currentStatusInfo.label}
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span
                className={`font-semibold flex items-center gap-1 ${
                  isExchange ? 'text-emerald-700' : 'text-indigo-700'
                }`}
              >
                {isExchange ? <ArrowLeftRight className="w-3.5 h-3.5" /> : <DollarSign className="w-3.5 h-3.5" />}
                <span>{isExchange ? 'Skill Exchange Project' : 'Paid Escrow Contract'}</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">{project.description}</p>
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-2">
            {/* If Client and project accepted -> Release Simulated Payment */}
            {isClient && (project.status === 'ACCEPTED' || project.status === 'PAYMENT_PENDING') && (
              <button
                type="button"
                onClick={() => setPaymentModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <DollarSign className="w-4 h-4" />
                <span>Release Payment (${project.budget.toLocaleString()})</span>
              </button>
            )}

            {/* Rating trigger on completion */}
            {(project.status === 'COMPLETED' || project.status === 'EXCHANGE_COMPLETED') && (
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg flex items-center gap-1.5"
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Leave Review</span>
              </button>
            )}

            {/* Freelancer Add to Portfolio */}
            {isFreelancer && (project.status === 'COMPLETED' || project.status === 'EXCHANGE_COMPLETED') && (
              <button
                type="button"
                onClick={handleAddToPortfolio}
                className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Add to My Portfolio</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setReportModalOpen(true)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg border border-slate-200"
              title="Report dispute"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stakeholders Bar */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Client */}
          <div className="flex items-center gap-2.5">
            <img
              src={project.clientAvatar || '/src/assets/images/avatar_client_marcus_1790830259951.jpg'}
              alt={project.clientName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Client</span>
              <span className="font-bold text-slate-900">{project.clientName}</span>
            </div>
          </div>

          {/* Freelancer */}
          <div className="flex items-center gap-2.5">
            {project.freelancerId ? (
              <>
                <img
                  src={project.freelancerAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                  alt={project.freelancerName}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-medium block">Assigned Freelancer</span>
                  <span className="font-bold text-slate-900">{project.freelancerName}</span>
                </div>
              </>
            ) : (
              <div className="text-slate-400 flex items-center gap-1">
                <UserIcon className="w-4 h-4" />
                <span>Awaiting Freelancer Assignment</span>
              </div>
            )}
          </div>

          {/* Budget / Terms */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              {isExchange ? 'Exchange Deliverables' : 'Escrow Value'}
            </span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">
              {isExchange ? `${project.clientOfferedSkill} ⇄ ${project.freelancerOfferedSkill || 'Talent'}` : `$${project.budget.toLocaleString()}`}
            </span>
          </div>

          {/* Deadline */}
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-medium block">Target Delivery</span>
            <span className="font-bold text-slate-900 font-mono tabular-nums">{project.deadline}</span>
          </div>
        </div>

        {/* Progress Stepper (Section 12) */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700">Project Progress</span>
            <span className="font-mono font-bold text-slate-800 tabular-nums">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* If No Freelancer assigned yet and user is a Freelancer -> Allow Submitting Proposal */}
      {!hasFreelancer && user?.role === 'FREELANCER' && !hasApplied && (
        <div className="bg-white rounded-2xl border border-indigo-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-700">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900">Submit a Proposal for this Project</h3>
          </div>
          <p className="text-xs text-slate-500">
            Apply to collaborate with {project.clientName}. State your approach, price bid, and turnaround time.
          </p>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cover Letter & Approach:</label>
              <textarea
                rows={4}
                placeholder="Explain why you are the best fit, how you will tackle requirements, and relevant experience..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Price ($):</label>
                <input
                  type="number"
                  value={proposedPrice}
                  onChange={(e) => setProposedPrice(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Days to Deliver:</label>
                <input
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingProposal}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50"
            >
              {isSubmittingProposal ? 'Submitting Application...' : 'Send Proposal to Client'}
            </button>
          </form>
        </div>
      )}

      {/* If Client and proposals received and project has no assigned freelancer -> View Proposals */}
      {isClient && !hasFreelancer && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Received Proposals ({proposals.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Select a freelancer to launch workspace</span>
          </div>

          {proposals.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No proposals received yet. Freelancers can apply publicly.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {proposals.map((prop) => (
                <div key={prop.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={prop.freelancerAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                        alt={prop.freelancerName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{prop.freelancerName}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                          <span className="flex items-center gap-0.5 text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <strong className="text-slate-800">{prop.freelancerRating.toFixed(1)}</strong>
                          </span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span className="text-slate-900 font-bold tabular-nums">${prop.proposedPrice.toLocaleString()}</span>
                          <span aria-hidden="true" className="text-slate-300">·</span>
                          <span>{prop.deliveryTimeDays} days delivery</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/profile/${prop.freelancerId}`}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                      >
                        Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(prop.id)}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                      >
                        Accept Proposal & Start
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectProposal(prop.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        Decline
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {prop.coverLetter}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Workspace Tabs (Tasks, Chat, Deliverables, Files) */}
      <div className="space-y-4">
        {/* Navigation segmented buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Tasks & Milestones</span>
            <span className="text-[10px] font-mono tabular-nums text-slate-400">({project.tasks?.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Workspace Chat</span>
            <span className="text-[10px] font-mono tabular-nums text-slate-400">({messages.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'submissions' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Work Deliverables</span>
            <span className="text-[10px] font-mono tabular-nums text-slate-400">
              ({project.submissions?.length || 0})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'files' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Files</span>
            <span className="text-[10px] font-mono tabular-nums text-slate-400">
              ({project.attachments?.length || 0})
            </span>
          </button>
        </div>

        {/* Tab 1: Tasks & Milestones */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Task Management & Progress Tracking</h3>
                <p className="text-xs text-slate-500">
                  Update tasks to In Progress or Completed to advance the project lifecycle.
                </p>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-2.5">
              {!project.tasks || project.tasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tasks created yet for this project.</p>
              ) : (
                project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{task.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Assigned to: {task.assignedToName}</span>
                      </h4>
                      {task.description && <p className="text-[11px] text-slate-500">{task.description}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                        className={`text-xs font-semibold py-1 px-2.5 rounded-lg border focus:outline-indigo-600 ${
                          task.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : task.status === 'In Progress'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-300'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="pt-4 border-t border-slate-100 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Add New Project Milestone / Task:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Task title (e.g. Prototype User Flow)"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Short description..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Project Chat (Section 12) */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-slate-200 flex flex-col h-[520px] overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No messages yet. Send an opening note to start collaboration.
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <img
                        src={msg.senderAvatar || '/src/assets/images/avatar_freelancer_priya_1790830248285.jpg'}
                        alt={msg.senderName}
                        referrerPolicy="no-referrer"
                        className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                      />
                      <div className={`max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <span className="text-[10px] text-slate-400 font-medium px-1">
                          {msg.senderName} ·{' '}
                          <span className="font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </span>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed mt-0.5 ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-tr-xs'
                              : 'bg-slate-100 text-slate-800 rounded-tl-xs'
                          }`}
                        >
                          <p>{msg.content}</p>
                          {msg.attachment && (
                            <div className="mt-2 p-2 bg-black/10 rounded-lg text-[11px] flex items-center gap-1.5">
                              <Paperclip className="w-3 h-3" />
                              <span className="font-medium underline">{msg.attachment.name}</span>
                              <span className="text-[10px] opacity-75 font-mono">({msg.attachment.size})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
              <input
                type="text"
                placeholder="Type your message to project members..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-indigo-600"
              />
              <button
                type="submit"
                disabled={isSendingMessage || !messageInput.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Deliverables & Client Review (Section 13, 14, 15) */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Freelancer Work Submission Panel */}
            {(isFreelancer || user?.role === 'FREELANCER') && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Submit Work for Client Review</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Upload completed deliverables, source files, and release notes for review by {project.clientName}.
                </p>

                <form onSubmit={handleSubmitWork} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Deliverables Description & Links:
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Model inference script trained with 95% accuracy, Swagger documentation, and Docker compose files..."
                      value={submissionDesc}
                      onChange={(e) => setSubmissionDesc(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Attached File Name:</label>
                      <input
                        type="text"
                        value={submissionFileName}
                        onChange={(e) => setSubmissionFileName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Testing / Deployment Notes:</label>
                      <input
                        type="text"
                        placeholder="e.g. Run docker-compose up to test endpoints"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-indigo-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingWork}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>{project.status === 'REVISION_REQUESTED' ? 'Resubmit Work' : 'Submit Deliverables'}</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}

            {/* Submissions Review List (Section 14) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Deliverable Submissions History ({project.submissions?.length || 0})
              </h3>

              {!project.submissions || project.submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No work submissions yet.</p>
              ) : (
                <div className="space-y-4">
                  {project.submissions.map((sub, idx) => (
                    <div key={sub.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          Submission Version {sub.version || project.submissions.length - idx}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{sub.description}</p>

                      {sub.files && sub.files.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {sub.files.map((f, i) => (
                            <div
                              key={i}
                              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5"
                            >
                              <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{f.name}</span>
                              <span className="text-[10px] text-slate-400">({f.size})</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {sub.revisionNotes && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
                          <strong>Revision Comments:</strong> {sub.revisionNotes}
                        </div>
                      )}

                      {/* Client Review Action Bar for Latest Submission */}
                      {isClient && idx === 0 && (project.status === 'SUBMITTED' || project.status === 'RESUBMITTED') && (
                        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReviewWork('ACCEPT')}
                            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Accept Work Deliverables</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowRevisionForm(!showRevisionForm)}
                            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                          >
                            Request Revisions
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Revision Comments Drawer for Client */}
              {showRevisionForm && (
                <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-rose-900">Specify Required Revisions</h4>
                  <textarea
                    rows={3}
                    placeholder="List specific changes, bug fixes, or improvements needed before acceptance..."
                    value={revisionComments}
                    onChange={(e) => setRevisionComments(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg bg-white focus:outline-rose-600"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRevisionForm(false)}
                      className="px-3 py-1.5 text-xs text-slate-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReviewWork('REVISION')}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
                    >
                      Send Revision Request
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Files & Attachments */}
        {activeTab === 'files' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Project Assets & Shared Documents</h3>

            {!project.attachments || project.attachments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No files uploaded yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {project.attachments.map((file, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate block">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{file.size}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        project={project}
        onPaymentSuccess={() => fetchWorkspace()}
      />

      {reviewModalOpen && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          projectId={project.id}
          projectTitle={project.title}
          revieweeId={isClient ? project.freelancerId! : project.clientId}
          revieweeName={isClient ? project.freelancerName! : project.clientName}
          onReviewSubmitted={() => fetchWorkspace()}
        />
      )}

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        projectId={project.id}
        reportedUser={isClient ? project.freelancerId : project.clientId}
        reportedUserName={isClient ? project.freelancerName : project.clientName}
      />
    </div>
  );
}
