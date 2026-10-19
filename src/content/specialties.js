// Canonical specialty names. Hospitals and doctors store `name`; pages link by `slug`.
export const SPECIALTIES = [
  { slug: "cardiac-surgery", name: "Cardiac Surgery", icon: "HeartPulse", blurb: "Bypass, valve repair and interventional cardiology" },
  { slug: "orthopedics", name: "Orthopedics", icon: "Bone", blurb: "Joint replacement, arthroscopy and sports injuries" },
  { slug: "spine-surgery", name: "Spine Surgery", icon: "Activity", blurb: "Fusion, decompression and minimally invasive spine care" },
  { slug: "oncology", name: "Oncology", icon: "Ribbon", blurb: "Tumour boards, chemotherapy, radiotherapy and surgery" },
  { slug: "transplant-surgery", name: "Transplant Surgery", icon: "HandHeart", blurb: "Living-donor liver and kidney transplant programmes" },
  { slug: "neurosurgery", name: "Neurosurgery", icon: "Brain", blurb: "Brain and spinal surgery, neuro-navigation" },
  { slug: "fertility-ivf", name: "Fertility (IVF)", icon: "Baby", blurb: "IVF, ICSI, egg freezing and fertility preservation" },
  { slug: "bariatric-surgery", name: "Bariatric Surgery", icon: "Scale", blurb: "Gastric sleeve, bypass and revision surgery" },
  { slug: "ophthalmology", name: "Ophthalmology", icon: "Eye", blurb: "Cataract, lens replacement and refractive surgery" },
  { slug: "dental", name: "Dental", icon: "Smile", blurb: "Implants, All-on-4 and full-mouth restoration" },
  { slug: "cosmetic-surgery", name: "Cosmetic Surgery", icon: "Sparkles", blurb: "Rhinoplasty, body contouring and facial surgery" },
  { slug: "hair-restoration", name: "Hair Restoration", icon: "Scissors", blurb: "FUE and DHI hair transplants" },
];

export function specialtyByName(name) {
  return SPECIALTIES.find((s) => s.name === name) || null;
}

export function specialtyBySlug(slug) {
  return SPECIALTIES.find((s) => s.slug === slug) || null;
}
