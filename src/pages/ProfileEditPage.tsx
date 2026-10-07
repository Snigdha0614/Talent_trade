import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { SkillLevel } from '../types.js';

const SKILL_LEVELS: SkillLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const CATEGORIES = ['Programming', 'Artificial Intelligence', 'Web Development', 'Design', 'Marketing', 'Data & Analytics', 'Content'];

export default function ProfileEditPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Basic info
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState(user?.title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [hourlyRate, setHourlyRate] = useState(user?.hourlyRate?.toString() || '65');
  const [availability, setAvailability] = useState(user?.availability || 'Available');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Skills input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState(CATEGORIES[0]);
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Advanced');

  // Education input
  const [newDegree, setNewDegree] = useState('');
  const [newInstitution, setNewInstitution] = useState('');
  const [newYear, setNewYear] = useState('2024');

  // Experience input
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDuration, setNewDuration] = useState('2022 - Present');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Certifications
  const [newCert, setNewCert] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    try {
      await api.users.updateProfile({
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        location: location.trim(),
        hourlyRate: Number(hourlyRate) || 0,
        availability: availability as any,
        profileImage: profileImage.trim() || undefined,
      });
      await refreshUser();
      toast.success('Profile details updated successfully!');
      setSuccessMessage('Profile details updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await api.users.addSkill({
        name: newSkillName.trim(),
        category: newSkillCategory,
        level: newSkillLevel,
      });
      setNewSkillName('');
      toast.success(`Skill "${newSkillName}" added!`);
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    try {
      await api.users.deleteSkill(skillId);
      toast.info('Skill removed.');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete skill.');
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDegree.trim() || !newInstitution.trim()) return;
    const currentEdu = user.education || [];
    const updated = [
      ...currentEdu,
      {
        id: `edu_${Date.now()}`,
        degree: newDegree.trim(),
        institution: newInstitution.trim(),
        year: newYear.trim(),
      },
    ];
    try {
      await api.users.updateProfile({ education: updated });
      setNewDegree('');
      setNewInstitution('');
      toast.success('Education record added!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add education.');
    }
  };

  const handleDeleteEducation = async (id: string) => {
    const updated = (user.education || []).filter((e) => e.id !== id);
    await api.users.updateProfile({ education: updated });
    toast.info('Education record removed.');
    await refreshUser();
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim() || !newCompany.trim()) return;
    const currentExp = user.experience || [];
    const updated = [
      ...currentExp,
      {
        id: `exp_${Date.now()}`,
        role: newRole.trim(),
        company: newCompany.trim(),
        duration: newDuration.trim(),
        description: newExpDesc.trim(),
      },
    ];
    try {
      await api.users.updateProfile({ experience: updated });
      setNewRole('');
      setNewCompany('');
      setNewExpDesc('');
      toast.success('Experience record added!');
      await refreshUser();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add experience.');
    }
  };

  const handleDeleteExperience = async (id: string) => {
    const updated = (user.experience || []).filter((e) => e.id !== id);
    await api.users.updateProfile({ experience: updated });
    toast.info('Experience record removed.');
    await refreshUser();
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCert.trim()) return;
    const currentCerts = user.certifications || [];
    const updated = [...currentCerts, newCert.trim()];
    await api.users.updateProfile({ certifications: updated });
    setNewCert('');
    await refreshUser();
  };

  const handleDeleteCert = async (cert: string) => {
    const updated = (user.certifications || []).filter((c) => c !== cert);
    await api.users.updateProfile({ certifications: updated });
    await refreshUser();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Account Settings</span>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">Edit Profile & Skills</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Keep your skills, experience, and rates up-to-date so clients and barter partners can discover you.
        </p>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* 1. Basic Info Form */}
      <form onSubmit={handleSaveBasic} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900">Personal & Professional Identity</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Headline / Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
              placeholder="e.g. Senior Machine Learning Engineer"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600 leading-relaxed"
            placeholder="Share your technical background, years of experience, and passion for skill barter..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
              placeholder="e.g. San Francisco, CA"
            />
          </div>

          {user.role === 'FREELANCER' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600 font-mono"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Availability</label>
            <select
              value={availability}
              onChange={(e: any) => setAvailability(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
            >
              <option value="Available">Available</option>
              <option value="Busy">Busy</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* 2. Skills Management (Section 5) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Manage Skills & Expertise Levels</h2>
          <p className="text-xs text-slate-500">
            Categorize your skills and define proficiency (Beginner, Intermediate, Advanced, Expert).
          </p>
        </div>

        {/* Existing skills list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(!user.skills || user.skills.length === 0) ? (
            <p className="text-xs text-slate-400 py-2">No skills added yet.</p>
          ) : (
            user.skills.map((sk) => (
              <div
                key={sk.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{sk.name}</h4>
                  <span className="text-[11px] text-slate-500">{sk.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {sk.level}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(sk.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Skill form */}
        <form onSubmit={handleAddSkill} className="pt-4 border-t border-slate-100 space-y-3">
          <span className="text-xs font-bold text-slate-800 block">Add New Skill:</span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="e.g. Scikit-learn or React 19"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600 sm:col-span-2"
              required
            />
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={newSkillLevel}
              onChange={(e: any) => setNewSkillLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-indigo-600 font-mono"
            >
              {SKILL_LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill to Profile</span>
          </button>
        </form>
      </div>

      {/* 3. Experience & Education Management */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Work Experience</span>
          </h3>

          <div className="space-y-3">
            {user.experience?.map((exp) => (
              <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 relative">
                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-bold text-slate-900">{exp.role}</h4>
                <p className="text-slate-600">{exp.company} · {exp.duration}</p>
                <p className="text-slate-500 pt-1">{exp.description}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddExperience} className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Add Experience Entry:</span>
            <input
              type="text"
              placeholder="Role / Title"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Company"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Duration (e.g. 2021-Present)"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Key responsibilities & accomplishments..."
              value={newExpDesc}
              onChange={(e) => setNewExpDesc(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              + Add Experience
            </button>
          </form>
        </div>

        {/* Education & Certs */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Education</span>
          </h3>

          <div className="space-y-3">
            {user.education?.map((edu) => (
              <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 relative">
                <button
                  onClick={() => handleDeleteEducation(edu.id)}
                  className="absolute top-2.5 right-2.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                <p className="text-slate-600">{edu.institution} ({edu.year})</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddEducation} className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-semibold text-slate-700 block">Add Degree:</span>
            <input
              type="text"
              placeholder="Degree (e.g. B.Tech Computer Science)"
              value={newDegree}
              onChange={(e) => setNewDegree(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Institution"
                value={newInstitution}
                onChange={(e) => setNewInstitution(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Year"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              + Add Degree
            </button>
          </form>

          {/* Certifications sub-block */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Certifications:</span>
            <div className="flex flex-wrap gap-1.5">
              {user.certifications?.map((c) => (
                <span
                  key={c}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Award className="w-3 h-3 text-amber-500" />
                  <span>{c}</span>
                  <button onClick={() => handleDeleteCert(c)} className="text-slate-400 hover:text-rose-600">
                    ×
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddCert} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="e.g. AWS Certified Developer"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
