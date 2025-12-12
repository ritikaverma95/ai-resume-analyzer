import {Link, useNavigate, useParams} from "react-router";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";

export const meta = () => ([
    { title: 'Resumind | Review ' },
    { name: 'description', content: 'Detailed overview of your resume' },
])

const Resume = () => {
    const { auth, isLoading, fs, kv } = usePuterStore();
    const { id } = useParams();
    const [imageUrl, setImageUrl] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [feedback, setFeedback] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated) navigate(`/auth?next=/resume/${id}`);
    }, [isLoading])

    useEffect(() => {
        const loadResume = async () => {
            const resume = await kv.get(`resume:${id}`);

            if(!resume) return;

            const data = JSON.parse(resume);

            const resumeBlob = await fs.read(data.resumePath);
            if(!resumeBlob) return;

            const pdfBlob = new Blob([resumeBlob], { type: 'application/pdf' });
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl);

            const imageBlob = await fs.read(data.imagePath);
            if(!imageBlob) return;
            // fs.read may return raw bytes; wrap in a Blob so URL.createObjectURL works
            const imgBlob = new Blob([imageBlob], { type: 'image/png' });
            const imageUrl = URL.createObjectURL(imgBlob);
            setImageUrl(imageUrl);

            setFeedback(data.feedback as any);
            console.log({resumeUrl, imageUrl, feedback: data.feedback });
        }

        loadResume();
    }, [id]);

    return (
        <main className="!pt-0">
            <nav className="resume-nav">
                <Link to="/" className="back-button">
                    <img src="/icons/back.svg" alt="logo" className="w-2.5 h-2.5" />
                    <span className="text-gray-800 text-sm font-semibold">Back to Homepage</span>
                </Link>
            </nav>
            <div className="flex flex-row w-full max-lg:flex-col-reverse">
                <section className="feedback-section bg-[url('/images/bg-small.svg') bg-cover h-[100vh] sticky top-0 items-center justify-center">
                    {imageUrl && resumeUrl && (
                        <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                            <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={imageUrl}
                                    className="w-full h-full object-contain rounded-2xl"
                                    title="resume"
                                />
                            </a>
                        </div>
                    )}
                </section>
                <section className="feedback-section">
                    <h2 className="text-4xl !text-black font-bold">Resume Review</h2>
                    {feedback ? (
                        <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                            <ATS
                                score={Math.round((feedback.ats_compatibility ?? 0) * 10)}
                                suggestions={(feedback.improvement_suggestions?.ats_optimization ?? []).map((tip: string) => ({
                                    type: "improve" as const,
                                    tip,
                                }))}
                            />
                            {feedback.summary && (
                                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                                    <h3 className="text-2xl font-bold text-blue-900 mb-4">Summary</h3>
                                    <p className="text-blue-800">{feedback.summary}</p>
                                </div>
                            )}
                            {feedback.strengths && feedback.strengths.length > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-green-900 mb-4">Strengths</h3>
                                    <ul className="space-y-2">
                                        {feedback.strengths.map((strength: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <img src="/icons/check.svg" alt="strength" className="w-5 h-5 mt-1 flex-shrink-0" />
                                                <span className="text-green-800">{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-red-900 mb-4">Areas for Improvement</h3>
                                    <ul className="space-y-2">
                                        {feedback.weaknesses.map((weakness: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3">
                                                <img src="/icons/warning.svg" alt="weakness" className="w-5 h-5 mt-1 flex-shrink-0" />
                                                <span className="text-red-800">{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {feedback.keyword_analysis && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {feedback.keyword_analysis.present && feedback.keyword_analysis.present.length > 0 && (
                                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                                            <h3 className="text-xl font-bold text-green-900 mb-4">Keywords Present</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {feedback.keyword_analysis.present.map((keyword: string, idx: number) => (
                                                    <span key={idx} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {feedback.keyword_analysis.missing && feedback.keyword_analysis.missing.length > 0 && (
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                                            <h3 className="text-xl font-bold text-red-900 mb-4">Missing Keywords</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {feedback.keyword_analysis.missing.map((keyword: string, idx: number) => (
                                                    <span key={idx} className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm">
                                                        {keyword}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <img src="/images/resume-scan-2.gif" className="w-full" />
                    )}
                </section>
            </div>
        </main>
    )
}
export default Resume;