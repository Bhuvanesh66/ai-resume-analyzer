import { useParams } from "react-router"
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import Navbar from "~/componenet/Navbar";

export default function ResumeFeedback() {
    const { id } = useParams();
    const { kv } = usePuterStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const result = await kv.get(`resume:${id}`);
                if (result) {
                    setData(JSON.parse(result));
                }
            } catch (error) {
                console.error("Failed to load resume data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, kv]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[url('/images/bg-main.svg')] bg-cover">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Loading results...</h2>
                </div>
            </main>
        );
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-[url('/images/bg-main.svg')] bg-cover">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <h2 className="text-2xl font-bold">No results found for this resume.</h2>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[url('/images/bg-main.svg')] bg-cover pb-12">
            <Navbar />
            <section className="max-w-4xl mx-auto px-4 mt-8">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/40">
                    <h1 className="text-3xl font-bold mb-2">Resume Analysis Results</h1>
                    <div className="mb-8 text-slate-600">
                        <p><strong>Company:</strong> {data.companyName}</p>
                        <p><strong>Role:</strong> {data.jobTitle}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h2 className="text-xl font-semibold mb-4 text-blue-900">Feedback</h2>
                            <pre className="whitespace-pre-wrap font-sans text-slate-700">
                                {typeof data.feedback === "string" 
                                    ? data.feedback 
                                    : JSON.stringify(data.feedback, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
