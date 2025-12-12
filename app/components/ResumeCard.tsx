import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {useEffect, useState} from "react";
import {usePuterStore} from "~/lib/puter";

const ResumeCard = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {
    const { fs } = usePuterStore();
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            if (!imagePath) return;

            // If the image is a public asset (in /images) or an absolute URL, use it directly
            if (imagePath.startsWith('/') || imagePath.startsWith('http')) {
                // Use public path directly for local assets
                if (imagePath.startsWith('/images') || imagePath.startsWith('http')) {
                    setResumeUrl(imagePath);
                    return;
                }
            }

            // Otherwise attempt to read from the Puter FS; on failure, fall back to the original path
            try {
                const blob = await fs.read(imagePath);
                if (blob) {
                    const url = URL.createObjectURL(new Blob([blob]));
                    setResumeUrl(url);
                    return;
                }
            } catch (err) {
                console.error('Failed to read image from fs, falling back to path:', err);
            }

            // Fallback
            setResumeUrl(imagePath);
        }

        loadResume();
    }, [imagePath, fs]);

    return (
        <Link to={`/resume/${id}`} className="resume-card animate-in fade-in duration-1000">
            <div className="resume-card-header">
                <div className="flex flex-col gap-2">
                    {companyName && <h2 className="!text-black font-bold break-words">{companyName}</h2>}
                    {jobTitle && <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>}
                    {!companyName && !jobTitle && <h2 className="!text-black font-bold">Resume</h2>}
                </div>
                <div className="flex-shrink-0">
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>
            {resumeUrl && (
                <div className="gradient-border animate-in fade-in duration-1000">
                    <div className="w-full h-full">
                        <img
                            src={resumeUrl}
                            alt="resume"
                            className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
                        />
                    </div>
                </div>
                )}
        </Link>
    )
}
export default ResumeCard