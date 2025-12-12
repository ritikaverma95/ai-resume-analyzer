import { type FormEvent, useState } from "react";
import Navbar from "~/components/navbar";
import Fileuploader from "~/components/Fileuploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import {prepareInstructions} from "../../constants";


const Upload = () => {
    const{auth,isLoading,fs,ai,kv}=usePuterStore();
    const navigate = useNavigate();
    const[isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [file,setFile]=useState<File | null>(null);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
    
    }

    const handleAnalyze= async ({companyName,jobTitle,jobDescription,file}:{companyName:string,jobTitle:string,jobDescription:string,file:File})=>{
        setIsProcessing(true);
        setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);

    if(!uploadedFile) return setStatusText("File upload failed. Please try again.");
    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    console.log("Conversion result:", imageFile);
    if(!imageFile) return setStatusText("PDF to image conversion failed. Please try again.");
    if(!imageFile.file) {
      console.error("Image file is null. Error:", imageFile.error);
      return setStatusText("Image file is invalid. Please try again.");
    }
    setStatusText("Uploading image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if(!uploadedImage) return setStatusText("Image upload failed. Please try again.");

    setStatusText("Analyzing ...");

    const uuid =generateUUID();
    const data = {
        id: uuid,
        resumePath: uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        feedback:'',
    }
       await kv.set(`resume:${uuid}`,JSON.stringify(data));

       setStatusText("Analyzing...");

       const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle,jobDescription,AIResponseFormat:"json"})
       )
       if(!feedback) return setStatusText("AI analysis failed. Please try again.");
       const feedbackText=typeof feedback.message.content ==='string' 
       ? feedback.message.content 
       : feedback.message.content[0].text;

       data.feedback=JSON.parse(feedbackText);
       await kv.set(`resume:${uuid}`,JSON.stringify(data));
       setStatusText("Analysis complete!");
       console.log(data);
         navigate(`/resume/${uuid}`);
    }

    const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form = e.currentTarget; // form element
        const formData = new FormData(form);

        const companyName = formData.get('companyName') as string;
        const jobTitle = formData.get('jobTitle') as string;
        const jobDescription = formData.get('jobDescription') as string;
        if(!file) return setStatusText('Please upload a resume first.');

        handleAnalyze({companyName,jobTitle,jobDescription,file});
    }


    return(
        <main className="bg-url('/images/bg-main.svg') bg-cover">
            <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1> Smart feedback for your dream job</h1>
            {isProcessing ? (
                <>
                <h2> {statusText}</h2>
                <img src="/images/resume-scan.gif" className="w-full"/>
                </>
                ) :(
                    <h2> Drop your resume for an ATS score and improvment tips</h2>
                )}
                {!isProcessing && ( 
                    <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8" >
                            <div className="form-div">
                                <label htmlFor="company-name">company name</label>
                                <input type="text" id="company-name" name="companyName" placeholder="companyname" required />
                             </div>
                              <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id="job-title" name="jobTitle" placeholder="Job-Title" required />
                              </div>
                                <div className="form-div">
                                <label htmlFor="job-description">Job-Description</label>
                                <textarea rows={5} id="job-description" name="jobDescription" placeholder="Job-Description" required />
                                <div className="form-div">
                                     <label htmlFor="uploader">Upload Resume</label>
                                    <Fileuploader inputId="uploader" onFileSelect={handleFileSelect} />
                                </div>

                                <button className="primary-button" type="submit"> Analyze Resume </button>

                            </div>

                    </form>

                    )}

          </div>

        </section>
        </main>
    )
    
}

export default Upload;