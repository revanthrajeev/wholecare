import { isStaff } from "@/lib/auth";

// Who may see a case: its owner, staff, and hospitals the patient chose to send it to.
export function canViewCase(user, c) {
  if (!user || !c) return false;
  if (isStaff(user)) return true;
  if (user.role === "patient") return c.ownerId === user.id;
  if (user.role === "hospital") return (c.sentToHospitals || []).includes(user.hospitalId);
  return false;
}

export const isOwner = (user, c) => Boolean(user && c && user.role === "patient" && c.ownerId === user.id);
export const isCaseHospital = (user, c) => Boolean(user && c && user.role === "hospital" && (c.sentToHospitals || []).includes(user.hospitalId));

// What a hospital sees: no other hospitals' quotes, statuses, staff notes or family-link token.
export function caseForHospital(c, hospitalId) {
  const { share, hospitalStatus, staffNotes, ...rest } = c;
  return {
    ...rest,
    hospitalNotes: (c.hospitalNotes || []).filter((n) => n.hospitalId === hospitalId),
    myStatus: hospitalStatus?.[hospitalId]?.status || "new",
    sentToHospitals: [hospitalId],
  };
}

export function caseForPatient(c) {
  const { hospitalNotes, staffNotes, ...rest } = c;
  return rest;
}

export function caseForViewer(user, c) {
  if (isStaff(user)) return c;
  if (user.role === "hospital") return caseForHospital(c, user.hospitalId);
  return caseForPatient(c);
}

export function canSeeConsultation(user, c) {
  if (!user || !c) return false;
  return isStaff(user) || c.ownerId === user.id || (user.role === "hospital" && user.hospitalId === c.hospitalId);
}
