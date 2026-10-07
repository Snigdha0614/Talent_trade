export type UserRole = 'FREELANCER' | 'CLIENT' | 'ADMIN';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface UserSkill {
  id: string;
  name: string;
  category: string;
  level: SkillLevel;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  skills: string[];
  imageUrl?: string;
  projectUrl?: string;
  completedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  bio: string;
  location: string;
  title?: string;
  hourlyRate?: number;
  education: Education[];
  experience: Experience[];
  certifications: string[];
  skills: UserSkill[];
  portfolio: PortfolioItem[];
  availability: 'Available' | 'Busy' | 'Not Available';
  rating: number;
  reviewCount: number;
  isSuspended: boolean;
  createdAt: string;
}

export type ServiceStatus = 'DRAFT' | 'PUBLISHED' | 'PAUSED';

export interface Service {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  title: string;
  description: string;
  category: string;
  skills: string[];
  price: number;
  deliveryTimeDays: number;
  sampleWorkUrls: string[];
  portfolio: string[];
  availability: string;
  status: ServiceStatus;
  views: number;
  ordersCount: number;
  createdAt: string;
}

export type ProjectMode = 'PAID' | 'SKILL_EXCHANGE';

export type ProjectStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'PROPOSALS_RECEIVED'
  | 'HIRED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'RESUBMITTED'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_COMPLETED'
  | 'EXCHANGE_REQUESTED'
  | 'EXCHANGE_ACCEPTED'
  | 'EXCHANGE_IN_PROGRESS'
  | 'EXCHANGE_COMPLETED';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  deadline: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface WorkSubmission {
  id: string;
  submittedAt: string;
  description: string;
  files: { name: string; url: string; size: string }[];
  notes?: string;
  revisionNotes?: string;
  version: number;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  freelancerId?: string;
  freelancerName?: string;
  freelancerAvatar?: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  budget: number;
  deadline: string;
  mode: ProjectMode;
  status: ProjectStatus;
  progress: number;
  tasks: ProjectTask[];
  submissions: WorkSubmission[];
  attachments: { name: string; url: string; size: string }[];
  clientOfferedSkill?: string;
  freelancerOfferedSkill?: string;
  exchangeTerms?: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerRating: number;
  coverLetter: string;
  proposedPrice: number;
  deliveryTimeDays: number;
  relevantSkills: string[];
  portfolioLinks: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface SkillExchangeRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  receiverName: string;
  receiverAvatar: string;
  offeredSkill: string;
  requestedSkill: string;
  description: string;
  durationDays: number;
  exchangeTerms: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  projectId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  receiverId: string;
  content: string;
  attachment?: {
    name: string;
    url: string;
    size: string;
  };
  timestamp: string;
}

export interface Review {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: UserRole;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'PROPOSAL'
    | 'HIRE_REQUEST'
    | 'EXCHANGE_REQUEST'
    | 'MESSAGE'
    | 'FILE_UPLOADED'
    | 'WORK_SUBMITTED'
    | 'REVISION_REQUESTED'
    | 'PROJECT_ACCEPTED'
    | 'PROJECT_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'REVIEW_RECEIVED';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reportedBy: string;
  reportedByName: string;
  reportedUser?: string;
  reportedUserName?: string;
  serviceId?: string;
  projectId?: string;
  type: 'Fake Profile' | 'Inappropriate Service' | 'Fraud' | 'Project Dispute';
  description: string;
  evidence?: string;
  status: 'Pending' | 'Under Investigation' | 'Resolved' | 'Rejected';
  adminResponse?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  freelancerId: string;
  freelancerName: string;
  amount: number;
  method: 'UPI' | 'Card' | 'Wallet';
  transactionId: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  itemType: 'FREELANCER' | 'SERVICE' | 'PROJECT';
  itemId: string;
  createdAt: string;
}
