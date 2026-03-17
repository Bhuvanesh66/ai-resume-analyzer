import { useState, type FormEvent } from "react"
import FileUploader from "~/componenet/fileUploader"
import Navbar from "~/componenet/Navbar"
import { usePuterStore } from "~/lib/puter"
import { useNavigate } from "react-router"
import { convertPdfToImage } from "~/lib/pdf2img"
import { generateUUID } from "~/utils"
import { prepareInstructions } from "~/constants"

const Upload = () => {
    const {auth,isLoading,fs,ai,kv} = usePuterStore()
    const navigate = useNavigate()
    const [isProcessing, setIsProcessing] = useState(false)
    const [statusText, setStatusText] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const handleFile = (file: File) => {
        setFile(file)
    }
    const handleAnalyze = async({companyName, jobTitle, jobDescription, file}: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        try {
            setIsProcessing(true)
            setStatusText("Analyzing your resume...")
            const uploadedfile = await fs.upload([file])
            if(!uploadedfile){
                alert("Failed to upload file")
                setIsProcessing(false)
                return
            }
            
            setStatusText("Generating feedback...")
            const imageFile = await convertPdfToImage(file);
            if(!imageFile || !imageFile.file){
                setStatusText("Error in converting pdf to image: " + (imageFile?.error || ""))
                setIsProcessing(false)
                return
            }
            
            setStatusText("uploading the image...")
            const uploadedImage = await fs.upload([imageFile.file])
            if(!uploadedImage){
                setStatusText("Failed to upload image")
                setIsProcessing(false)
                return
            } 
            
            setStatusText("Generating feedback...")
            const uuid = generateUUID()
            const data = {
                id:uuid,
                resumePath:uploadedfile.path,
                imagePath:uploadedImage.path,
                companyName,
                jobTitle,
                jobDescription,
                feedback:"" as any
            }
            await kv.set(`resume:${uuid}`,JSON.stringify(data))
            
            setStatusText("Analyzing your resume...")
            const feedback = await ai.feedback(
                uploadedImage.path,
                prepareInstructions({jobTitle, jobDescription})
            )   
            
            if(!feedback){
                setStatusText("Failed to generate feedback") 
                setIsProcessing(false)
                return;
            }
            
            const feedbackText = typeof feedback.message.content === "string" ? feedback.message.content : feedback.message.content[0].text
            setStatusText("Feedback generated")      
            
            // Safe JSON parse in case AI wraps response in markdown block like ```json ... ```
            let parsedFeedback;
            try {
                const cleanText = feedbackText.replace(/```json/gi, "").replace(/```/g, "").trim();
                parsedFeedback = JSON.parse(cleanText);
            } catch (e) {
                console.error("Failed to parse JSON feedback:", feedbackText, e);
                setStatusText("Failed to parse AI response");
                setIsProcessing(false);
                return;
            }
            
            data.feedback = parsedFeedback;
            await kv.set(`resume:${uuid}`,JSON.stringify(data))
            navigate(`/resume/${uuid}`)
        } catch (error) {
            console.error("[handleAnalyze] Caught fatal error:", error);
            setStatusText("An unexpected error occurred.");
            setIsProcessing(false);
        }
    }
    const handleUpload = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form  = e.currentTarget
        const formData = new FormData(form);
        const companyName = formData.get("company-name") as string;
        const jobTitle = formData.get("job-title") as string;
        const jobDescription = formData.get("job-description") as string;
        
        if(!file){
            alert("Please upload a resume")
            return
        }
        // setIsProcessing(true)
        // setStatusText("Processing your resume...")
        handleAnalyze({companyName, jobTitle, jobDescription, file})
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar></Navbar>
            <section className="main-section">
                <div className="page-heading">
                    <h1>Smart Feedback for your dream job</h1>
                    {
                        isProcessing ? (
                            <>
                                <h2>{statusText}</h2>
                                <img src="/images/resume-scan.gif" alt="resume-scan" className="w-full " />
                            </>
                        ) : (
                            <h2>Drop your resume here for an ATS score and improvement</h2>
                        )
                    }
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleUpload} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" id="company-name" name="company-name" placeholder="Enter your company name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" id="job-title" name="job-title" placeholder="Job Title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} id="job-description" name="job-description" placeholder="Job Description" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={setFile}></FileUploader>
                            </div>
                            <button className="primary-button" type="submit"><p>Analyse Resume</p></button>
                        </form>


                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload 