// ...existing code...
import type { Route } from "./+types/home";
import Navbar from "~/components/navbar";
import { resumes } from "../../constants/index";
import ResumeCard from "~/components/ResumeCard";
import { useLocation, useNavigate } from "react-router";
import { useEffect } from "react";
// import useAuth or the correct authentication hook/context
import useAuth from "./auth";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job !" },
  ];
}
export default function Home() {
  const { isLoading, auth } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // wait until auth state finishes loading
    if (!isLoading && !auth.isAuthenticated) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth?next=${next}`, { replace: true });
    }
    // Add logic here if needed when authenticated
  }, [isLoading, auth.isAuthenticated, location.pathname, location.search, navigate]);

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1 className="text-black p-2 m-2 justify-center"> Track Your Applications $ Resume Ratings</h1>
        <h2 className="text-black p-2 m-2"> Review your submissions and check Ai-powered feedback</h2>
      </div>

      {resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </section>
  </main>
}