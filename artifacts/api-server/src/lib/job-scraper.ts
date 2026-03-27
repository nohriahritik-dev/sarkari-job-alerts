import * as cheerio from "cheerio";
import { db, jobsTable } from "@workspace/db";
import { logger } from "./logger.js";
import { eq, isNull, and, sql } from "drizzle-orm";
import type { InsertJob } from "@workspace/db";

// ─── Anti-detection: rotating user-agents ────────────────────────────────────
const USER_AGENTS = [
  // Chrome on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 11.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  // Firefox on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  // Chrome on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  // Safari on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  // Firefox on macOS
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.4; rv:125.0) Gecko/20100101 Firefox/125.0",
  // Chrome on Linux
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
  // Android Chrome (mobile users are very common on Indian job sites)
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.60 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; Redmi Note 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 12; V2201A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
  // Samsung Internet (very popular in India)
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36",
  // iOS Safari
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  // Edge on Windows
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0",
];

const ACCEPT_LANGUAGES = [
  "en-IN,en-GB;q=0.9,en;q=0.8,hi;q=0.7",
  "hi-IN,hi;q=0.9,en-IN;q=0.8,en;q=0.7",
  "en-US,en;q=0.9,hi;q=0.8",
  "en-GB,en;q=0.9,hi-IN;q=0.8,hi;q=0.7",
  "en-IN,hi;q=0.9,en;q=0.8",
];

