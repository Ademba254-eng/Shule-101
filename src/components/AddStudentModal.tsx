import React, { useState, useMemo } from 'react';
import { useSchool } from '../context/SchoolContext';
import { GradeLevel, Section } from '../types';
import { ArrowLeft, BookOpen, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { getTeacherForGradeAndSection } from '../utils/teacherAssignment';
import { CompressedFileUpload } from './CompressedFileUpload';

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({ onClose, onSuccess }) => {
  const { addStudent } = useSchool();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState<GradeLevel>('Grade 10');
  const [section, setSection] = useState<Section>('A');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2010-05-14');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState<'Mother' | 'Father' | 'Guardian'>('Mother');
  const [guardianPhone, setGuardianPhone] = useState('+254 7');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  const assignedTeacher = useMemo(() => {
    return getTeacherForGradeAndSection(grade, section);
  }, [grade, section]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !guardianName.trim()) return;

    const email = guardianEmail.trim().toLowerCase() || `${firstName.toLowerCase()}.${lastName.toLowerCase()}parent@example.com`;

    addStudent({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      grade,
      section,
      gender,
      dob,
      bloodGroup,
      avatar:
        customAvatar ||
        (gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'),
      guardian: {
        name: guardianName.trim(),
        relation: guardianRelation,
        phone: guardianPhone.trim() || '+254 712 345 678',
        email,
        address: guardianAddress.trim() || 'Nairobi Metropolitan Area',
      },
    });

    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Enroll New Student</h3>
              <p className="text-[11px] text-slate-500">Official Student Academic Registry Entry & Automatic Teacher Placement</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Section: Student Demographics */}
          <div>
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
              Student Personal Details:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Benjamin"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Brooks"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Assigned Grade *</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as GradeLevel)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Grade 9">Grade 9</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Class Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as Section)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Student Photo & Document Upload (< 2MB Compressed) */}
          <CompressedFileUpload
            id="add-student-photo-upload"
            onFileCompressed={(res) => setCustomAvatar(res.dataUrl)}
            onFileRemoved={() => setCustomAvatar(null)}
            label="Student Passport Photo / Enrollment Record (Image or PDF)"
            helperText="Auto-compressed to < 2MB to optimize storage space."
            accept="image/*,.pdf"
            compact
          />

          {/* Automatic Teacher Placement Card */}
          <div className="p-3 bg-indigo-50/90 border border-indigo-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center space-x-3">
              <img
                src={assignedTeacher.avatar}
                alt={assignedTeacher.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-400 flex-shrink-0"
              />
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded border border-indigo-200">
                    Automatic Placement
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {assignedTeacher.name}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Class Teacher for <strong>{grade}-{section}</strong> • Student automatically placed in their class roster and register.
                </p>
              </div>
            </div>
          </div>

          {/* Section: Guardian / Parent Info */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                Primary Guardian & Portal Access:
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Portal Access Registered</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Guardian Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Laura Brooks"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Relationship</label>
                <select
                  value={guardianRelation}
                  onChange={(e) => setGuardianRelation(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                >
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Guardian Phone</label>
              <input
                type="tel"
                placeholder="+254 712 345 678"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guardian Email (Platform Login) *</span>
              </label>
              <input
                type="email"
                placeholder="laura.brooks@example.com"
                value={guardianEmail}
                onChange={(e) => setGuardianEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-emerald-300 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[10px] text-emerald-700 mt-1">
                🔒 Parent can easily access the platform via this registered email.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Complete Student Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

