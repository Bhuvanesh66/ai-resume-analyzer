import { useParams, useNavigate } from "react-router"
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import Navbar from "~/componenet/Navbar";

export const meta = () => {
    return [
        { title: "Resumind | Resume Feedback" },
        { name: "description", content: "Resume Feedback" },
    ];
}

// Helper to determine status badge based on score
const getStatusBadge = (score: number) => {
    if (score >= 80) return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-100/60 text-emerald-500">Strong</span>;
    if (score >= 50) return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-100/60 text-orange-500">Good Start</span>;
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-pink-100/60 text-pink-500">Needs work</span>;
}

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-orange-500";
    return "text-pink-500";
}

// SVG Circular Progress (Semi-circle)
const CircularProgress = ({ score, issuesCount = 0 }: { score: number, issuesCount?: number }) => {
    const radius = 40;
    const circumference = Math.PI * radius; // Half circle
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <div className="relative inline-flex flex-col items-center justify-center">
            <svg viewBox="0 0 100 55" className="w-32 h-[4.5rem] transform">
                {/* Background Track */}
                <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    className="text-pink-100/50"
                />
                {/* Progress Track */}
                <path
                    d="M 10 45 A 40 40 0 0 1 90 45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="text-pink-400 transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute top-8 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-bold text-slate-800 leading-none tracking-tight">{score}/<span className="text-base text-slate-400 font-medium">100</span></span>
                <span className="text-[10px] text-slate-400 mt-1">{issuesCount > 0 ? `${issuesCount} issues` : '0 issues'}</span>
            </div>
        </div>
    );
};