// Realistic referer patterns — looks like organic traffic from search
const REFERERS = [
  "https://www.google.com/search?q=government+jobs+india",
  "https://www.google.co.in/search?q=sarkari+naukri+2026",
  "https://www.google.co.in/search?q=latest+govt+jobs",
  "https://www.google.com/search?q=freejobalert+latest+jobs",
  "https://www.google.co.in/search?q=sarkari+job+alert",
  "", // direct traffic — no referer
  "", // weight towards direct
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildHeaders(): Record<string, string> {
  const ua = pickRandom(USER_AGENTS);
  const isMobile = ua.includes("Mobile") || ua.includes("Android") || ua.includes("iPhone");
  const referer = pickRandom(REFERERS);

  const headers: Record<string, string> = {
    "User-Agent": ua,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": pickRandom(ACCEPT_LANGUAGES),
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": referer ? "cross-site" : "none",
    "Sec-Fetch-User": "?1",
    "Cache-Control": "max-age=0",
    "DNT": Math.random() > 0.5 ? "1" : "0",
  };

  if (referer) headers["Referer"] = referer;

  // Desktop Chrome adds these hints; mobile doesn't always
  if (!isMobile && ua.includes("Chrome")) {
    const [major] = ua.match(/Chrome\/(\d+)/)?.slice(1) ?? ["124"];
    headers["Sec-CH-UA"] = `"Chromium";v="${major}", "Google Chrome";v="${major}", "Not-A.Brand";v="99"`;
    headers["Sec-CH-UA-Mobile"] = "?0";
    headers["Sec-CH-UA-Platform"] = ua.includes("Windows") ? '"Windows"' : ua.includes("Mac") ? '"macOS"' : '"Linux"';
  }

  return headers;
}

// Aggregator/non-official sites to always block
const AGGREGATOR_DOMAINS = [
  "freejobalert.com", "sarkariresult.com", "rojgarresult.com", "sarkarijob.com",
  "sarkariexam.com", "sarkari-naukri.com", "naukri.com", "indeed.com",
  "shine.com", "timesjobs.com", "freshersnow.com", "examsbook.com",
  "govtjobprime.com", "latestjobvacancy.in", "currentgovjobs.in",
  "jobriya.in", "sarkarinaukri.net", "recruitment.guru",
];

const isAggregator = (url: string) => AGGREGATOR_DOMAINS.some((d) => url.includes(d));

// Official government / PSU domains for apply links
const OFFICIAL_DOMAINS = [
  ".gov.in", ".nic.in", ".ac.in",
  "ibps.in", "nta.ac.in", "aiimsexams.ac.in",
  "rbi.org.in", "sbi.co.in", "pnbindia.in", "canarabank.com",
  "ucobank.com", "unionbankofindia.co.in", "mahabank.co.in",
  "bankofbaroda.in", "bankofindia.co.in", "bankofmaharashtra.in",
  "iocl.com", "ongc.co.in", "ongcindia.com", "bharatpetroleum.com",
  "hpcl.com", "gail.co.in", "gailonline.com", "ntpc.co.in",
  "nhpc.co.in", "powergridindia.com", "sjvn.nic.in", "thdc.co.in",
  "coalindia.in", "sail.co.in", "nalco.co.in", "nmdc.co.in",
  "hal-india.co.in", "bel-india.in", "beml.com", "drdo.gov.in",
  "barc.gov.in", "isro.gov.in", "npcil.co.in",
  "indianrailways.gov.in", "rrb.gov.in", "rrbonlinereg.in",
  "joinindianarmy.nic.in", "joinindiannavy.gov.in", "joinindianairforce.nic.in",
  "ssc.gov.in", "upsc.gov.in",
  "licindia.in", "licindia.in", "newindia.co.in", "nicl.co.in",
  "uiic.co.in", "gicofindia.com", "orientalinsurance.org.in",
  "aiims.edu", "pgimer.edu.in", "jipmer.edu.in",
  "aai.aero", "pnbindia.in", "ibps.in",
];

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function classifyCategory(title: string, dept: string): string {
  const text = `${title} ${dept}`.toLowerCase();

  // 1. Apprentice — must check before technical/engineering
  if (/\b(apprentices?|apprenticeship|trade apprentice|graduate apprentice|technician apprentice|act apprentice)\b/.test(text)) return "apprentice";

  // 2. SSC — specific exam branding
  if (/\b(ssc\b|staff selection commission|cgl\b|chsl\b|mts\b|cpo\b|gd constable|selection post|ssc exam)\b/.test(text)) return "ssc";

  // 3. UPSC — specific exam branding
  if (/\b(upsc\b|union public service|civil services|ias\b|ips\b|ifs\b|cds\b|nda\b|capf\b|cms\b|ies\b|ese\b|geologist exam|upsc recruitment)\b/.test(text)) return "upsc";

  // 4. Judiciary
  if (/\b(judiciary|judicial|judge\b|magistrate|court\b|district court|high court|supreme court|notary|law clerk|district judge|civil judge|munsiff|court master|apo\b|additional public prosecutor)\b/.test(text)) return "judiciary";

  // 5. Defence — military, paramilitary, strategic
  if (/\b(agniveer|indian army|indian navy|indian air force|military nursing|military|join army|join navy|ssb\b|sainik|ncc\b|coastguard|coast guard|drdo\b|drdl|barc\b|npcil|defence research|nuclear power|afa\b|air force academy|army public school)\b/.test(text)) return "defence";
  if (/\b(bsf\b|crpf\b|cisf\b|itbp\b|ssf\b|sar\b|assam rifles|nsg\b|sff\b|sashastra seema|paramilitary|border security|central industrial security|indo tibetan)\b/.test(text)) return "defence";

  // 6. Police — state/central police (separate from paramilitary)
  if (/\b(police\b|constable\b|sub.inspector|sub inspector|\bsi\b.*police|home guard|fireman|fire brigade|fire officer|fire station|sho\b|cop\b|traffic police|civil police|armed police)\b/.test(text)) return "police";

  // 7. Railways — RRB, Metro, allied
  if (/\b(railway\b|railways\b|\brrb\b|\bntpc\b|group[\s-]d|loco pilot|assistant loco|station master|asm\b|ircon\b|rites\b|dfccil\b|metro rail|rail coach|rcf\b|dmrc\b|nmrc\b|cmrl\b|bmrc\b|rdso\b|dlw\b|icf\b)\b/.test(text)) return "railways";

  // 8. Banking & Finance institutions
  if (/\b(ibps\b|bank\b|banking|rbi\b|nabard\b|\bsbi\b|pnb\b|canara bank|bank of baroda|\buco bank|union bank|bank of india|bank of maharashtra|central bank|indian bank|punjab.*bank|syndicate bank|\bido bank|small finance bank|payments bank|credit cooperative|cooperative bank|gramin bank|rrb.*bank|rural bank)\b/.test(text)) return "banking";

  // 9. Medical — qualified doctors, nurses, AYUSH practitioners with degree
  if (/\b(mbbs\b|md\b|ms\b|bds\b|mds\b|specialist doctor|medical officer\b|dental officer|veterinary officer|radiologist|pathologist|physician|surgeon|psychiatrist|ophthalmologist|gynaecologist|paediatric|general duty medical|gdmo\b|nursing officer\b|staff nurse\b|aiims\b|pgimer\b|jipmer\b|nimhans\b|esic\b|esi hospital|army hospital|medical college|specialists?\b|super.?specialist|ayush\b|ayurveda|homeopathic|unani\b|siddha\b|naturopathy|nhm\b|national health mission|echs\b)\b/.test(text)) return "medical";
  if (/\b(doctor\b|nurse\b|medical superintendent|cmo\b|smo\b|dmo\b|phc\b|chc\b|district hospital|civil hospital|health officer|epidemiologist|public health|senior resident|junior resident|demonstrator\b|medical specialist|nursing.*staff|paramedical.*staff|medical.*staff|para medical)\b/.test(text)) return "medical";

  // 10. Healthcare Support — paramedical, lower qualification health roles, anganwadi
  if (/\b(lab technician|laboratory technician|laboratory assistant|lab assistant|x.ray technician|radiographer|ecg technician|ot technician|operation theatre|pharmacist\b|pharmacy\b|anm\b|gnm\b|asha\b|ward boy|ward girl|nursing orderly|health worker|multipurpose worker|ophthalmic assistant|physiotherapist|occupational therapist|speech therapist|audiologist|dialysis technician|cath lab|dental technician|dental hygienist|prosthetic|orthotics|sanitarian|health inspector|food inspector|dietician|nutritionist|blood bank|cmlt\b|dmlt\b|bmlt\b|paramedic|community health officer|cho\b|anganwadi|anganwadi worker|anganwadi karyakarta|anganwadi sahayika|auxiliary nurse|yoga trainer|health assistant|medical assistant|accredited social)\b/.test(text)) return "healthcare-support";

  // 11. Research & Science
  if (/\b(scientist\b|scientific officer|research officer|research assistant|research coordinator|junior research fellow|senior research fellow|jrf\b|srf\b|research fellow|research associate|project associate|project assistant|project fellow|project scientist|project technical support|project technician|program associate|young professional|one year fellow|post doctoral|phd.*programme|doctoral fellow|csir\b|icmr\b|icar\b|dst\b|dbt\b|serb\b|isro\b|iisc\b|iit\b|nit\b|tifr\b|nbfgr\b|nbpgr\b|iari\b|cpcri\b|cftri\b|neeri\b|nabl\b|icssr\b|insa\b|nasi\b|vigyan|anusandhan|national laboratory|research institute|technical officer.*research|scientific assistant|science officer|bhu\b|sgpgims\b|mpmmcc\b|nift\b|iiser\b|iiitdm\b|iim\b.*research)\b/.test(text)) return "research-science";

  // 12. IT & Software
  if (/\b(software engineer|software developer|programmer\b|web developer|app developer|full.?stack|backend|frontend|devops|cloud engineer|data engineer|data scientist|machine learning|artificial intelligence|cybersecurity|cyber security|network engineer|system analyst|database administrator|dba\b|it officer\b|it manager|nic\b|technical officer.*it|it assistant|computer operator|computer programmer|mis officer|mis executive|data analyst|bi analyst|sap consultant|erp|it helpdesk|system administrator|infosec|information security|it professional|software)\b/.test(text)) return "it-software";

  // 13. Teaching — faculty, school teachers, mentors, guest faculty
  if (/\b(teachers?\b|lecturers?\b|professors?\b|assistant professor|associate professor|tgt\b|pgt\b|prt\b|primary teacher|trained graduate teacher|post graduate teacher|head master|headmaster|principal\b|vice principal|school teacher|navodaya|kvs\b|nvs\b|kendriya vidyalaya|jawahar navodaya|ugc net|net.*exam|set exam|slet\b|school education|contract teacher|para teacher|guest teacher|guest faculty|shikshak|adhyapak|mentors?\b|special educator|content lead|teaching.*cadre|teaching faculties|faculty\b|working teacher|part.time.*teacher|part.time.*contractual|vice.chancellor\b)\b/.test(text)) return "teaching";

  // 14. Education & Training — education dept admin, boards, universities (non-teaching)
  if (/\b(education officer|education department|cbse\b|ncert\b|nios\b|ugc\b|aicte\b|university\b.*admin|registrar\b|university\b.*officer|board of education|state education|directorate.*education|school board|examination board|training officer|training institute|capacity building|skill development|nielit\b|ctet\b|reet\b|htet\b|tet\b|education.*administrator)\b/.test(text)) return "education-training";

  // 15. Finance & Accounts
  if (/\b(accountant\b|accounts officer|audit officer|auditor\b|income tax|customs\b|excise\b|gst\b|revenue officer|revenue department|tax officer|tax assistant|divisional accountant|financial advisor|finance officer|treasury|ca\b.*officer|cag\b|aga\b|principal accounts|pay.*accounts|accounts.*pay|financial controller|chief accounts)\b/.test(text)) return "finance-accounts";

  // 16. Engineering — civil/mech/electrical engineers
  if (/\b(junior engineer|je\b|assistant engineer|ae\b|executive engineer|ee\b|superintending engineer|chief engineer|engineer\b|engineering|cpwd\b|pwm\b|pwd\b|nhai\b|nwda\b|cwc\b|wrd\b|irrigation\b.*engineer|drains\b|sewage\b.*engineer|structural engineer|civil engineer|mechanical engineer|electrical engineer|electronics engineer|chemical engineer)\b/.test(text)) return "engineering";

  // 17. Technical & ITI — diploma/ITI level technical roles
  if (/\b(\biti\b|industrial training|trade.*test|technician\b|mechanic\b|electrician\b|fitter\b|welder\b|turner\b|machinist\b|lineman\b|wireman\b|pump operator\b|tractor operator|crane operator|draughtsman\b|draftsman\b|instrument mechanic|electronics mechanic|plumber\b|carpenter\b|mason\b|helper\b|junior technician|multi.?tasking|mts\b.*technical|technical assistant|lab assistant|field assistant|semi.?skilled|unskilled|skilled artisan|artisans?\b|skilled worker|supervisory staff|technical posts?|technical staff|civil defence instructor)\b/.test(text)) return "technical-iti";

  // 18. Clerk & Typist — clerical, data entry, steno
  if (/\b(clerk\b|upper division clerk|lower division clerk|\budc\b|\bldc\b|junior clerk|senior clerk|office assistant|office clerk|data entry operator\b|deo\b|stenographer\b|steno\b|typist\b|type.*test|multi.?tasking staff|peon\b|daftari|farash|chowkidar|watchman\b|sweeper\b|safaiwala|jamadar\b|cleaner\b|helper.*office)\b/.test(text)) return "clerk-typist";

  // 19. Agriculture & Forestry
  if (/\b(agriculture\b|agricultural|horticulture\b|animal husbandry|veterinary\b|fisheries\b|forestry\b|forest guard\b|forest ranger|van rakshak|forest department|plant protection|soil scientist|agronomist|agricultural officer|fci\b|food corporation|nafed\b|irrigation\b|water.*resource|watershed|soil.*water|sericulture\b|seed corporation|agri.*officer|kisan|farm)\b/.test(text)) return "agriculture-forestry";

  // 20. Law & Security — legal officers, security guards, protection roles
  if (/\b(advocate\b|legal officer|law officer|legal assistant|legal.*counsel|public prosecutor|government pleader|legal advisor|legal adviser|law department|law.*ministry|security guard\b|security officer\b|security.*maintenance|security supervisor|armed guard|unarmed guard|gunman\b|bodyguard|home guard.*officer|legalmetrology|weights.*measures|prosecution\b|deputy.*legal|protection officer|social worker\b|para.?legal|paralegal|legal aid|dlsa\b)\b/.test(text)) return "law-security";

  // 21. PSU — public sector undertakings (industry-specific companies)
  if (/\b(bhel\b|ongc\b|gail\b|iocl\b|bpcl\b|hpcl\b|sail\b|nalco\b|nmdc\b|ntpc\b|nhpc\b|powergrid\b|pgcil\b|npcl\b|cpcl\b|mrpl\b|numaligarh\b|eil\b|wapcos\b|neepco\b|thdc\b|sjvn\b|nmdfc\b|mstc\b|hecl\b|moil\b|nmdcl\b|mecl\b|aai\b|airports authority|concor\b|container corporation|halcl\b|hscc\b|nmdpl\b|grse\b|mazagon dock\b|mdl\b|csl\b|gsl\b|hslidl\b|beml\b|bel\b|hal\b|ordnance factory|oef\b|mcf\b|clf\b|coal india\b|ecl\b|bccl\b|ccl\b|wcl\b|secl\b|ncl\b.*coal|nlc\b|nmdcl\b|nbcc\b|hudco\b|pnb housing|lic\b|gic\b|new india assurance|oriental insurance|united india insurance|national insurance.*company|nic\b.*insurance|irda\b)\b/.test(text)) return "psu";

  // 22. Management & Admin — officers, admin, consultants not classified above
  if (/\b(deputy director|assistant director|joint director|director\b.*(?:admin|finance|general)|district officer|block officer|development officer|administrative officer|admin officer|superintendent\b|inspector\b.*(?:central|income|food|drug|weight)|inspector general|additional commissioner|sub divisional|sub-divisional|sdo\b|block development|project officer|programme officer|programme manager|management trainee|executive trainee|officer trainee|probationary officer(?!.*bank)|management executive|section officer|under secretary|deputy secretary|joint secretary|additional secretary|managerial|general manager|dgm\b|agm\b|chief manager|deputy manager|manager trainee|graduate officer|consultant\b|consultants\b|senior consultant|senior associate consultant|associate consultant|senior officer|deputy librarian|librarian\b|exhibition officer|assessment.*charge|non.?teaching|computer assistant|naval architect|traffic manager|materials manager|safety manager|data manager|company secretary|investment associate|class i.*posts?|class ii.*posts?|class i.*ii|group c\b|group.c\b|senior assistant|managers?\b|executives?\b(?!.*trainee)|member\b)\b/.test(text)) return "management-admin";

  // 23. State Govt — remaining state-level government jobs
  if (/\b(state.*(?:government|govt|department|service|board|corporation|commission|authority|mission|agency)|state psc|psc\b|public service commission|hpsc\b|bpsc\b|uppsc\b|mpsc\b|rpsc\b|appsc\b|tspsc\b|kpsc\b|gpsc\b|opsc\b|tnpsc\b|wbpsc\b|cgpsc\b|jpsc\b|mppsc\b|ukpsc\b|goa psc|mizoram psc|meghalaya psc|manipur psc|sikkim psc|nagaland psc|tripura psc|arunachal psc|state secretariat|secretariat assistant|district.*(?:collector|magistrate)|gram panchayat|panchayat.*(?:secretary|officer)|mukhya.*mantri|zila.*parishad|jila.*parishad|block.*panchayat|local body|municipal|nagar.*(?:palika|nigam|panchayat)|urban local body|ulb\b)\b/.test(text)) return "state-govt";

  return "other";
}

function parseIndianDate(raw: string): string | null {
  if (!raw || raw.trim() === "" || raw.toLowerCase() === "no" || raw.trim() === "-") return null;
  raw = raw.trim();

  // DD-MM-YYYY or DD/MM/YYYY
  const m1 = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (m1) {
    const [, d, mo, y] = m1;
    return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Written month: "16 April 2026" or "16th April 2026"
  const months: Record<string, string> = {
    january: "01", february: "02", march: "03", april: "04", may: "05", june: "06",
    july: "07", august: "08", september: "09", october: "10", november: "11", december: "12",
    jan: "01", feb: "02", mar: "03", apr: "04", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
  };
  const m3 = raw.match(/(\d{1,2})[a-z]{0,2}[\s]+([a-zA-Z]+)[\s,]+(\d{4})/);
  if (m3) {
    const [, d, mon, y] = m3;
    const mo = months[mon.toLowerCase()];
    if (mo) return `${y}-${mo}-${d.padStart(2, "0")}`;
  }

  return null;
}

function parseVacancies(text: string): number | null {
  const patterns = [
    /(\d[\d,]*)\s*(posts?|vacancies|vacancy|seats?|positions?)/i,
    /total[^\d]*(\d[\d,]*)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1].replace(/,/g, ""), 10);
      if (n > 0 && n < 200000) return n;
    }
  }
  return null;
}

