import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import Navbar from "~/componenet/Navbar";
import { resumes } from "~/constants";
import ResumeCard from "~/componenet/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback to your dream job" },
  ];
}

export default function Home() {
    const {isLoading, auth, puterReady} = usePuterStore();
    const navigate = useNavigate();

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
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar></Navbar>
      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications and Resume Ratings</h1>
          <h2>Review your submissions and check AI-powered feedback.</h2>
        </div>
      </section>
      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume}/>
          ))}
        </div>
      )}
    </main>
  );
}
