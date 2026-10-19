// Browser-safe constants shared by server routes and client components.
export const CASE_STAGES = [
  "Submitted",
  "Under Review",
  "Sent to Hospitals",
  "Quotation Received",
  "Confirmed",
  "In Treatment",
  "Recovery",
  "Completed",
];

export const STAGE_INFO = {
  Submitted: { tone: "neutral", next: "A coordinator will review your case within one working day." },
  "Under Review": { tone: "sun", next: "Your coordinator or specialist is reviewing your records." },
  "Sent to Hospitals": { tone: "brand", next: "Hospitals are reviewing your records and preparing quotes." },
  "Quotation Received": { tone: "brand", next: "Compare quotes and lock the one you want." },
  Confirmed: { tone: "success", next: "Plan travel: visa letter, flights, stay and airport pickup." },
  "In Treatment": { tone: "success", next: "Your hospital team will post updates here." },
  Recovery: { tone: "success", next: "Follow your recovery plan and log how you're feeling." },
  Completed: { tone: "neutral", next: "Your case is complete. Share a review to help other patients." },
};

export const HOSPITAL_PIPELINE = [
  { id: "new", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "quoted", label: "Quoted" },
  { id: "accepted", label: "Accepted" },
  { id: "in_treatment", label: "In treatment" },
  { id: "discharged", label: "Discharged" },
  { id: "lost", label: "Closed" },
];

export const HOSPITAL_UPDATES = [
  { id: "admitted", label: "Patient admitted", stage: "In Treatment" },
  { id: "procedure_done", label: "Procedure completed", stage: "In Treatment" },
  { id: "discharged", label: "Patient discharged", stage: "Recovery" },
];

export const FILE_CATEGORIES = [
  { id: "report", label: "Medical report" },
  { id: "scan", label: "Imaging / scan" },
  { id: "lab", label: "Lab results" },
  { id: "prescription", label: "Prescription" },
  { id: "discharge", label: "Discharge summary" },
  { id: "other", label: "Other" },
];

export const ALLOWED_UPLOAD_TYPES = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "application/dicom": ".dcm",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
};
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

export const DESTINATION_CHOICES = ["India", "Turkey", "Thailand", "Singapore", "Mexico", "UAE", "Malaysia", "Not sure yet"];