function parseSalaryFromText(text: string): string | null {
  // Look for specific salary patterns
  const patterns = [
    /(?:pay scale|salary|pay band|fixed pay|ctc|stipend)[^\n]*?(?:rs\.?|₹)\s*([\d,]+(?:\s*[-–to]+\s*[\d,]+)?)/i,
    /(?:rs\.?|₹)\s*([\d,]+(?:\s*[-–to]+\s*[\d,]+)?)\s*(?:\/|-)\s*(?:month|per month|pm)/i,
    /pay level[- ]*(\d+)/i,
    /level[- ]*(\d+)[^a-z]/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const val = m[1].trim();
      if (val.length > 1 && val.length < 60) {
        if (p.source.includes("level")) return `Pay Level ${val}`;
        return `₹${val.replace(/,/g, ",")} per month`;
      }
    }
  }
  return null;
}

// Human-like random delay: base ± up to 50% jitter
function jitter(baseMs: number, spread = 0.5): number {
  return Math.round(baseMs * (1 - spread / 2 + Math.random() * spread));
}

async function fetchHtml(url: string, attempt = 1): Promise<string | null> {
  const MAX_ATTEMPTS = 4;
  const BACKOFF_BASE = 8000; // 8 s base for exponential backoff

  try {
    // Small random pre-request pause to mimic human reading/clicking
    await sleep(jitter(400, 0.8));

    const resp = await fetch(url, {
      headers: buildHeaders(),
      signal: AbortSignal.timeout(20000),
      redirect: "follow",
    });

    // Explicitly blocked / rate-limited
    if (resp.status === 403 || resp.status === 429 || resp.status === 503) {
      if (attempt < MAX_ATTEMPTS) {
        const delay = BACKOFF_BASE * Math.pow(2, attempt - 1) + jitter(3000);
        logger.warn({ url, status: resp.status, attempt, delay }, "Blocked — backing off before retry");
        await sleep(delay);
        return fetchHtml(url, attempt + 1);
      }
      logger.warn({ url, status: resp.status }, "Giving up after max retries");
      return null;
    }

    if (!resp.ok) return null;
    return await resp.text();
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      const delay = BACKOFF_BASE * attempt + jitter(2000);
      logger.warn({ url, attempt, delay, err }, "Fetch error — retrying");
      await sleep(delay);
      return fetchHtml(url, attempt + 1);
    }
    return null;
  }
}

