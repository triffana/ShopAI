import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Copy, ExternalLink, X } from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SetupNotice: React.FC = () => {
  const isConfigured = isSupabaseConfigured();
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);

  if (isConfigured || dismissed) return null;

  const copySqlHint = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#12372A] text-white border-b border-[#1F6F50] px-4 py-3 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#B7F34A]/20 text-[#B7F34A] rounded-lg shrink-0 border border-[#B7F34A]/30">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-white flex items-center gap-2">
              <span>Connect Your Supabase Database</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#B7F34A] text-[#12372A] font-mono font-bold">
                .env Required
              </span>
            </p>
            <p className="text-[#F7F4EA]/80 text-xs mt-0.5">
              Add your <code className="text-[#B7F34A] bg-[#1F6F50]/40 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-[#B7F34A] bg-[#1F6F50]/40 px-1 py-0.5 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> to <code className="text-white bg-[#1F6F50]/40 px-1 py-0.5 rounded">.env.local</code>.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={copySqlHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F6F50] hover:bg-[#1F6F50]/80 text-white text-xs font-medium border border-[#DDE4DC]/20 transition"
          >
            {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#B7F34A]" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied File Path!' : 'schema.sql'}
          </button>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B7F34A] hover:bg-[#a3e038] text-[#12372A] text-xs font-bold shadow transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Supabase Console
          </a>

          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-[#1F6F50] transition"
            title="Dismiss notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