// Accordion Component
const Accordion = ({ title, score, tips }: { title: string, score: number, tips: any[] }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Determine icon color based on score
    const colorClass = score >= 80 ? 'text-emerald-500 bg-emerald-50' : score >= 50 ? 'text-orange-500 bg-orange-50' : 'text-pink-500 bg-pink-50';
    const textClass = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-orange-500' : 'text-pink-500';

    return (
        <div className="border border-slate-200/60 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center justify-between p-5 bg-white focus:outline-none"
            >
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 ${colorClass} rounded-md`}>
                        {score >= 80 ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                        ) : score >= 50 ? (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span>{score}/100</span>
                    </div>
                </div>
                <div className="text-slate-400">
                    <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            
            {isOpen && (
                <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                    <div className="space-y-4 mt-4">
                        {tips?.length > 0 ? tips.map((tip, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="mt-1 flex-shrink-0">
                                    {tip.type === "good" ? (
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-orange-400">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{tip.tip}</h4>
                                    {tip.explanation && <p className="text-sm text-slate-600 mt-1">{tip.explanation}</p>}
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 italic">No specific tips provided for this section.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export default function ResumeFeedback() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { kv, fs } = usePuterStore();
    
    const [data, setData] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                // Fetch analysis JSON
                const result = await kv.get(`resume:${id}`);
                if (result) {
                    const parsedData = JSON.parse(result);
                    setData(parsedData);
                    
                    // Fetch background image blob to display preview
                    if (parsedData.imagePath) {
                        try {
                            const blob = await fs.read(parsedData.imagePath);
                            if (blob) {
                                const url = URL.createObjectURL(blob as Blob);
                                setImageUrl(url);
                            }
                        } catch (imgErr) {
                            console.error("Failed to load image blob:", imgErr);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to load resume data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        
        // Cleanup object URL
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [id, kv, fs]); 
    // ^ Disabled exhaustive-deps warning for imageUrl to prevent unmount recreation loops

    if (loading) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="flex justify-center items-center h-[60vh] flex-col gap-4">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-pink-400 rounded-full animate-spin"></div>
                    <h2 className="text-xl font-medium text-slate-600">Loading your comprehensive results...</h2>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-50">
                <div className="flex justify-center items-center h-[60vh] flex-col gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">No results found for this resume.</h2>
                    <button onClick={() => navigate('/upload')} className="primary-button mt-4 px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md transition-colors">Upload a Resume</button>
                </div>
            </main>
        );
    }

    const { feedback } = data;
    const isFeedbackValid = typeof feedback === "object" && feedback !== null && feedback.ATS;

    const issuesCount = (feedback.toneAndStyle?.tips?.length || 0) + 
                        (feedback.content?.tips?.length || 0) + 
                        (feedback.structure?.tips?.length || 0) + 
                        (feedback.skills?.tips?.length || 0);

    return (
        <main className="min-h-screen bg-white">
            {/* Top Navigation Bar style from screenshot */}
            <div className="border-b border-slate-200/80 px-4 py-3 flex items-center justify-between bg-white w-full">
                <div className="flex items-center gap-3 text-[13px]">
                    <button onClick={() => navigate('/upload')} className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-semibold transition-colors border border-slate-200 rounded-md px-3 py-1.5 shadow-sm hover:bg-slate-50 bg-white">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        Back to homepage
                    </button>
                    <span className="text-slate-500 ml-1">{data.jobTitle || 'Role'}</span>
                    <span className="text-slate-300 font-light">&gt;</span>
                    <span className="font-bold tracking-tight text-slate-800">Resume Review</span>
                </div>
                <div className="flex items-center">
                     <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden ring-1 ring-slate-100 shadow-sm cursor-pointer border border-slate-300">
                         <img src={`https://ui-avatars.com/api/?name=${data.companyName}&background=E2E8F0&color=475569`} alt="Avatar" className="w-full h-full object-cover" />
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] min-h-[calc(100vh-140px)]">
                {/* Left Column: Resume Image Preview */}
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50 p-8 lg:p-12 flex items-start justify-center overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-2xl ring-1 ring-slate-900/5 transition-transform hover:scale-[1.02] duration-300">
                         {imageUrl ? (
                             <img src={imageUrl} alt="Resume Preview" className="w-full h-auto rounded-xl" />
                         ) : (
                             <div className="aspect-[1/1.4] w-full bg-slate-100 rounded-xl flex items-center justify-center flex-col gap-3 text-slate-400">
                                 <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                 <span>Preview not available</span>
                             </div>
                         )}
                    </div>
                </div>

                {/* Right Column: AI Feedback Content */}
                <div className="p-8 lg:p-12 overflow-y-auto bg-white/50">
                    <div className="max-w-3xl mx-auto space-y-8">
                        
                        <h1 className="text-4xl font-bold tracking-tight text-slate-900">Resume Review</h1>
                        
                        {!isFeedbackValid ? (
                           <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-800">
                               <h2 className="text-lg font-bold mb-2">Invalid AI Response Format</h2>
                               <pre className="whitespace-pre-wrap text-sm">{typeof feedback === 'string' ? feedback : JSON.stringify(feedback)}</pre>
                           </div>
                        ) : (
                            <>
                                {/* Main Score Card Container */}
                                <div className="border border-slate-200/60 rounded-2xl p-8 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex flex-col sm:flex-row gap-6 items-center border-b border-slate-100 pb-8 mb-8">
                                        <div className="flex-shrink-0">
                                            <CircularProgress score={feedback.overallScore || 0} issuesCount={issuesCount} />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Resume Score</h2>
                                            <p className="text-slate-500 leading-relaxed max-w-sm text-sm font-medium">This score is calculated based on the variables listed below.</p>
                                        </div>
                                    </div>

                                    {/* Sub-scores list mimicking screenshot */}
                                    <div className="space-y-6">
                                        {[
                                            { label: "Tone & Style", data: feedback.toneAndStyle },
                                            { label: "Content", data: feedback.content },
                                            { label: "Structure", data: feedback.structure },
                                            { label: "Skills", data: feedback.skills }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-medium text-slate-700">{item.label}</span>
                                                    {getStatusBadge(item.data?.score || 0)}
                                                </div>
                                                <span className={`font-bold text-lg ${getScoreColor(item.data?.score || 0)}`}>
                                                    {item.data?.score || 0}<span className="text-slate-400 text-sm font-medium">/100</span>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ATS Dedicated Score Box matching screenshot */}
                                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl p-7 mt-8 border border-emerald-100/30 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                    <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200/50 border border-emerald-400/20">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h3 className="text-[17px] font-bold tracking-tight text-slate-900">ATS Score - {feedback.ATS?.score || 0}/100</h3>
                                    </div>
                                    
                                    <p className="font-semibold text-slate-800 mb-4">How well does your resume pass through Applicant Tracking Systems?</p>
                                    <p className="text-slate-600 mb-5 text-sm">Your resume was scanned exactly like an employer's ATS system would. Here's how it performed against the <strong>{data.jobTitle}</strong> description:</p>
                                    
                                    <div className="space-y-3 mb-6 bg-white/60 p-5 rounded-xl border border-emerald-100/50">
                                        {feedback.ATS?.tips?.map((tip: any, idx: number) => (
                                            <div key={idx} className="flex gap-3 text-sm font-medium text-slate-700">
                                                {tip.type === "good" ? (
                                                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                                )}
                                                <span dangerouslySetInnerHTML={{__html: tip.tip.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900">$1</strong>')}} />
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <p className="text-[13px] font-medium text-slate-600 mt-6">Want a better score? Improve your resume by applying the suggestions listed below.</p>
                                    </div>
                                </div>

                                {/* Detail Accordions */}
                                <div className="space-y-4 pt-4 mt-6">
                                    <Accordion title="Tone & Style" score={feedback.toneAndStyle?.score || 0} tips={feedback.toneAndStyle?.tips || []} />
                                    <Accordion title="Content" score={feedback.content?.score || 0} tips={feedback.content?.tips || []} />
                                    <Accordion title="Structure" score={feedback.structure?.score || 0} tips={feedback.structure?.tips || []} />
                                    <Accordion title="Skills" score={feedback.skills?.score || 0} tips={feedback.skills?.tips || []} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
