import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string, score: number }) => {
  const safeScore = Number.isFinite(score) ? score : 0;
  const textColor = safeScore > 70 ? "text-green-600"
    : safeScore > 49 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="resume-summary">
      <div className="category">
        <div className="flex flex-row gap-2 items-center justify-center">
          <p className="text-2xl">{title}</p>
          <ScoreBadge score={safeScore} />
        </div>
        <p className="text-2xl">
          <span className={textColor}>{safeScore}</span>/100
        </p>
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback?: any }) => {
  // guard: if feedback is not present yet, render nothing or a loader
  if (!feedback) return null;

  // safe access with fallbacks
  const overallScore = feedback.overallScore ?? feedback.overall_rating ?? feedback.score ?? 0;
  const toneScore = feedback.toneAndStyle?.score ?? feedback.toneAndStyle ?? 0;
  const contentScore = feedback.content?.score ?? feedback.content ?? feedback.content_quality ?? 0;
  const structureScore = feedback.structure?.score ?? feedback.structure ?? 0;
  const skillsScore = feedback.skills?.score ?? feedback.skills ?? 0;

  return (
    <div className="bg-white rounded-2xl shadow-md w-full">
      <div className="flex flex-row items-center p-4 gap-8">
        <ScoreGauge score={overallScore} />

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Your Resume Score</h2>
          <p className="text-sm text-gray-500">
            This score is calculated based on the variables listed below.
          </p>
        </div>
      </div>

      <Category title="Tone & Style" score={toneScore} />
      <Category title="Content" score={contentScore} />
      <Category title="Structure" score={structureScore} />
      <Category title="Skills" score={skillsScore} />
    </div>
  );
};

export default Summary;