interface RawJob {
  postDate: string;
  department: string;
  title: string;
  qualification: string;
  advtNo: string;
  lastDate: string;
  detailUrl: string;
}

async function scrapeListPage(url: string): Promise<RawJob[]> {
  const html = await fetchHtml(url);
  if (!html) return [];
  const $ = cheerio.load(html);
  const jobs: RawJob[] = [];
  const today = new Date().toISOString().split("T")[0];

  $("table.lattbl").each((_i, table) => {
    $(table).find("tr").each((_j, row) => {
      const cells = $(row).find("td");
      if (cells.length < 7) return;
      const postDate = $(cells[0]).text().trim();
      const department = $(cells[1]).text().trim();
      const title = $(cells[2]).text().replace(/\s+/g, " ").trim();
      const qualification = $(cells[3]).text().trim();
      const advtNo = $(cells[4]).text().trim();
      const rawLastDate = $(cells[5]).text().trim();
      const link = $(cells[6]).find("a").attr("href") || "";

      if (!title || !department || !rawLastDate || !link) return;

      const parsedLastDate = parseIndianDate(rawLastDate);
      if (!parsedLastDate) return;
      if (parsedLastDate < today) return; // Skip expired

      jobs.push({
        postDate,
        department: department.trim(),
        title: title.trim(),
        qualification: qualification.trim(),
        advtNo: advtNo.trim(),
        lastDate: parsedLastDate,
        detailUrl: link.trim(),
      });
    });
  });

  return jobs;
}

