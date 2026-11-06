import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSchool } from '../context/SchoolContext';
import {
  MessageSquare,
  Send,
  Search,
  Megaphone,
  Filter,
  CheckCheck,
  Clock,
  User,
  Phone,
  Mail,
  Plus,
  Tag,
  AlertCircle,
  FileText,
  Calendar,
  Award,
  CreditCard,
  CalendarCheck,
  ArrowLeft,
  Paperclip,
} from 'lucide-react';
import { MessageCategory, MessageThread } from '../types';
import { CompressedFileUpload } from './CompressedFileUpload';
import { CompressedFileResult } from '../utils/fileCompression';

export const MessagingView: React.FC = () => {
  const {
    threads,
    messages,
    students,
    invoices,
    academicRecords,
    attendance,
    selectedDate,
    activeRole,
    sendDirectMessage,
    markThreadRead,
    announcements,
    createAnnouncement,
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'direct' | 'circulars'>('direct');
  const [selectedThreadId, setSelectedThreadId] = useState<string>(threads[0]?.id || 'thread-std-1');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Composer state
  const [messageText, setMessageText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
  const [senderNameInput, setSenderNameInput] = useState('School Administration Desk');
  const [attachedFile, setAttachedFile] = useState<CompressedFileResult | null>(null);
  const [showAttachmentBox, setShowAttachmentBox] = useState(false);

  // Announcement Modal state
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'normal' | 'important' | 'urgent'>('important');
  const [annAudience, setAnnAudience] = useState<'All Parents & Students' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12'>('All Parents & Students');
  const [annTag, setAnnTag] = useState('Academic');

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active Thread & Student
  const activeThread = threads.find((t) => t.id === selectedThreadId) || threads[0];
  const activeStudent = activeThread ? students.find((s) => s.id === activeThread.studentId) : undefined;
  const activeStudentInvoice = activeStudent ? invoices.find((i) => i.studentId === activeStudent.id) : undefined;
  const activeStudentAcademic = activeStudent ? academicRecords.find((r) => r.studentId === activeStudent.id) : undefined;

  // Active Thread Messages
  const threadMessages = useMemo(() => {
    return messages.filter((m) => m.threadId === activeThread?.id);
  }, [messages, activeThread]);

  // Mark thread read when opened
  useEffect(() => {
    if (activeThread) {
      markThreadRead(activeThread.id, activeRole);
    }
  }, [selectedThreadId, activeRole]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter((t) => {
      const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
      const matchesSearch =
        t.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [threads, categoryFilter, searchQuery]);

  // Quick message template options
  const templates = [
    {
      label: 'Absence Notice',
      category: 'attendance' as MessageCategory,
      text: `Dear ${activeStudent?.guardian.name || 'Parent'}, our records show that ${activeStudent?.firstName || 'your student'} was marked absent during roll call on ${selectedDate}. Please let us know if this absence is due to illness or family reasons.`,
    },
    {
      label: 'Fee Payment Reminder',
      category: 'fees' as MessageCategory,
      text: `Dear ${activeStudent?.guardian.name || 'Parent'}, this is a reminder that the Term 2 fee balance of $${activeStudentInvoice?.balance || 0} for ${activeStudent?.firstName || 'your child'} is due on ${activeStudentInvoice?.dueDate || 'September 15, 2026'}. You may settle this online via the parent portal.`,
    },
    {
      label: 'Academic Commendation',
      category: 'academic' as MessageCategory,
      text: `Dear ${activeStudent?.guardian.name || 'Parent'}, we would like to commend ${activeStudent?.firstName || 'your child'} on exemplary academic focus this term (Current GPA: ${activeStudentAcademic?.overallGpa || '3.8'}). Thank you for your continued partnership!`,
    },
    {
      label: 'PTA Conference Invite',
      category: 'general' as MessageCategory,
      text: `Dear ${activeStudent?.guardian.name || 'Parent'}, please be reminded that the upcoming Parent-Teacher Conference takes place on Friday, September 25th. We look forward to meeting with you to discuss ${activeStudent?.firstName || 'your child'}'s milestones.`,
    },
  ];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeStudent) return;

    const attachments = attachedFile ? [attachedFile.dataUrl] : undefined;

    sendDirectMessage(
      activeStudent.id,
      messageText.trim(),
      selectedCategory,
      {
        role: activeRole === 'staff' ? 'school_admin' : 'parent',
        name:
          activeRole === 'staff'
            ? senderNameInput
            : activeStudent.guardian.name,
      },
      attachments
    );

    setMessageText('');
    setAttachedFile(null);
    setShowAttachmentBox(false);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;

    createAnnouncement(annTitle.trim(), annContent.trim(), annPriority, annAudience, annTag);
    setIsNewAnnouncementOpen(false);
    setAnnTitle('');
    setAnnContent('');
    alert('School Circular successfully published and dispatched to parents!');
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Parent Communication & Messaging Hub</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Direct two-way messaging with parents and school-wide circular broadcasts.
          </p>
        </div>

        {/* Channels Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            id="tab-direct-messages"
            onClick={() => setActiveTab('direct')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'direct'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Direct Parent Chats</span>
          </button>
          <button
            id="tab-circulars"
            onClick={() => setActiveTab('circulars')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'circulars'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>School Circulars ({announcements.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'direct' ? (
        /* Direct Split-Pane Chat Interface */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col md:flex-row min-h-[620px]">
          {/* Left Panel: Conversations List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col bg-slate-50/50">
            {/* Search & Category Filter */}
            <div className="p-3.5 border-b border-slate-200 space-y-2.5 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search parents or students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['all', 'academic', 'attendance', 'fees', 'general'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-0.5 rounded-full capitalize font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Cards List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredThreads.map((thread) => {
                const isSelected = thread.id === activeThread?.id;
                const student = students.find((s) => s.id === thread.studentId);
                const hasUnread =
                  activeRole === 'staff'
                    ? thread.unreadCountForStaff > 0
                    : thread.unreadCountForParent > 0;

                return (
                  <div
                    key={thread.id}
                    id={`thread-item-${thread.id}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                    className={`p-3.5 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-white border-l-4 border-indigo-600 shadow-2xs'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <img
                          src={student?.avatar}
                          alt={student?.firstName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {thread.parentName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {thread.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 truncate">
                          Parent of {thread.studentName} ({thread.grade})
                        </p>
                        <p className="text-xs text-slate-600 truncate mt-1">
                          {thread.lastMessage}
                        </p>

                        <div className="mt-1.5 flex items-center space-x-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-sm ${
                              thread.category === 'attendance'
                                ? 'bg-amber-100 text-amber-800'
                                : thread.category === 'fees'
                                ? 'bg-emerald-100 text-emerald-800'
                                : thread.category === 'academic'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {thread.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Panel: Active Chat Stream */}
          {activeThread && activeStudent ? (
            <div className="flex-1 flex flex-col bg-white">
              {/* Chat Header with Student Context Snapshot */}
              <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={activeStudent.avatar}
                    alt={activeStudent.firstName}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {activeThread.parentName}
                      </h3>
                      <span className="text-xs text-slate-500">
                        ({activeStudent.guardian.relation} of {activeStudent.firstName})
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{activeStudent.guardian.phone}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{activeStudent.guardian.email}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Context Pills */}
                <div className="flex items-center space-x-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    GPA: {activeStudentAcademic?.overallGpa.toFixed(2) || '3.80'}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-semibold border ${
                      (activeStudentInvoice?.balance || 0) > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    Fee Bal: ${(activeStudentInvoice?.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                {threadMessages.map((msg) => {
                  const isFromParent = msg.senderRole === 'parent';
                  const isStaff = !isFromParent;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center space-x-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-slate-700">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1 rounded-xs ${
                            msg.category === 'attendance'
                              ? 'bg-amber-100 text-amber-800'
                              : msg.category === 'fees'
                              ? 'bg-emerald-100 text-emerald-800'
                              : msg.category === 'academic'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {msg.category}
                        </span>
                      </div>

                      <div
                        className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          isStaff
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-white text-slate-900 border border-slate-200/90 rounded-tl-xs'
                        }`}
                      >
                        <div>{msg.content}</div>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-black/10">
                            {msg.attachments.map((att, i) =>
                              att.startsWith('data:image/') ? (
                                <img
                                  key={i}
                                  src={att}
                                  alt="Attachment"
                                  className="max-h-44 rounded-lg object-contain bg-black/5 border border-black/10"
                                />
                              ) : (
                                <a
                                  key={i}
                                  href={att}
                                  download="document.pdf"
                                  className="inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-[11px] font-bold transition"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Attached PDF Document (&lt; 2MB Compressed)</span>
                                </a>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Template Buttons */}
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center space-x-2 overflow-x-auto text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider whitespace-nowrap">
                  Quick Templates:
                </span>
                {templates.map((tpl) => (
                  <button
                    key={tpl.label}
                    onClick={() => {
                      setMessageText(tpl.text);
                      setSelectedCategory(tpl.category);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors"
                  >
                    + {tpl.label}
                  </button>
                ))}
              </div>

              {/* Message Composer */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-white space-y-3">
                <div className="flex items-center space-x-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-600">Category:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as MessageCategory)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs"
                    >
                      <option value="general">General Note</option>
                      <option value="academic">Academic Update</option>
                      <option value="attendance">Attendance Alert</option>
                      <option value="fees">Fee Notice</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  {activeRole === 'staff' && (
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-600">Sender Role:</span>
                      <select
                        value={senderNameInput}
                        onChange={(e) => setSenderNameInput(e.target.value)}
                        className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-800 text-xs"
                      >
                        <option value="School Administration Desk">School Administration</option>
                        <option value="Dr. Gregory Vance (Math & Class Advisor)">Class Advisor</option>
                        <option value="Attendance & Registrar Office">Attendance Office</option>
                        <option value="Bursar & Finance Directorate">Finance Office</option>
                        <option value="Margaret Hastings (Principal)">Principal's Office</option>
                      </select>
                    </div>
                  )}
                </div>

                {showAttachmentBox && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-2">
                    <CompressedFileUpload
                      id="direct-msg-attachment-upload"
                      onFileCompressed={(res) => setAttachedFile(res)}
                      onFileRemoved={() => setAttachedFile(null)}
                      label="Attach Image or PDF Document"
                      helperText="Images and PDF text are automatically compressed to < 2MB to optimize storage."
                      accept="image/*,.pdf"
                      compact
                    />
                  </div>
                )}

                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAttachmentBox(!showAttachmentBox)}
                    className={`p-3 rounded-xl border transition shrink-0 ${
                      showAttachmentBox || attachedFile
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                    title="Attach Image or PDF Document (< 2MB Compressed)"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    rows={2}
                    placeholder={`Compose message to ${activeThread.parentName} regarding ${activeStudent.firstName}...`}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:bg-white resize-none"
                  />
                  <button
                    type="submit"
                    id="send-direct-message-btn"
                    disabled={!messageText.trim() && !attachedFile}
                    className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors shrink-0"
                    title="Send Message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400">
              <p>Select a parent conversation from the left panel</p>
            </div>
          )}
        </div>
      ) : (
        /* School Announcements & Circulars Channel */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h2 className="text-base font-bold text-slate-900">Official School Circulars</h2>
              <p className="text-xs text-slate-500">
                School bulletins published to all student parents and guardians.
              </p>
            </div>

            <button
              id="publish-circular-btn"
              onClick={() => setIsNewAnnouncementOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Broadcast New Circular</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-indigo-200 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-800'
                          : ann.priority === 'important'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {ann.priority} Priority
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{ann.date}</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900">{ann.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-800">{ann.author}</span>
                    <span className="block text-[11px] text-slate-400">{ann.authorRole}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700 text-[11px]">
                      {ann.targetAudience}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">
                      {ann.readByCount} Parent Views
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Circular Modal */}
          {isNewAnnouncementOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsNewAnnouncementOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Back"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-slate-900 text-base">Broadcast School Circular</h3>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => setIsNewAnnouncementOpen(false)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={() => setIsNewAnnouncementOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCreateAnnouncement} className="mt-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Circular Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Term 2 Examination Timetable Release"
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Target Audience</label>
                      <select
                        value={annAudience}
                        onChange={(e) => setAnnAudience(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      >
                        <option value="All Parents & Students">All Parents & Students</option>
                        <option value="Grade 9">Grade 9 Parents</option>
                        <option value="Grade 10">Grade 10 Parents</option>
                        <option value="Grade 11">Grade 11 Parents</option>
                        <option value="Grade 12">Grade 12 Parents</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                      <select
                        value={annPriority}
                        onChange={(e) => setAnnPriority(e.target.value as any)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                      >
                        <option value="normal">Normal</option>
                        <option value="important">Important</option>
                        <option value="urgent">Urgent Notice</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Announcement Content</label>
                    <textarea
                      rows={4}
                      placeholder="Provide full bulletin details, instructions, dates, and contact directions..."
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNewAnnouncementOpen(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold flex items-center space-x-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center space-x-1.5 shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish & Notify Parents</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
