import React from 'react';
import { Award, Users, Lightbulb, Bell, CheckCircle, ArrowRight } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';

export default function HackathonWidget({ data }) {
  const { sendChatMessage } = useCampus();

  if (!data) return null;

  const { hackathons, teammates, projectIdeas } = data;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full">
            Event Intelligence
          </span>
          <h3 className="text-xl font-bold text-white mt-1">Hackathon Discovery Hub</h3>
        </div>
      </div>

      {/* Hackathons list */}
      <div className="space-y-3">
        <div className="flex items-center space-x-1.5">
          <Award className="text-cyan-400 w-4.5 h-4.5" />
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Hackathons</h4>
        </div>
        <div className="space-y-3">
          {hackathons.map((hack) => (
            <div 
              key={hack.id} 
              className={`bg-white/5 border p-4 rounded-xl space-y-3 relative overflow-hidden transition-all ${
                hack.closingSoon ? 'border-amber-500/30 bg-amber-500/[0.02]' : 'border-white/5'
              }`}
            >
              {hack.closingSoon && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-bold text-[9px] px-2 py-0.5 uppercase tracking-wide flex items-center space-x-0.5">
                  <Bell className="w-2.5 h-2.5" />
                  <span>Closing Soon</span>
                </div>
              )}
              <div className="flex justify-between items-start pr-12">
                <div>
                  <h4 className="font-bold text-white text-sm">{hack.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hack.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/5 pt-3">
                <div className="text-[10px] text-gray-400">
                  <span className="mr-3">Location: <strong className="text-white">{hack.location}</strong></span>
                  <span>Deadline: <strong className={hack.closingSoon ? 'text-amber-400' : 'text-white'}>{new Date(hack.deadline).toLocaleString()}</strong></span>
                </div>
                <button 
                  onClick={() => sendChatMessage(`Join me to the ${hack.name.toLowerCase().includes('ai') ? 'AI' : 'Smart Campus'} Club`)}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-lg text-[10px] shadow transition-all flex items-center space-x-1"
                >
                  <span>Quick Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Teammates & Suggested Projects */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        {/* Suggested Teammates */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5">
            <Users className="text-purple-400 w-4.5 h-4.5" />
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggested Teammates</h4>
          </div>
          <div className="space-y-3 text-xs">
            {teammates.map((mate, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1.5 relative">
                <div className="absolute top-2.5 right-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[9px] font-semibold px-1.5 py-0.5 rounded">
                  {mate.matchPercentage}% Match
                </div>
                <div>
                  <p className="font-bold text-white text-[11px]">{mate.name}</p>
                  <p className="text-[9px] text-gray-400">{mate.department} | Year {mate.year}</p>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">{mate.matchReason}</p>
                <div className="text-[9px] bg-purple-950/20 border border-purple-500/10 p-1.5 rounded text-purple-300 font-medium">
                  Skills: {mate.skills}
                </div>
                <button 
                  onClick={() => alert(`Invite sent to ${mate.name}!`)}
                  className="w-full text-center py-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded font-semibold text-[10px] text-gray-300 hover:text-white transition-colors"
                >
                  Send Team Invite
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Project Ideas */}
        <div className="space-y-3">
          <div className="flex items-center space-x-1.5">
            <Lightbulb className="text-amber-400 w-4.5 h-4.5" />
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">AI Brainstormed Ideas</h4>
          </div>
          <div className="space-y-3 text-xs">
            {projectIdeas.map((idea, idx) => (
              <div key={idx} className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1.5">
                <p className="font-bold text-white text-[11px]">{idea.title}</p>
                <p className="text-[10px] text-gray-400 leading-tight">{idea.description}</p>
                <div className="text-[9px] bg-slate-900 border border-white/5 p-1 rounded font-mono text-cyan-300">
                  Tech: {idea.techStack}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
