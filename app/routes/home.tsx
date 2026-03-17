import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/componenet/Navbar";
import { resumes } from "~/constants";
import ResumeCard from "~/componenet/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback to your dream job" },
  ];
}

export default function Home() {
    const {isLoading, auth, puterReady} = usePuterStore();
    const navigate = useNavigate();
    const [resumesList, setResumesList] = useState<any[]>([]);
    const [isLoadingResumes, setIsLoadingResumes] = useState(true);

    useEffect(() => {
       // Force a check if puter has initialized
       const check = setInterval(() => {
           const state = usePuterStore.getState();
           if (!state.isLoading && state.puterReady && !state.auth.isAuthenticated) {
               clearInterval(check);
               navigate('/auth?next=/');
           }
       }, 500);

       if(!isLoading && puterReady && !auth.isAuthenticated){
        clearInterval(check);
        navigate('/auth?next=/');
       }

       return () => clearInterval(check);
    }, [isLoading, auth.isAuthenticated, puterReady, navigate]);

    useEffect(() => {
        const fetchResumes = async () => {
            if (!puterReady || !auth.isAuthenticated) return;
            setIsLoadingResumes(true);
            try {
                const keys = await usePuterStore.getState().kv.list("resume:*", true);
                if (keys && Array.isArray(keys)) {
                    const parsedResumes = keys.map((item: any) => {
                        try {
                            return JSON.parse(typeof item === 'string' ? item : item.value);
                        } catch (e) {
                            console.error("Failed to parse resume data for key", item.key, e);
                            return null;
                        }
                    }).filter(Boolean);
                    
                    // Deduplicate by ID just in case Puter KV returns overlapping keys
                    const uniqueResumes = Array.from(new Map(parsedResumes.map(r => [r.id, r])).values());
                    
                    // Sort descending (assuming ids are UUIDs which might not strictly order, but let's reverse to show latest first based on KV list order if it's chronological, though UUIDs aren't)
                    setResumesList(uniqueResumes.reverse());
                }
            } catch (error) {
                console.error("Failed to fetch resumes from KV", error);
            } finally {
                setIsLoadingResumes(false);
            }
        };

        fetchResumes();
    }, [puterReady, auth.isAuthenticated]);

    const handleWipe = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await usePuterStore.getState().kv.del(`resume:${id}`);
            setResumesList(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to wipe resume", error);
        }
    };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar></Navbar>
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>
      </section>
      
      {isLoadingResumes && puterReady ? (
        <div className="flex justify-center items-center py-12">
           <div className="w-8 h-8 border-4 border-slate-200 border-t-pink-400 rounded-full animate-spin"></div>
        </div>
      ) : resumesList.length > 0 ? (
        <div className="resumes-section">
          {resumesList.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} onWipe={handleWipe} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">No recent Resume uploaded</h3>
             <p className="text-slate-500 mb-8 max-w-md">You haven't uploaded any resumes yet. Upload a resume to get instantly analyzed with our AI tool.</p>
             <button onClick={() => navigate('/upload')} className="primary-button bg-pink-500 hover:bg-pink-600 text-white transition-colors">Upload a Resume</button>
        </div>
      )}
    </main>
  );
}
