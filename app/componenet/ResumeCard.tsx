import React, { Component } from "react";
import { Link } from "react-router";
import ScoreCircle from "~/componenet/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({ resume, onWipe }: { resume: any, onWipe?: (id: string, e: React.MouseEvent) => void }) => {
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
     let url: string | null = null;
     if (resume.imagePath) {
         const loadImg = async () => {
             try {
                const blob = await fs.read(resume.imagePath);
                if (blob) {
                    url = URL.createObjectURL(blob as Blob);
                    setImageUrl(url);
                }
             } catch (e) {
                console.error("Failed to load image blob for card:", e);
             }
         };
         loadImg();
     }
     return () => {
         if (url) URL.revokeObjectURL(url);
     };
  }, [resume.imagePath, fs]);

  // Use ATS score if available, otherwise fallback to overall Score
  const displayScore = resume.feedback?.ATS?.score || resume.feedback?.overallScore || 0;

  return (
    <div className="relative group resume-card animate-in fade-in duration-10000">
      {/* 
        Separated the link so it doesn't wrap the absolute button.
        The Link simply covers the background using absolute positioning to act as a hit area 
        for the whole card, but stays BELOW the z-index of the interactive buttons.
      */}
      <Link to={`/resume/${resume.id}`} className="absolute inset-0 z-0 rounded-2xl"></Link>
      
      <div className="resume-card-header items-start relative z-10 pointer-events-none">
        <div className="flex flex-col gap-1 pr-6">
          <h2 className="!text-slate-800 font-bold break-words line-clamp-1">{resume.companyName || 'Unknown Company'}</h2>
          <h3 className="text-sm font-medium text-slate-500 line-clamp-1">{resume.jobTitle || 'Role'}</h3>
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={displayScore}></ScoreCircle>
        </div>
      </div>
      
      <div className="relative z-10 gradient-border animate-in fade-in duration-1000 pointer-events-none mt-auto">
        <div className="w-full h-full bg-slate-100 flex items-center justify-center rounded-xl overflow-hidden">
          {imageUrl ? (
              <img src={imageUrl} alt="resume" className="w-full h-[350px] max-sm:h-[200px] object-cover object-top" ></img>
          ) : (
              <div className="h-[350px] max-sm:h-[200px] w-full flex items-center justify-center text-slate-400">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
          )}
        </div>
      </div>

    {onWipe && (
        <div className="absolute top-4 right-4 z-50">
        <button
          onClick={(e) => onWipe(resume.id, e)}
          className="p-2 bg-white/90 backdrop-blur rounded-full text-slate-400 hover:text-red-500 hover:bg-white shadow-sm transition-all opacity-0 group-hover:opacity-100 border border-slate-200 cursor-pointer"
          title="Wipe Resume"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        </div>
    )}
    </div>
  );
};
export default ResumeCard;