const ALL_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu", "Kashmir", "Chandigarh", "Puducherry",
];

function extractStates(text: string): string[] {
  if (/all\s*india|all\s*over\s*india|pan\s*india|any\s*state|across\s*india/i.test(text)) {
    return ["All India"];
  }
  const found: string[] = [];
  for (const state of ALL_STATES) {
    if (text.toLowerCase().includes(state.toLowerCase())) {
      found.push(state);
    }
  }
  return found.length > 0 ? found : ["All India"];
}

async function enrichJobWithDetailPage(jobId: number, detailUrl: string): Promise<void> {
  if (!detailUrl.includes("freejobalert.com")) return;

  const html = await fetchHtml(detailUrl);
  if (!html) return;
  const $ = cheerio.load(html);

  const metaDesc = $('meta[name="description"]').attr("content") || "";
  const articleText = $(".entry-content, article, .post-content, .entry").text().replace(/\s+/g, " ");
  const fullText = metaDesc + " " + articleText;

  // Domains that are clearly non-official/social/ad networks
  const SOCIAL_AND_AD = /google\.|facebook\.|twitter\.|youtube\.|whatsapp\.|t\.me\/|instagram\.|linkedin\.|pinterest\.|rebrand\.ly|bit\.ly|tinyurl\.|arattai\.in|linktr\.ee|bio\.link|beacons\.ai|cluestoday\.|marketshost\.|rojgarlive\.|stylishscape\.|in\.com\/news|aajtak\.|ndtv\.|timesofindia\.|economictimes\.|moneycontrol\.|hindustantimes\.|thehindu\.|telegraphindia\.|theprint\.|scroll\.in\/|thewire\.|barandbench\.|livelaw\.|legalbites\.|latestlaw\.|livemint\.|livehindus\.|jagran\.|bhaskar\.|amarujala\.|navbharat\./i;

  // Accept any non-aggregator, non-social link whose TLD is Indian (.in, .ac.in, .org.in etc.)
  // or is on a known PSU/gov domain — covers orgs like wbcsc.org.in, wbcsconline.in, etc.
  const isOfficialHref = (href: string) => {
    if (!href.startsWith("http")) return false;
    if (isAggregator(href)) return false;
    if (SOCIAL_AND_AD.test(href)) return false;
    // Explicit gov/PSU whitelist
    if (OFFICIAL_DOMAINS.some((d) => href.includes(d))) return true;
    // Any .in TLD domain not explicitly blocked (covers state govts, PSUs, boards, etc.)
    try {
      const hostname = new URL(href).hostname.toLowerCase();
      // Accept anything ending in .in (gov.in, nic.in, org.in, co.in, .in, etc.)
      if (hostname.endsWith(".in")) return true;
      // Accept known education/charity TLDs
      if (hostname.endsWith(".edu") || hostname.endsWith(".org") || hostname.endsWith(".ac")) return true;
    } catch { /* invalid URL */ }
    return false;
  };

  // Helper: is this a real PDF from an official source?
  const isOfficialPdf = (href: string) => {
    if (!href.startsWith("http")) return false;
    if (isAggregator(href)) return false;
    const lower = href.toLowerCase();
    return lower.endsWith(".pdf") || lower.includes(".pdf?") || lower.includes("/pdf/");
  };

  // Only scan links WITHIN the article content area — avoids nav, sidebar, footer garbage
  const contentSelector = ".entry-content, article .post-content, .post-content, #content article, .wp-block-group";
  const $content = $(contentSelector).length ? $(contentSelector) : $("body");

  // 1. Find apply URL — prefer labelled "Apply / Register / Application" links on official domains
  let applyUrl: string | null = null;

  // First pass: labelled apply links in content area
  $content.find("a").each((_i, el) => {
    if (applyUrl) return;
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim().toLowerCase();
    if (
      isOfficialHref(href) &&
      /apply\s*online|apply\s*now|apply\s*here|register\s*online|online\s*application|click\s*here\s*to\s*apply/i.test(text)
    ) {
      applyUrl = href;
    }
  });

  // Second pass: any "Click Here / Click here" inside a table row in content area (FreeJobAlert table format)
  if (!applyUrl) {
    $content.find("table tr").each((_i, row) => {
      if (applyUrl) return;
      const cells = $(row).find("td");
      const rowText = cells.first().text().trim().toLowerCase();
      // Prefer rows whose label says "apply" or "register"
      if (/apply|register|application/i.test(rowText)) {
        cells.each((_j, cell) => {
          const link = $(cell).find("a").first();
          const href = link.attr("href") || "";
          if (isOfficialHref(href)) {
            applyUrl = href;
          }
        });
      }
    });
  }

  // Third pass: any official domain link in content area (last resort)
  if (!applyUrl) {
    $content.find("a").each((_i, el) => {
      if (applyUrl) return;
      const href = $(el).attr("href") || "";
      if (isOfficialHref(href)) {
        applyUrl = href;
      }
    });
  }

  // 2. Find notification PDF — ONLY store actual .pdf files from official/non-aggregator sources.
  let notificationPdfUrl: string | null = null;

  // Check content area links first, then fall back to all links
  $content.find("a").each((_i, el) => {
    if (notificationPdfUrl) return;
    const href = $(el).attr("href") || "";
    if (isOfficialPdf(href)) {
      notificationPdfUrl = href;
    }
  });

  const vacancies = parseVacancies(fullText);
  const salaryRange = parseSalaryFromText(fullText);
  const states = extractStates(fullText);

  let ageMin: number | null = null;
  let ageMax: number | null = null;
  const ageMatch = fullText.match(/age\s*(?:limit)?[^:]*:\s*(\d{2})[\s-–]+(\d{2})\s*years?/i);
  if (ageMatch) {
    ageMin = parseInt(ageMatch[1], 10);
    ageMax = parseInt(ageMatch[2], 10);
  }

  let applicationStartDate: string | null = null;
  const startMatch = fullText.match(/(?:online\s*)?(?:application|registration)\s*(?:start|begin|open)[s]?[^.]*?(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i);
  if (startMatch) applicationStartDate = parseIndianDate(startMatch[1]);

  const description = metaDesc || undefined;

  try {
    await db
      .update(jobsTable)
      .set({
        applyUrl: applyUrl ?? undefined,
        notificationPdfUrl: notificationPdfUrl ?? undefined,
        salaryRange: salaryRange ?? undefined,
        // COALESCE: only fill vacancies if not already set from title extraction
        // This prevents article text like "2,000 candidates applied" from overwriting the real count
        ...(vacancies !== null ? {
          vacancies: sql`COALESCE(${jobsTable.vacancies}, ${vacancies})`,
        } : {}),
        ageMin: ageMin ?? undefined,
        ageMax: ageMax ?? undefined,
        ageRelaxation: ageMin ? "OBC: 3 years, SC/ST: 5 years, PwD: 10 years (as per GOI norms)" : undefined,
        applicationStartDate: applicationStartDate ?? undefined,
        states: states,
        description: description ?? undefined,
      })
      .where(eq(jobsTable.id, jobId));
  } catch (err) {
    logger.error({ err, jobId }, "Failed to enrich job");
  }
}

export async function fetchAndStoreJobs(): Promise<{ added: number; updated: number; skipped: number }> {
  logger.info("Starting job fetch from freejobalert.com...");

  let added = 0;
  let updated = 0;
  let skipped = 0;

  // Scrape listing pages
  const listingUrls = [
    "https://www.freejobalert.com/latest-notifications/",
    "https://www.freejobalert.com/latest-notifications/?page=2",
    "https://www.freejobalert.com/latest-notifications/?page=3",
    "https://www.freejobalert.com/latest-notifications/?page=4",
  ];

  const allRawJobs: RawJob[] = [];
  for (const url of listingUrls) {
    const jobs = await scrapeListPage(url);
    logger.info({ url, count: jobs.length }, "Scraped listing page");
    allRawJobs.push(...jobs);
    // Human-like wait between listing pages: 3–7 seconds
    await sleep(jitter(5000, 0.8));
  }

  // Deduplicate by sourceUrl
  const seen = new Set<string>();
  const uniqueJobs = allRawJobs.filter((j) => {
    if (seen.has(j.detailUrl)) return false;
    seen.add(j.detailUrl);
    return true;
  });

  logger.info({ total: uniqueJobs.length }, "Total unique valid jobs found");

  // === PHASE 1: Fast batch insert all jobs from listing data ===
  const newJobIds: Array<{ id: number; url: string }> = [];

  for (const rawJob of uniqueJobs) {
    try {
      const category = classifyCategory(rawJob.title, rawJob.department);

      // Check if already exists
      const existing = await db
        .select({ id: jobsTable.id })
        .from(jobsTable)
        .where(eq(jobsTable.sourceUrl, rawJob.detailUrl))
        .limit(1);

      if (existing.length > 0) {
        // Update last date if it changed
        await db
          .update(jobsTable)
          .set({ lastDate: rawJob.lastDate })
          .where(eq(jobsTable.id, existing[0].id));
        updated++;
        continue;
      }

      // Quick insert with listing-level data only (no detail page fetch)
      const vacanciesFromTitle = parseVacancies(rawJob.title);
      const jobData: InsertJob = {
        title: rawJob.title,
        department: rawJob.department,
        category,
        states: ["All India"],
        ageMin: null,
        ageMax: null,
        ageRelaxation: null,
        qualification: rawJob.qualification || null,
        applicationStartDate: null,
        lastDate: rawJob.lastDate,
        examDate: null,
        applyUrl: null,
        notificationPdfUrl: null,
        sourceName: "FreeJobAlert",
        sourceUrl: rawJob.detailUrl,
        isVerified: true,
        description: `${rawJob.title} - ${rawJob.department}. Qualification: ${rawJob.qualification || "See notification"}. Last date: ${rawJob.lastDate}.`,
        salaryRange: null,
        vacancies: vacanciesFromTitle,
        photoRequirements: null,
        signatureRequirements: null,
      };

      const [inserted] = await db.insert(jobsTable).values(jobData).returning({ id: jobsTable.id });
      if (inserted) {
        newJobIds.push({ id: inserted.id, url: rawJob.detailUrl });
        added++;
      }
    } catch (err) {
      logger.error({ err, title: rawJob.title }, "Failed to insert job");
      skipped++;
    }
  }

  logger.info({ added, updated, skipped }, "Phase 1 complete - all listing data stored");

  // === PHASE 2: Enrich a subset of new jobs with detail page data ===
  // Enrich up to 100 most recent new jobs with full detail pages
  const toEnrich = newJobIds.slice(0, 100);
  logger.info({ count: toEnrich.length }, "Starting detail page enrichment for new jobs");

  for (const { id, url } of toEnrich) {
    try {
      await enrichJobWithDetailPage(id, url);
      // Human-like wait between detail pages: 1.5–4 seconds
      await sleep(jitter(2500, 0.8));
    } catch (err) {
      logger.error({ err, id }, "Failed to enrich job detail");
    }
  }

  logger.info({ enriched: toEnrich.length }, "Phase 2 complete - detail enrichment done");

  return { added, updated, skipped };
}

// Reclassify all existing jobs using the updated classifier
export async function reclassifyAllJobs(): Promise<{ updated: number }> {
  const allJobs = await db
    .select({ id: jobsTable.id, title: jobsTable.title, department: jobsTable.department })
    .from(jobsTable);

  logger.info({ total: allJobs.length }, "Starting reclassification of all jobs");

  let updated = 0;
  for (const job of allJobs) {
    const newCategory = classifyCategory(job.title, job.department);
    await db
      .update(jobsTable)
      .set({ category: newCategory })
      .where(eq(jobsTable.id, job.id));
    updated++;
  }

  logger.info({ updated }, "Reclassification complete");
  return { updated };
}

// Background enrichment of jobs that have no apply URL
export async function enrichPendingJobs(limit = 50): Promise<{ enriched: number }> {
  const pending = await db
    .select({ id: jobsTable.id, sourceUrl: jobsTable.sourceUrl })
    .from(jobsTable)
    .where(and(isNull(jobsTable.applyUrl), eq(jobsTable.isVerified, true)))
    .limit(limit);

  logger.info({ count: pending.length, limit }, "Enriching pending jobs with detail pages");

  let enriched = 0;
  for (const job of pending) {
    if (!job.sourceUrl) continue;
    try {
      await enrichJobWithDetailPage(job.id, job.sourceUrl);
      enriched++;
      // Human-like wait: 1–3 seconds between enrichment requests
      await sleep(jitter(2000, 0.8));
    } catch (err) {
      logger.error({ err, id: job.id }, "Enrichment failed");
    }
  }
  logger.info({ enriched }, "Enrichment batch complete");
  return { enriched };
}

let schedulerInterval: ReturnType<typeof setInterval> | null = null;
let enrichmentInterval: ReturnType<typeof setInterval> | null = null;

export function startJobFetchScheduler(): void {
  // Run immediately on startup
  fetchAndStoreJobs().catch((err) => logger.error({ err }, "Initial job fetch failed"));

  // Refresh listings every 4 hours
  schedulerInterval = setInterval(
    () => {
      fetchAndStoreJobs().catch((err) => logger.error({ err }, "Scheduled job fetch failed"));
    },
    4 * 60 * 60 * 1000,
  );

  // Enrich jobs without details every 30 minutes
  enrichmentInterval = setInterval(
    () => {
      enrichPendingJobs().catch((err) => logger.error({ err }, "Enrichment job failed"));
    },
    30 * 60 * 1000,
  );

  logger.info("Job fetch scheduler started (every 4 hours, enrichment every 30 min)");
}

export function stopJobFetchScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
  }
  if (enrichmentInterval) {
    clearInterval(enrichmentInterval);
    enrichmentInterval = null;
  }
}
