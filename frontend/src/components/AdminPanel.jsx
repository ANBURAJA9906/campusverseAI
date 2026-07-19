import React, { useState, useEffect } from 'react';
import { Shield, PlusCircle, CheckCircle, Database, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { useCampus } from '../context/CampusContext';

export default function AdminPanel() {
  const { backendUrl, loadStudentData } = useCampus();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [notices, setNotices] = useState([]);
  const [aiStatus, setAiStatus] = useState(null); // { geminiEnabled, model }

  const loadAiStatus = async () => {
    try {
      const res = await fetch(`${backendUrl}/ai/status`);
      const data = await res.json();
      setAiStatus(data);
    } catch (err) {
      setAiStatus(null);
    }
  };

  const loadNotices = async () => {
    try {
      const response = await fetch(`${backendUrl}/student`);
      const data = await response.json();
      // We can grab seeded announcements or let server send them, 
      // but let's query backend /student which has notifications or load announcements.
      // Wait, let's fetch notice lists
      const res = await fetch(`${backendUrl}/agent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: "Summarize today's college updates" })
      });
      const chatResult = await res.json();
      if (chatResult.data && chatResult.data.announcements) {
        setNotices(chatResult.data.announcements);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotices();
    loadAiStatus();
  }, []);

  const handleUploadAnnouncement = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${backendUrl}/admin/announcement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category })
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTitle('');
        setContent('');
        loadNotices();
        loadStudentData(); // sync main student dashboard notices
      } else {
        setError('Failed to upload announcement');
      }
    } catch (err) {
      setError('Connection issue with Express backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="text-red-400 w-7 h-7" />
          <div>
            <h2 className="text-xl font-bold text-white">Central Admin Dashboard</h2>
            <p className="text-xs text-gray-400">Campus administration, announcement pipelines, and SQL records orchestration.</p>
          </div>
        </div>

        {aiStatus && (
          <div
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wide ${
              aiStatus.geminiEnabled
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}
            title={aiStatus.geminiEnabled ? `Live calls to ${aiStatus.model}` : 'No GEMINI_API_KEY configured — using rule-based fallback'}
          >
            <Sparkles className="w-3 h-3" />
            <span>{aiStatus.geminiEnabled ? `Gemini Live · ${aiStatus.model}` : 'Gemini Fallback Mode'}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleUploadAnnouncement} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <PlusCircle className="text-cyan-400 w-4.5 h-4.5" />
            <span>Publish New Notice (Gemini-Summarized)</span>
          </h3>

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center space-x-2 animate-bounce">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Notice uploaded! Gemini auto-summarized and synced to student dashboards.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide">Notice Title</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. DBMS Lab Assessment Schedule"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              <option value="general">General Notice</option>
              <option value="academic">Academic & Exams</option>
              <option value="placement">Placement Cell</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 uppercase tracking-wide">Notice Description</label>
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              placeholder="Provide full notice details here. Gemini will auto-summarize it for the student digest..."
              rows="4"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 resize-none"
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? 'Processing & Summarizing...' : 'Upload Notice & Sync'}
          </button>
        </form>

        {/* Existing Announcements */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Seeded SQL Announcements</span>
            <RefreshCw onClick={loadNotices} className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
          </h3>
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {notices.map((notice, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 uppercase tracking-wider font-mono">
                    {notice.category}
                  </span>
                  <span className="text-gray-500">Live</span>
                </div>
                <p className="font-bold text-xs text-white leading-tight mt-1">{notice.title}</p>
                <p className="text-[10px] text-gray-400 leading-relaxed">{notice.content}</p>
                <div className="text-[9px] bg-slate-900 border border-white/5 p-2 rounded text-cyan-400 italic">
                  <strong>Gemini Summary:</strong> {notice.summarized}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
