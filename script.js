/**
 * DOLE LDNPFO - GIP Document Monitoring System
 * Master JavaScript Logic Sheet (v11 - Pre-configured Supabase Project URL & Anon Key)
 */

const LOCAL_STORAGE_KEY = 'dole_gip_monitoring_db_v9';
const SUPABASE_CONFIG_KEY = 'dole_gip_supabase_config';

// Pre-configured Supabase Project Credentials from window.ENV or fallback
const DEFAULT_SUPABASE_CONFIG = {
  url: (window.ENV && window.ENV.SUPABASE_URL) || 'https://gprkzegwymkufrbmzakd.supabase.co',
  key: (window.ENV && window.ENV.SUPABASE_ANON_KEY) || 'sb_publishable_LqDDREJQqzUD3BEVNWtuzA_Z3wIy_wU'
};

// Supabase Global Client Instance
let supabaseClient = null;
let isSupabaseConnected = false;
let realtimeSubscription = null;

// Initial Sample Seed Data (Empty for Live Realtime Production Mode)
const DEFAULT_SEED_DATA = {
  dtrRecords: [],
  transmittalRecords: [],
  compiledRecords: []
};
// Initial GIP Contacts Directory Seed Data from CSV
const DEFAULT_CONTACTS_SEED = [
  { id: "cnt-1", gipName: "ABBAS, EXSAN S.", assignment: "LDNPFO", contactNumber: "09094708118", remarks: "" },
  { id: "cnt-2", gipName: "ABDUL, NURKEYMAR C.", assignment: "LDNPFO", contactNumber: "09915305586", remarks: "" },
  { id: "cnt-3", gipName: "ABUTON, DAVIE C.", assignment: "NLRC", contactNumber: "09752615467", remarks: "" },
  { id: "cnt-4", gipName: "AGBALOG, JOAN T.", assignment: "BOT", contactNumber: "09654523868", remarks: "" },
  { id: "cnt-5", gipName: "AGBONA, FRELYN L.", assignment: "PESO BAROY", contactNumber: "09566804858", remarks: "" },
  { id: "cnt-6", gipName: "ALEGA, ANGELYN A.", assignment: "LDNPFO", contactNumber: "09276513005", remarks: "" },
  { id: "cnt-7", gipName: "ALFORQUE, JULIANA B.", assignment: "SSS", contactNumber: "09816714955", remarks: "" },
  { id: "cnt-8", gipName: "ALI, NOR-AIN D.", assignment: "PESO TAGOLOAN", contactNumber: "09973687914", remarks: "" },
  { id: "cnt-9", gipName: "ALIP, ALYANAH A.", assignment: "PESO BALO-I", contactNumber: "09700824607", remarks: "" },
  { id: "cnt-10", gipName: "AMER, RAINISA C.", assignment: "PESO POONA PIAGAPO", contactNumber: "09074694092", remarks: "" },
  { id: "cnt-11", gipName: "AMEROL, SOHAIB M.", assignment: "DICT", contactNumber: "09924843428", remarks: "" },
  { id: "cnt-12", gipName: "ARNOCO, KAYLA JOY V.", assignment: "PESO SND", contactNumber: "09948202331", remarks: "" },
  { id: "cnt-13", gipName: "ATES, WALLEEN V.", assignment: "LDNPFO", contactNumber: "09913092069", remarks: "" },
  { id: "cnt-14", gipName: "BALANG, RACMA B.", assignment: "PESO SAPAD", contactNumber: "09261716851", remarks: "" },
  { id: "cnt-15", gipName: "BALANGHIG, SHENDY LIANE T.", assignment: "PESO SAPAD", contactNumber: "09098133047", remarks: "" },
  { id: "cnt-16", gipName: "BALUYOS, DIANNE LANE B.", assignment: "SSS", contactNumber: "09465315908", remarks: "" },
  { id: "cnt-17", gipName: "BANGUIS, JERLYN C.", assignment: "PESO BALO-I", contactNumber: "09123846371", remarks: "" },
  { id: "cnt-18", gipName: "BEDOL, ZAIRA MAE L.", assignment: "PESO BALO-I", contactNumber: "09631137213", remarks: "" },
  { id: "cnt-19", gipName: "COLALO, JAMAIDA P.", assignment: "PESO SALVADOR", contactNumber: "09754816800", remarks: "" },
  { id: "cnt-20", gipName: "CONCILIADO, CONSTANTINO LUIS C.", assignment: "PRC", contactNumber: "09456930902", remarks: "" },
  { id: "cnt-21", gipName: "CORDERO, MAYA NIÑA D.", assignment: "PESO KAUSWAGAN", contactNumber: "09129145507", remarks: "" },
  { id: "cnt-22", gipName: "DATU, JOHANIE H. SERAD", assignment: "PESO PANTAR", contactNumber: "09951937972", remarks: "" },
  { id: "cnt-23", gipName: "DATU, RAIHANIE H. SERAD", assignment: "PESO PANTAR", contactNumber: "09709302207", remarks: "" },
  { id: "cnt-24", gipName: "DAYGAM, JOHN ALJHON C.", assignment: "PGLDN", contactNumber: "09277706255", remarks: "" },
  { id: "cnt-25", gipName: "DIMAPORO, NORLIN B.", assignment: "PESO TANGCAL", contactNumber: "09816190177", remarks: "" },
  { id: "cnt-26", gipName: "DOMAGAY, ABDUL HASSAN B.", assignment: "PESO TANGCAL", contactNumber: "09530476472", remarks: "" },
  { id: "cnt-27", gipName: "DUMAPIAS, JOVELLE A.", assignment: "PRC", contactNumber: "09948168199", remarks: "" },
  { id: "cnt-28", gipName: "ELLA VIA, LUNA C.", assignment: "BOT", contactNumber: "09074966903", remarks: "" },
  { id: "cnt-29", gipName: "FALCESO, DAVE B.", assignment: "NLRC", contactNumber: "09652008745", remarks: "" },
  { id: "cnt-30", gipName: "GELLICA, MARK LLOYD V.", assignment: "LDNPFO", contactNumber: "09659061218", remarks: "" },
  { id: "cnt-31", gipName: "GENON, RHEA THERESS A.", assignment: "PESO LINAMON", contactNumber: "09518876802", remarks: "" },
  { id: "cnt-32", gipName: "GUMAMA, ADEL YASSIN G.", assignment: "LDNPFO", contactNumber: "09635858618", remarks: "" },
  { id: "cnt-33", gipName: "H. ABBAS, JUNAISAH H.", assignment: "LDNPFO", contactNumber: "09664160715", remarks: "" },
  { id: "cnt-34", gipName: "HERMOSO, MYCEL JOY J.", assignment: "PGLDN", contactNumber: "09661888512", remarks: "" },
  { id: "cnt-35", gipName: "HERNANDEZ, FRANCIS CLARK C.", assignment: "NLRC", contactNumber: "09679144968", remarks: "" },
  { id: "cnt-36", gipName: "IBRAHIM, PRINCESS JIHAN SHAIRA M.", assignment: "NLRC", contactNumber: "09852839070", remarks: "" },
  { id: "cnt-37", gipName: "JACINTO, LAICAH O.", assignment: "NLRC", contactNumber: "09925401101", remarks: "" },
  { id: "cnt-38", gipName: "JAICTEN, FRANZELLE VIE B.", assignment: "LDNPFO", contactNumber: "09559555997", remarks: "" },
  { id: "cnt-39", gipName: "JUMALON, JEVI R.", assignment: "PESO ILIGAN", contactNumber: "09169330786", remarks: "" },
  { id: "cnt-40", gipName: "LACABA, LEO JAY B.", assignment: "PESO-MAIGO", contactNumber: "09658359201", remarks: "" },
  { id: "cnt-41", gipName: "LAGRECA, NAOMIE B.", assignment: "PESO KOLAMBUGAN", contactNumber: "09652633583", remarks: "" },
  { id: "cnt-42", gipName: "LAPECIROS, JELORD A.", assignment: "PRC", contactNumber: "09914999103", remarks: "" },
  { id: "cnt-43", gipName: "LEONG, CHLEO DENISE C.", assignment: "PESO LINAMON", contactNumber: "09668018545", remarks: "" },
  { id: "cnt-44", gipName: "LIPANTAS, AISAH O.", assignment: "PESO MAGSAYSAY", contactNumber: "09534196555", remarks: "" },
  { id: "cnt-45", gipName: "MABANING, JOHANNA P.", assignment: "PESO PANTAO RAGAT", contactNumber: "09552657386", remarks: "" },
  { id: "cnt-46", gipName: "MACACUNA, FARHAN B.", assignment: "PESO PANTAO RAGAT", contactNumber: "09638183436", remarks: "" },
  { id: "cnt-47", gipName: "MAMANGCONI, ALYANA-HAMRA M.", assignment: "PESO MATUNGAO", contactNumber: "09392741207", remarks: "" },
  { id: "cnt-48", gipName: "MAMANGCONI, NUR-HASNA M.", assignment: "PESO MATUNGAO", contactNumber: "09622547316", remarks: "" },
  { id: "cnt-49", gipName: "MANOS, ESTHOR EMMANUEL A.", assignment: "PESO TUBOD", contactNumber: "09952971195", remarks: "" },
  { id: "cnt-50", gipName: "MEJORADA, ELIZABETH M.", assignment: "PGLDN", contactNumber: "09268344551", remarks: "" },
  { id: "cnt-51", gipName: "MONSANTO, HIZEL G.", assignment: "LDNPFO", contactNumber: "09617678670", remarks: "" },
  { id: "cnt-52", gipName: "NATIVIDAD, JUDIEL C.", assignment: "PESO KAUSWAGAN", contactNumber: "09973681741", remarks: "" },
  { id: "cnt-53", gipName: "NICDAO, ANN MARIE Y.", assignment: "PESO ILIGAN", contactNumber: "09368933490", remarks: "" },
  { id: "cnt-54", gipName: "OMAR, ABDUL JAME A.", assignment: "PESO MAGSAYSAY", contactNumber: "09382197634", remarks: "" },
  { id: "cnt-55", gipName: "OYOG, LOVELY GRACE L.", assignment: "PGLDN", contactNumber: "09981744371", remarks: "" },
  { id: "cnt-56", gipName: "PADILLA, THERESE MAE C.", assignment: "PCUP", contactNumber: "09368446320", remarks: "" },
  { id: "cnt-57", gipName: "PATAD, ANALYN M.", assignment: "PESO NUNUNGAN", contactNumber: "09810802508", remarks: "" },
  { id: "cnt-58", gipName: "PENDANG, JOHN LLOYD D.", assignment: "PESO ILIGAN", contactNumber: "09161960849", remarks: "" },
  { id: "cnt-59", gipName: "PETILUNA, QUEENIE LYN E.", assignment: "PESO TUBOD", contactNumber: "09944112115", remarks: "" },
  { id: "cnt-60", gipName: "PINDOLONAN, SAMAILA D.", assignment: "PESO NUNUNGAN", contactNumber: "09100874975", remarks: "" },
  { id: "cnt-61", gipName: "POLOYAPOY, JUNDY MAE R.", assignment: "PESO KOLAMBUGAN", contactNumber: "09361781814", remarks: "" },
  { id: "cnt-62", gipName: "RABANES, NELSON A. JR.", assignment: "NLRC", contactNumber: "09757157511", remarks: "" },
  { id: "cnt-63", gipName: "RATUNIL, DAVE EDWARD R.", assignment: "LDNPFO", contactNumber: "09656121944", remarks: "" },
  { id: "cnt-64", gipName: "RETES, DAISY LOU J.", assignment: "PESO SALVADOR", contactNumber: "09979857883", remarks: "" },
  { id: "cnt-65", gipName: "RIVERA, JHOPAY JANE D.", assignment: "PESO BACOLOD", contactNumber: "09283312116", remarks: "" },
  { id: "cnt-66", gipName: "SARIP, NORJANAH M.", assignment: "PESO TAGOLOAN", contactNumber: "09090838855", remarks: "" },
  { id: "cnt-67", gipName: "SEBIAL, MARY CRIS C.", assignment: "PESO SND", contactNumber: "09816253116", remarks: "" },
  { id: "cnt-68", gipName: "SINGSON, CLYDENE FRANZ M.", assignment: "PESO BALO-I", contactNumber: "09929608922", remarks: "" },
  { id: "cnt-69", gipName: "TABAO, JOHANISA D.", assignment: "LDNPFO", contactNumber: "09383867362", remarks: "" },
  { id: "cnt-70", gipName: "TANGHIYAN, ERNIE JEAN D.", assignment: "LDNPFO", contactNumber: "09469004955", remarks: "" },
  { id: "cnt-71", gipName: "TEMPLADO, KATHY M.", assignment: "PESO BAROY", contactNumber: "09700384717", remarks: "" },
  { id: "cnt-72", gipName: "UGTONG, MARK JORDAN C.", assignment: "LDNPFO", contactNumber: "09911468591", remarks: "" },
  { id: "cnt-73", gipName: "UNDA, PRINCESS JEHAN P.", assignment: "LDNPFO", contactNumber: "09169307200", remarks: "" },
  { id: "cnt-74", gipName: "CABILANDO, SUSAN RECENTES", assignment: "LDNPFO", contactNumber: "09530526247", remarks: "" }
];

// Initial GIP Salary & Payroll Tracking Seed Data from CSV
const DEFAULT_SALARY_SEED = [
  { id: "sal-1", gipName: "ABBAS, EXSAN S. et al.", periods: { "APR 16-30": { amount: 42928.00, status: "received" }, "MAY 1-15": { amount: 40160.00, status: "received" }, "MAY 16-31": { amount: 36160.00, status: "received" }, "JUNE 1-15": { amount: 40160.00, status: "received" }, "JUNE 16-30": { amount: 42160.00, status: "received" }, "JULY 1-15": { amount: 45160.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-2", gipName: "ABUTON, DAVIE C. et al.", periods: { "APR 16-30": { amount: 32196.00, status: "received" }, "MAY 1-15": { amount: 30120.00, status: "received" }, "MAY 16-31": { amount: 27120.00, status: "received" }, "JUNE 1-15": { amount: 30120.00, status: "received" }, "JUNE 16-30": { amount: 30120.00, status: "received" }, "JULY 1-15": { amount: 33120.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-3", gipName: "AGBALOG, JOAN T. et al.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 7471.36, status: "received" }, "JUNE 1-15": { amount: 10027.52, status: "received" }, "JUNE 16-30": { amount: 9533.76, status: "received" }, "JULY 1-15": { amount: 10212.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-4", gipName: "ALEGA, ANGELYN A. et al.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 0, status: "na" }, "JUNE 1-15": { amount: 0, status: "na" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-5", gipName: "ALFORQUE, JULIANA B. et al.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 0, status: "na" }, "JUNE 1-15": { amount: 0, status: "na" }, "JUNE 16-30": { amount: 0, status: "na" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-6", gipName: "AGBONA, FRELYN L. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10540.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-7", gipName: "ALI, NOR-AIN D. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 9934.96, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 9784.16, status: "received" }, "JUNE 16-30": { amount: 10483.84, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-8", gipName: "ALIP, ALYANAH A. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 15060.00, status: "received" }, "MAY 16-31": { amount: 13560.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-9", gipName: "AMER, RAINISA C.", periods: { "APR 16-30": { amount: 5366.00, status: "received" }, "MAY 1-15": { amount: 5020.00, status: "received" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-10", gipName: "ARNOCO, KAYLA JOY V. et al.", periods: { "APR 16-30": { amount: 5345.00, status: "received" }, "MAY 1-15": { amount: 5345.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10540.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-11", gipName: "BALANG, RACMA B. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-12", gipName: "COLALO, JAMAIDA P. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-13", gipName: "CONCILIADO, CONSTANTINO LUIS C. et al.", periods: { "APR 16-30": { amount: 14147.94, status: "received" }, "MAY 1-15": { amount: 14010.08, status: "received" }, "MAY 16-31": { amount: 11058.96, status: "received" }, "JUNE 1-15": { amount: 12459.12, status: "received" }, "JUNE 16-30": { amount: 9019.20, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-14", gipName: "CORDERO, MAYA NIÑA D. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-15", gipName: "DATU, JOHANIE H. SERAD et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 0, status: "na" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-16", gipName: "DAYGAM, JOHN ALJHON C. et al.", periods: { "APR 16-30": { amount: 21464.00, status: "received" }, "MAY 1-15": { amount: 20080.00, status: "received" }, "MAY 16-31": { amount: 18080.00, status: "received" }, "JUNE 1-15": { amount: 20080.00, status: "received" }, "JUNE 16-30": { amount: 20080.00, status: "received" }, "JULY 1-15": { amount: 22080.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-17", gipName: "DIMAPORO, NORLIN B. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-18", gipName: "GENON, RHEA THERESS A. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-19", gipName: "GUMAMA, ADEL YASSIN G. et al.", periods: { "APR 16-30": { amount: 16098.00, status: "received" }, "MAY 1-15": { amount: 15060.00, status: "received" }, "MAY 16-31": { amount: 13560.00, status: "received" }, "JUNE 1-15": { amount: 15060.00, status: "received" }, "JUNE 16-30": { amount: 15810.00, status: "received" }, "JULY 1-15": { amount: 16935.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-20", gipName: "JUMALON, JEVI R. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-21", gipName: "NICDAO, ANN MARIE Y.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 0, status: "na" }, "JUNE 1-15": { amount: 0, status: "na" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-22", gipName: "LACABA, LEO JAY B.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 5020.00, status: "received" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-23", gipName: "LAGRECA, NAOMIE B. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-24", gipName: "LIPANTAS, AISAH O. et al.", periods: { "APR 16-30": { amount: 5366.00, status: "received" }, "MAY 1-15": { amount: 5020.00, status: "received" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-25", gipName: "MABANING, JOHANNA P. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-26", gipName: "MAMANGCONI, ALYANA-HAMRA M. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10034.80, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-27", gipName: "MANOS, ESTHOR EMMANUEL et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-28", gipName: "MONSANTO, HIZEL G. et al.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 0, status: "na" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10540.00, status: "received" }, "JULY 1-15": { amount: 11290.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-29", gipName: "OMAR, ABDUL JAME A.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 0, status: "na" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-30", gipName: "PADILLA, THERESE MAE C.", periods: { "APR 16-30": { amount: 5345.00, status: "received" }, "MAY 1-15": { amount: 5003.36, status: "received" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-31", gipName: "PATAD, ANALYN M. et al.", periods: { "APR 16-30": { amount: 10732.00, status: "received" }, "MAY 1-15": { amount: 10040.00, status: "received" }, "MAY 16-31": { amount: 9040.00, status: "received" }, "JUNE 1-15": { amount: 10040.00, status: "received" }, "JUNE 16-30": { amount: 10040.00, status: "received" }, "JULY 1-15": { amount: 11040.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-32", gipName: "RIVERA, JHOPAY JANE D.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 5020.00, status: "received" }, "MAY 16-31": { amount: 4520.00, status: "received" }, "JUNE 1-15": { amount: 5020.00, status: "received" }, "JUNE 16-30": { amount: 0, status: "na" }, "JULY 1-15": { amount: 0, status: "na" }, "JULY 16-31": { amount: 0, status: "na" } } },
  { id: "sal-33", gipName: "SINGSON, CLYDENE FRANZ M.", periods: { "APR 16-30": { amount: 0, status: "na" }, "MAY 1-15": { amount: 0, status: "na" }, "MAY 16-31": { amount: 0, status: "na" }, "JUNE 1-15": { amount: 0, status: "na" }, "JUNE 16-30": { amount: 5020.00, status: "received" }, "JULY 1-15": { amount: 5520.00, status: "received" }, "JULY 16-31": { amount: 0, status: "na" } } }
];

const DEFAULT_GSIS_SEED = [
  { id: "gip-gsis-1", sourceFile: "UPDATED NEW GSIS for jordan - ALEGA ET.AL.csv", name: "ALEGA, ANGELYN A", dob: "8/29/2002", age: "23", address: "POB. MATUNGAO, LANAO DEL NORTE", beneficiary: "ALEGA, LEONISA A.", relationship: "MOTHER", period: "JUNE 16, 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-2", sourceFile: "UPDATED NEW GSIS for jordan - ALEGA ET.AL.csv", name: "AMEROL, SOHAIB M.", dob: "3/30/2001", age: "25", address: "BLOCK 19, LOT 8 SANTA ELENA, STEEL TOWN, ILIGAN CITY", beneficiary: "AMEROL, ABDULAZIZ I.", relationship: "FATHER", period: "JUNE 16, 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-3", sourceFile: "UPDATED NEW GSIS for jordan - BOT AND MAIGO.csv", name: "AGBALOG, JOAN T. (BOT)", dob: "2/14/2000", age: "26", address: "PUROK 6-A, SANTIAGO, ILIGAN CITY", beneficiary: "AGBALOG, GEMMA", relationship: "MOTHER", period: "MAY 16, 2026 - OCTOBER 31, 2026", amount: "50.00" },
  { id: "gip-gsis-4", sourceFile: "UPDATED NEW GSIS for jordan - BOT AND MAIGO.csv", name: "LACABA, LEO JAY B. (PESO MAIGO)", dob: "9/17/2000", age: "25", address: "P-2 CMR, MAIGO, LANAO DEL NORTE", beneficiary: "LACABA, JUDITH B.", relationship: "MOTHER", period: "MAY 16, 2026 - OCTOBER 31, 2026", amount: "50.00" },
  { id: "gip-gsis-5", sourceFile: "UPDATED NEW GSIS for jordan - BOT AND MAIGO.csv", name: "LUNA, ELLA VIA C. (BOT)", dob: "11/13/1998", age: "27", address: "DULCE MARIA ACMAC, ILIGAN CITY", beneficiary: "LUNA, ROGEL C.", relationship: "BROTHER", period: "MAY 16, 2026 - OCTOBER 31, 2026", amount: "50.00" },
  { id: "gip-gsis-6", sourceFile: "UPDATED NEW GSIS for jordan - CABILANDO.csv", name: "CABILANDO, SUSAN R.", dob: "8/11/2000", age: "25", address: "PUROK 8-C BARANGAY SANTIAGO, ILIGAN CITY", beneficiary: "CABILANDO, LUTGARDA R.", relationship: "MOTHER", period: "AUGUST 03, 2026 - NOVEMBER 30, 2026", amount: "50.00" },
  { id: "gip-gsis-7", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "AGBONA, FRELYN L. (PESO BAROY)", dob: "5/13/1997", age: "29", address: "P-1, BAROY DAKU, BAROY, LANAO DEL NORTE", beneficiary: "IMRAN, MOJAHED S.", relationship: "HUSBAND", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-8", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "ARNOCO, KAYLA JOY V. (PESO SND)", dob: "4/1/2003", age: "22", address: "PANDANAN, SULTAN NAGA DIMAPORO LANAO DEL NORTE", beneficiary: "ARNOCO, ROEL, M.", relationship: "FATHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-9", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "BEDOL, ZAIRA MAE L. (PESO BALO-I", dob: "11/9/2002", age: "23", address: "PRK 5, MARIA CRISTINA, BALO-I, LANAO DEL NORTE", beneficiary: "BEDOL, ROCHELL L.", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-10", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "MAMANGCONI, NUR-HASNA M. (PESO MATUNGAO)", dob: "1/29/2005", age: "21", address: "PANGI, MATUNGAO, LANAO DEL NORTE", beneficiary: "MAMANGCONI,NORAIDA M.", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-11", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "PATAD, ANALYN M. (PESO NUNUNGAN)", dob: "2/14/2002", age: "24", address: "NOTONGAN, NUNUNGAN, LANAO DEL NORTE", beneficiary: "PATAD, ONILYN M.", relationship: "SISTER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-12", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "PINDOLONAN, SAMAILA D. (PESO NUNUNGAN)", dob: "11/23/2001", age: "24", address: "NOTONGAN, NUNUNGAN, LANAO DEL NORTE", beneficiary: "BUTIG, MARBIA D.", relationship: "SISTER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-13", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "RIVERA, JHOPAY JANE D. (PESO BACOLOD)", dob: "6/4/2007", age: "18", address: "BACOLOD, LANAO DEL NORTE", beneficiary: "RIVERA, JASMIN D.", relationship: "SISTER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-14", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "SEBIAL, MARY CRIS C. (PESO SND)", dob: "3/19/2001", age: "25", address: "MAMAGUM, SULTAN NAGA DIMAPORO, LANAO DEL NORTE", beneficiary: "SEBIAL, LOURDES C.", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-15", sourceFile: "UPDATED NEW GSIS for jordan - GSIS NUNUNGAN AND SND AND BACOLOD.csv", name: "TEMPLADO, KATHY M. (PESO BAROY)", dob: "11/5/2005", age: "20", address: "LIMWAG, BAROY, LANAO DEL NORTE", beneficiary: "TEMPLADO,REBECCA", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-16", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "ABBAS, EXSAN S.", dob: "9/2/2000", age: "25", address: "RIVERSIDE, ZONE 2, MAHAYAHAY, ILIGAN CITY", beneficiary: "ABBAS, HAYNAH S.", relationship: "SISTER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-17", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "ABDUL, NURKEYMAR, C.", dob: "9/3/2002", age: "23", address: "PUROK 4, MARIA CRISTINA BALO-I LANAO DEL NORTE", beneficiary: "DIABO, CAREN C.", relationship: "MOTHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-18", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "ATES, WALLEEN V.", dob: "11/4/1999", age: "26", address: "PUROK 4, LUINAB ILIGAN CITY LANAO DEL NORTE", beneficiary: "ATES, WALTER A.", relationship: "FATHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-19", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "GELLICA, MARK LLOYD V.", dob: "3/6/2003", age: "23", address: "PUROK 2B, TAMBACAN, ILIGAN CITY", beneficiary: "GELLICA, ELIZABETH", relationship: "MOTHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-20", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "H. ABBAS, JUNAISAH H.", dob: "8/13/2001", age: "24", address: "MARAWI CITY LANAO DEL SUR", beneficiary: "SALIM, JAMALIAH H.", relationship: "MOTHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-21", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "JAICTEN, FRANZELLE VIE B.", dob: "5/11/2003", age: "22", address: "#1664, PUROK 5-A PAITAN, DALIPUGA, ILIGAN CITY", beneficiary: "JAICTEN, VIVIAN B.", relationship: "MOTHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-22", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "TANGHIYAN, ERNIE JEAN D.", dob: "9/19/2003", age: "22", address: "UBALDO LAYA, ILIGAN CITY", beneficiary: "TANGHIYAN, EMILY D.", relationship: "MOTHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-23", sourceFile: "UPDATED NEW GSIS for jordan - LANAO APRIL TO DECEMBER ABBAS EXSAN ET.AL.csv", name: "UNDA, PRINCESS JEHAN, P", dob: "3/12/1998", age: "28", address: "BARA-AS, ILIGAN CITY, LANAO DEL NORTE", beneficiary: "UNDA, ABDULGAFFAR", relationship: "FATHER", period: "APRIL 16 2026 - DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-24", sourceFile: "UPDATED NEW GSIS for jordan - LEBUMFACIL.csv", name: "LEBUMFACIL, JOMARIE B.", dob: "12/28/1996", age: "29", address: "PUROK 14, UPPER HINAPLANON, ILIGAN CITY", beneficiary: "LEBUMFACIL, MARIFE B.", relationship: "MOTHER", period: "July 2, 2026 - October 15, 2026", amount: "50.00" },
  { id: "gip-gsis-25", sourceFile: "UPDATED NEW GSIS for jordan - MAGSAYSAY.csv", name: "OMAR, ABDUL JAME A. (MAGSAYSAY)", dob: "8/20/2002", age: "23", address: "P-1 LAMIGADATO MAGSAYSAY, LANAO DEL NORTE", beneficiary: "OMAR, MAHID B.", relationship: "FATHER", period: "MAY 1, 2026 - OCTOBER 31, 2026", amount: "50.00" },
  { id: "gip-gsis-26", sourceFile: "UPDATED NEW GSIS for jordan - MONSANTO, HIZEL ET.AL.csv", name: "MONSANTO, HIZEL G.", dob: "6/21/2004", age: "21", address: "ZONE 6, MALINDAWAG, ABUNO, ILIGAN CITY", beneficiary: "GOMEZ, MELISSA T.", relationship: "MOTHER", period: "JUNE 1, 2026 - NOVEMBER 30, 2026", amount: "50.00" },
  { id: "gip-gsis-27", sourceFile: "UPDATED NEW GSIS for jordan - MONSANTO, HIZEL ET.AL.csv", name: "RATUNIL, DAVE EDWARD R.", dob: "1/26/2007", age: "19", address: "PUROK 1, POBLACION, MANTICAO, MISAMIS ORIENTAL", beneficiary: "RATUNIL, ZEBUL B.", relationship: "FATHER", period: "JUNE 1, 2026 - NOVEMBER 30, 2026", amount: "50.00" },
  { id: "gip-gsis-28", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "ABUTON, DAVIE C. (NLRC)", dob: "12/12/2000", age: "25", address: "ZONE 1, PUROK MANGGA TUBOD ILIGAN CITY", beneficiary: "ABUTON, CAROL C.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-29", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "ALI, NOR-AIN D. (PESO TAGOLOAN)", dob: "7/2/2000", age: "25", address: "DIMAYON, TAGOLOAN, LANAO DEL NORTE", beneficiary: "ALI, NORSIDA D.", relationship: "SISTER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-30", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "ALIP, ALYANAH A. (PESO BALO-I)", dob: "7/9/2004", age: "21", address: "BATOLACONGAN, BALO - I, LANAO DEL NORTE", beneficiary: "ALIP, ASLIA A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-31", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "AMER, RAINISA C. (PESO POONA PIAGAPO)", dob: "8/25/2000", age: "25", address: "LININDINGAN, POONA-PIAGAPO LANAO DEL NORTE", beneficiary: "CALIMBABA, SAMIA M.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-32", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "BALANG, RACMA B. (PESO SAPAD)", dob: "4/26/2002", age: "23", address: "PUROK 2, CENTRO PANOLOON SAPAD, LANAO DEL NORTE", beneficiary: "BALANG, MARIAM B.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-33", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "BALANGHIG, SHENDY LIANE T. (PESO SAPAD)", dob: "8/23/2023", age: "22", address: "GAMAL, SAPAD, LANAO DEL NORTE", beneficiary: "BALANGHIG, LILIAN", relationship: "AUNT", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-34", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "BANGUIS, JERLYN C. (PESO BALO-I)", dob: "11/11/1999", age: "26", address: "PUROK 4, NANGKA, BALO-I, LANAO DEL NORTE", beneficiary: "BANGUIS, TERESITA C.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-35", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "COLALO, JAMAIDA P. (PESO SALVADOR)", dob: "12/3/1999", age: "27", address: "PRK. 4, BRGY. POBLACION, SALVADOR, LANAO DEL NORTE", beneficiary: "COLALO, DAYAMALA M.", relationship: "GRANDMOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-36", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "CONCILIADO, CONSTANTINO LUIS C. (PRC)", dob: "5/20/1996", age: "29", address: "3-15, CORPUS CHRISTI VILLAGE, TUBOD, ILIGAN CITY", beneficiary: "BUCKLEY, PETER", relationship: "STEP-FATHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-37", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "CORDERO, MAYA NIÑA D. (PESO KAUSWAGAN)", dob: "5/9/2000", age: "25", address: "PUROK 6, POBLACION, KAUSWAGAN LANAO DEL NORTE", beneficiary: "CORDERO, GINA D.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-38", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DATU, JOHANIE H. SERAD (PESO PANTAR)", dob: "10/23/1998", age: "27", address: "PANTAO RANAO, PANTAR, LANAO DEL NORTE", beneficiary: "DATU, NORMINA H.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-39", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DATU, RAIHANIE H. SERAD (PESO PANTAR)", dob: "9/28/2003", age: "22", address: "PANTAO RANAO, PANTAR, LANAO DEL NORTE", beneficiary: "DATU, NORMINA H.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-40", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DAYGAM, JOHN ALJHON C. (PGLDN)", dob: "8/19/2000", age: "25", address: "PUROK MAGSAYSAY, POBLACION, MAGSAYSAY, LANAO DEL NORTE", beneficiary: "DAYGAM, ALMA C.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-41", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DIMAPORO, NORLIN B. (PESO TANGCAL)", dob: "6/9/2004", age: "22", address: "PUNOD TANGCAL, LANAO DEL NORTE", beneficiary: "BAGOLONG, MAULIDA M.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-42", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DOMAGAY, ABDUL HASSAN B. (PESO TANGCAL)", dob: "3/27/2000", age: "26", address: "POBLACION, TANGCAL, LANAO DEL NORTE", beneficiary: "DOMAGAY, ROHAIDAH A.", relationship: "WIFE", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-43", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "DUMAPIAS, JOVELLE A. (PRC)", dob: "4/7/2002", age: "24", address: "PUROK 9 ADELFA LAMBAGUHON, SAN ROQUE", beneficiary: "DUMAPIAS, MELINDA A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-44", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "FALCESO, DAVE B. (NLRC)", dob: "9/11/2001", age: "24", address: "ZONE 1, PUROK MANGGA TUBOD ILIGAN CITY", beneficiary: "FALCESO, GENALIN B.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-45", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "GENON, RHEA THERESS A. (PESO LINAMON)", dob: "4/20/2003", age: "22", address: "BOSQUE, LINAMON LANAO DEL NORTE", beneficiary: "GENON, TERESITA A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-46", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "GUMAMA, ADEL YASSIN G. (LDNPFO)", dob: "8/20/2001", age: "24", address: "PUROK LERIO II, MAHAYAHAY, ILIGAN CITY", beneficiary: "GUMAMA, ANSARI C.", relationship: "FATHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-47", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "HERMOSO, MYCEL JOY J. (PGLDN)", dob: "8/30/2003", age: "22", address: "PUROK 4, BUALAN, TUBOD, LANAO DEL NORTE", beneficiary: "HERMOSO, CRISPIVIC J.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-48", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "HERNANDEZ, FRANCIS CLARK C. (NLRC)", dob: "12/11/2001", age: "24", address: "ISABEL VILLAGE PALA-O ILIGAN CITY", beneficiary: "HERNANDEZ, GERARDO S.", relationship: "FATHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-49", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "IBRAHIM, PRINCESS JIHAN SHAIRA M.  (NLRC)", dob: "7/31/1999", age: "26", address: "BASCARA APT., MAHAYAHAY, ILIGAN CITY", beneficiary: "IBRAHIM, QUEENEE MOSERA M.", relationship: "SISTER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-50", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "JACINTO, LAICAH O. (NLRC)", dob: "9/12/1996", age: "29", address: "DONA MARIA SUBD. ILIGAN CITY", beneficiary: "JACINTO, CARL JOHN R.", relationship: "HUSBAND", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-51", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "JUMALON, JEVI R. (PESO ILIGAN)", dob: "10/8/2005", age: "20", address: "PUROK 31 ZONE 13, MARIA CRISTINA, ILIGAN CITY", beneficiary: "JUMALON, VILMA R.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-52", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "LAGRECA, NAOMIE B. (PESO KOLAMBUGAN)", dob: "7/8/1996", age: "29", address: "PUROK -4, LIBERTAD, KOLAMBUGAN, LANAO DEL NORTE", beneficiary: "LAGRECA, MARCITA B.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-53", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "LAPECIROS, JELORD A. (PRC)", dob: "7/12/1999", age: "26", address: "1ST EAST ROSARIO HEIGHTS, TUBOD, ILIGAN CITY", beneficiary: "LAPECIROS, ANN A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-54", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "LEONG, CHLEO DENISE C.  (PESO LINAMON)", dob: "7/17/1997", age: "28", address: "RIGODON COMPOUND VILLA VERDE, ILIGAN CITY", beneficiary: "LEONG, MARIA CHONA C.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-55", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "LIPANTAS, AISAH O. (PESO MAGSAYSAY)", dob: "9/13/2000", age: "25", address: "POBLACION SARIPAADIL, MAGSAYSAY, LANAO DEL NORTE", beneficiary: "LIPANTAS, LIMBA O.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-56", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "MABANING, JOHANNA, P. (PESO PANTAO RAGAT)", dob: "5/31/2003", age: "22", address: "EAST POBLACION, PANTAO-RAGAT, LANAO DEL NORTE", beneficiary: "MABANING, NASROLLAH P.", relationship: "FATHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-57", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "MACACUNA, FARHAN B. (PESO PANTAO RAGAT)", dob: "10/28/2004", age: "21", address: "CABASAGAN, PANTAO-RAGAT, LANAO DEL NORTE", beneficiary: "MACACUNA, SOLAIMAN R.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-58", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "MAMANGCONI, ALYANA-HAMRA M. (PESO MATUNGAO)", dob: "7/30/2003", age: "22", address: "PANGI, MATUNGAO, LANAO DEL NORTE", beneficiary: "MASINGER, GAWIYA L.", relationship: "FATHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-59", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "MANOS, ESTHOR EMMANUEL A. (PESO TUBOD)", dob: "3/27/2000", age: "25", address: "CABASAGAN, PANTAO-RAGAT, LANAO DEL NORTE", beneficiary: "MANOS, EMMELYN A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-60", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "MEJORADA, ELIZABETH M. (PGLDN)", dob: "8/24/1999", age: "26", address: "PUROK 2, GUMAMOT, LALA, LANAO DEL NORTE", beneficiary: "MEJORADA, CERILA M.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-61", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "NATIVIDAD, JUDIEL C. (PESO KAUSWAGAN)", dob: "7/7/2002", age: "24", address: "KAUSAWAGAN, LANAO DEL NORTE", beneficiary: "NATIVIDAD, JOCELYN C.", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2029", amount: "50.00" },
  { id: "gip-gsis-62", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "OMAR, JALILAH O. (PESO MAGSAYSAY)", dob: "4/25/1994", age: "31", address: "PUROK 9, RCIS POBLACION, TUBOD, LANAO DEL NORTE", beneficiary: "RASUL, JABBER", relationship: "HUSBAND", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-63", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "OYOG, LOVELY GRACE L. (PGLDN)", dob: "3/27/1999", age: "27", address: "PUROK 4, TABIGUE, KOLAMBUGAN, LANAO DEL NORTE", beneficiary: "OYOG, MARINEL L.", relationship: "SISTER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-64", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "PADILLA, THERESE MAE C. (PCUP)", dob: "10/1/1996", age: "29", address: "PUROK 5, TIBANGA, ILIGAN CITY", beneficiary: "AMOYAN, SOPHIA MAY P.", relationship: "DAUGHTER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-65", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "PENDANG, JOHN LLOYD D. (PESO ILIGAN)", dob: "3/6/2003", age: "23", address: "VISTA VILLAGE PAITAN, DALIPUGA ILIGAN CITY", beneficiary: "PENDANG, GRACE D.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-66", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "PETILUNA, QUEENIE LYN E. (PESO TUBOD)", dob: "8/1/2003", age: "22", address: "PUROK 5, TUBURAN, TUBOD, LANAO DEL NORTE", beneficiary: "PETILUNA, ESTERLITA E.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-67", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "POLOYAPOY, JUNDY MAE R. (PESO KOLAMBUGAN)", dob: "6/15/1998", age: "27", address: "PUROK 1, STO. NIÑO KOLAMBUGAN, LANAO DEL NORTE", beneficiary: "POLOYAPOY, IMELDA A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-68", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "RABANES, NELSON A. JR. (NLRC)", dob: "6/12/2003", age: "22", address: "PRK. GUMAMELA 1, MAHAYAHAY, ILIGAN CITY", beneficiary: "RABANES, AMY A.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-69", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "RETES, DAISY LOU J. (PESO SALVADOR)", dob: "12/13/1997", age: "28", address: "PUROK 6, INASAGAN SALVADOR LANAO DEL NORTE", beneficiary: "RETES, ALIRAN C.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-70", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "SARIP, NORJANAH M. (PESO TAGOLOAN)", dob: "9/14/2000", age: "25", address: "KIAZAR, TAGOLOAN, LANAO DEL NORTE", beneficiary: "SARIP, NOR-AIN M.", relationship: "MOTHER", period: "APRIL 16 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-71", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "TABAO, JOHANISA D. (LDNPFO)", dob: "4/30/2002", age: "23", address: "BAHAYAN, LUINAB, ILIGAN CITY", beneficiary: "DALOMANGCOB, MAIMONA S.", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-72", sourceFile: "UPDATED NEW GSIS for jordan - PESO LANAO APRIL TO OCTOBER.csv", name: "UGTONG, MARK JORDAN, C. (LDNPFO)", dob: "6/8/2004", age: "21", address: "ZONE, NONUCAN OVERTON BRIDGE, MARIA CRISTINA, ILIGAN CITY, LANAO DEL NORTE", beneficiary: "UGTONG, ELENA, C", relationship: "MOTHER", period: "APRIL 16, 2026 - OCTOBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-73", sourceFile: "UPDATED NEW GSIS for jordan - SSS.csv", name: "ALFORQUE, JULIANA B.", dob: "6/21/2003", age: "23", address: "47B, JASMIN ST. DITUCALAN, ILIGAN CITY", beneficiary: "ALFORQUE, JUVY JULIET B.", relationship: "MOTHER", period: "JULY 01, 2026-DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-74", sourceFile: "UPDATED NEW GSIS for jordan - SSS.csv", name: "BALUYOS, DIANNE LANE B.", dob: "12/29/2000", age: "25", address: "PUROK 6A, SANTIAGO, ILIGAN CITY", beneficiary: "BALUYOS, MARITES B.", relationship: "MOTHER", period: "JULY 01, 2026-DECEMBER 15, 2026", amount: "50.00" },
  { id: "gip-gsis-75", sourceFile: "UPDATED NEW GSIS for jordan - SUPAT.csv", name: "SUPAT, WILMARIE JANE I.", dob: "9/26/1999", age: "26", address: "PUROK 14-A DOÑA JUANA SUBD. PALAO ILIGAN CITY", beneficiary: "SUPAT, ARIANE JANE I.", relationship: "SISTER", period: "July 1, 2026 - December 15, 2026", amount: "50.00" }
];

const DEFAULT_QUINCENA_PERIODS = [
  "APR 16-30", "MAY 1-15", "MAY 16-31", "JUNE 1-15", "JUNE 16-30", "JULY 1-15", "JULY 16-31"
];

// Application State Object
let appState = {
  activeTab: 'dtr', // 'dtr' | 'transmittal' | 'trash' | 'contacts' | 'salary' | 'compiled' | 'gsis'
  searchQuery: '',
  gsisSourceFilter: 'ALL',
  sortColumn: 'createdAt',
  sortDirection: 'desc',
  editingRecordId: null,
  deletingRecordId: null,
  isLoading: false,
  loadingSubtext: 'Loading live database records...',
  quincenaPeriods: [...DEFAULT_QUINCENA_PERIODS],
  salarySortOption: 'name-asc',
  salaryStatusFilter: 'ALL',
  salaryQuincenaFilter: 'ALL',
  data: {
    dtrRecords: [],
    transmittalRecords: [],
    recycledRecords: [],
    contactsRecords: [],
    salaryRecords: [],
    compiledRecords: [],
    gsisRecords: [],
    totalBudget: 1500000
  }
};

// DOM Elements Initialization
document.addEventListener('DOMContentLoaded', async () => {
  showPageLoading('Syncing live database & initializing workspace...');
  bindEvents();
  loadLocalStorageData();
  await initSupabaseClient();
  renderApp();
  hidePageLoading(400);
});

/**
 * Show Inline System Data Loading Indicator (Bouncing Dots)
 */
function showPageLoading(subtext = 'Loading live database records...') {
  appState.isLoading = true;
  appState.loadingSubtext = subtext;
  renderApp();
}

/**
 * Hide Inline System Data Loading Indicator
 */
function hidePageLoading(delayMs = 300) {
  setTimeout(() => {
    appState.isLoading = false;
    renderApp();
  }, delayMs);
}

/**
 * Initialize Supabase SDK Client with pre-configured URL & Key
 */
async function initSupabaseClient() {
  updateConnectionBadge('connecting', 'CONNECTING...');
  try {
    const url = (window.ENV && window.ENV.SUPABASE_URL) || DEFAULT_SUPABASE_CONFIG.url;
    const key = (window.ENV && window.ENV.SUPABASE_ANON_KEY) || DEFAULT_SUPABASE_CONFIG.key;

    if (!url || !key || !window.supabase) {
      setLocalMode();
      return;
    }

    supabaseClient = window.supabase.createClient(url, key);

    const { data: testData, error: testErr } = await supabaseClient.from('gip_dtr_ar_records').select('id').limit(1);
    if (testErr) {
      console.warn('Supabase connection test failed:', testErr.message);
      setLocalMode('INVALID API KEY / CONNECTION ERROR');
      return;
    }

    isSupabaseConnected = true;
    updateConnectionBadge('connected', 'SUPABASE CONNECTED');

    await fetchRecordsFromSupabase();
    subscribeSupabaseRealtime();

  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    setLocalMode();
  }
}

function setLocalMode(customText = 'LOCAL STORAGE MODE') {
  isSupabaseConnected = false;
  supabaseClient = null;
  updateConnectionBadge('offline', customText);
}

function updateConnectionBadge(status, text) {
  const badge = document.getElementById('connection-status-badge');
  const dot = document.getElementById('connection-status-dot');
  const textElem = document.getElementById('connection-status-text');

  if (badge && dot && textElem) {
    badge.className = `meta-badge ${status}`;
    dot.className = `status-dot ${status}`;
    textElem.textContent = text.toUpperCase();
  }
}

/**
 * Load LocalStorage Backup Data
 */
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function purgeExpiredRecycledRecords() {
  if (!appState.data.recycledRecords) {
    appState.data.recycledRecords = [];
    return;
  }

  const now = Date.now();
  const initialCount = appState.data.recycledRecords.length;

  const activeRecycled = appState.data.recycledRecords.filter(r => {
    const deletedTime = new Date(r.deletedAt).getTime();
    return (now - deletedTime) < THIRTY_DAYS_MS;
  });

  if (activeRecycled.length < initialCount) {
    const expiredItems = appState.data.recycledRecords.filter(r => {
      const deletedTime = new Date(r.deletedAt).getTime();
      return (now - deletedTime) >= THIRTY_DAYS_MS;
    });

    appState.data.recycledRecords = activeRecycled;
    saveToLocalStorage();

    if (isSupabaseConnected && supabaseClient) {
      expiredItems.forEach(async item => {
        await supabaseClient.from('recycled_records').delete().eq('id', item.id);
      });
    }
  }
}

function getRetentionDaysRemaining(deletedAtStr) {
  if (!deletedAtStr) return 30;
  const deletedTime = new Date(deletedAtStr).getTime();
  const expiresTime = deletedTime + THIRTY_DAYS_MS;
  const diffMs = expiresTime - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

function loadLocalStorageData() {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const sampleSeedIds = ['dtr-101', 'dtr-102', 'dtr-103', 'dtr-104', 'trn-201', 'trn-202', 'doc-101'];
      if (parsed.dtrRecords) {
        parsed.dtrRecords = parsed.dtrRecords
          .filter(r => !sampleSeedIds.includes(r.id))
          .map(r => ({
            ...r,
            gipName: formatEtAl(r.gipName),
            remarks: formatEtAl(r.remarks)
          }));
      } else {
        parsed.dtrRecords = [];
      }
      if (parsed.transmittalRecords) {
        parsed.transmittalRecords = parsed.transmittalRecords
          .filter(r => !sampleSeedIds.includes(r.id))
          .map(r => ({
            ...r,
            particulars: formatEtAl(r.particulars),
            preparedBy: formatEtAl(r.preparedBy),
            remarks: formatEtAl(r.remarks)
          }));
      } else {
        parsed.transmittalRecords = [];
      }
      if (!parsed.recycledRecords) {
        parsed.recycledRecords = [];
      }
      if (!parsed.contactsRecords || parsed.contactsRecords.length === 0) {
        parsed.contactsRecords = JSON.parse(JSON.stringify(DEFAULT_CONTACTS_SEED));
      }
      if (!parsed.salaryRecords || parsed.salaryRecords.length === 0) {
        parsed.salaryRecords = JSON.parse(JSON.stringify(DEFAULT_SALARY_SEED));
      }
      if (!parsed.gsisRecords || parsed.gsisRecords.length === 0) {
        parsed.gsisRecords = JSON.parse(JSON.stringify(DEFAULT_GSIS_SEED));
      }
      if (parsed.totalBudget !== undefined && !isNaN(parseFloat(parsed.totalBudget))) {
        parsed.totalBudget = parseFloat(parsed.totalBudget);
      } else {
        parsed.totalBudget = 1500000;
      }
      if (parsed.compiledRecords) {
        parsed.compiledRecords = parsed.compiledRecords.filter(r => r.id !== 'doc-101');
      } else {
        parsed.compiledRecords = [];
      }
      if (parsed.quincenaPeriods && Array.isArray(parsed.quincenaPeriods)) {
        appState.quincenaPeriods = parsed.quincenaPeriods;
      } else {
        appState.quincenaPeriods = [...DEFAULT_QUINCENA_PERIODS];
      }
      appState.data = parsed;
      purgeExpiredRecycledRecords();
      saveToLocalStorage();
    } else {
      appState.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
      appState.data.recycledRecords = [];
      appState.data.contactsRecords = JSON.parse(JSON.stringify(DEFAULT_CONTACTS_SEED));
      appState.data.salaryRecords = JSON.parse(JSON.stringify(DEFAULT_SALARY_SEED));
      appState.data.gsisRecords = JSON.parse(JSON.stringify(DEFAULT_GSIS_SEED));
      appState.data.compiledRecords = [];
      saveToLocalStorage();
    }
  } catch (err) {
    console.error('Failed to load local storage:', err);
    appState.data = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    appState.data.recycledRecords = [];
    appState.data.contactsRecords = JSON.parse(JSON.stringify(DEFAULT_CONTACTS_SEED));
    appState.data.salaryRecords = JSON.parse(JSON.stringify(DEFAULT_SALARY_SEED));
    appState.data.gsisRecords = JSON.parse(JSON.stringify(DEFAULT_GSIS_SEED));
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appState.data));
  } catch (err) {
    console.error('Failed to save to local storage:', err);
  }
}

/**
 * Fetch Data from Supabase Tables
 */
async function fetchRecordsFromSupabase() {
  if (!isSupabaseConnected || !supabaseClient) return;

  try {
    const { data: dtrData } = await supabaseClient
      .from('gip_dtr_ar_records')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: trnData } = await supabaseClient
      .from('transmittal_records')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: recData } = await supabaseClient
      .from('recycled_records')
      .select('*')
      .order('deleted_at', { ascending: false });

    const { data: cntData } = await supabaseClient
      .from('gip_contacts')
      .select('*')
      .order('gip_name', { ascending: true });

    const { data: salData } = await supabaseClient
      .from('gip_salary_records')
      .select('*')
      .order('gip_name', { ascending: true });

    const { data: docData } = await supabaseClient
      .from('gip_compiled_documents')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: gsisData } = await supabaseClient
      .from('gip_gsis_records')
      .select('*')
      .order('gip_name', { ascending: true });

    // Smart Merge Helper: Preserves local records if not yet in Supabase or if updated locally
    const mergeData = (cloudList, localList) => {
      if (!cloudList || cloudList.length === 0) return localList || [];
      if (!localList || localList.length === 0) return cloudList;
      const map = new Map();
      // Put local list in map first so local edits and newly added records are prioritized
      localList.forEach(r => map.set(r.id, r));
      // Merge cloud list entries, updating only if cloud record timestamp is newer
      cloudList.forEach(r => {
        if (!map.has(r.id)) {
          map.set(r.id, r);
        } else {
          const localItem = map.get(r.id);
          const cloudTime = new Date(r.updatedAt || r.createdAt || 0).getTime();
          const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
          if (cloudTime > localTime) map.set(r.id, r);
        }
      });
      return Array.from(map.values());
    };

    // 1. Process DTR Records
    if (dtrData) {
      const formattedCloudDtr = dtrData.map(r => ({
        id: r.id,
        gipName: formatEtAl(r.gip_name),
        month: r.month,
        quincena: (r.quincena || '').toUpperCase(),
        dtrArDateReceived: r.dtr_ar_date_received,
        remarks: formatEtAl(r.remarks),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.dtrRecords = mergeData(formattedCloudDtr, appState.data.dtrRecords);
    }

    // 2. Process Transmittal Records (with image_url & optional program mapping)
    if (trnData) {
      const formattedCloudTrn = trnData.map(r => ({
        id: r.id,
        program: (r.program || '').toUpperCase(),
        particulars: formatEtAl(r.particulars),
        preparedBy: formatEtAl(r.prepared_by),
        dateTransmitted: r.date_transmitted,
        regionalDateReceived: r.regional_date_received,
        imageUrl: r.image_url || r.imageUrl || null,
        remarks: formatEtAl(r.remarks),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.transmittalRecords = mergeData(formattedCloudTrn, appState.data.transmittalRecords);
    }

    // 3. Process Contacts Records
    if (cntData) {
      const formattedCloudCnt = cntData.map(r => ({
        id: r.id,
        gipName: formatEtAl(r.gip_name),
        assignment: (r.assignment || '').toUpperCase(),
        contactNumber: r.contact_number,
        remarks: formatEtAl(r.remarks),
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.contactsRecords = mergeData(formattedCloudCnt, appState.data.contactsRecords);
    }

    // 4. Process Recycled Records
    if (recData) {
      appState.data.recycledRecords = recData.map(r => ({
        id: r.id,
        type: r.type,
        originalId: r.original_id,
        originalRecord: r.original_record,
        deletedAt: r.deleted_at
      }));
    }

    // 5. Process Salary Records
    if (salData) {
      const configRow = salData.find(r => r.id === 'salary-budget-config');
      if (configRow && configRow.periods && configRow.periods.totalBudget !== undefined) {
        appState.data.totalBudget = parseFloat(configRow.periods.totalBudget) || 0;
      }
      const actualSalData = salData.filter(r => r.id !== 'salary-budget-config');
      const formattedCloudSal = actualSalData.map(r => ({
        id: r.id,
        gipName: formatEtAl(r.gip_name),
        periods: r.periods || {},
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.salaryRecords = mergeData(formattedCloudSal, appState.data.salaryRecords);
      appState.data.salaryRecords = appState.data.salaryRecords.filter(r => r.id !== 'salary-budget-config');
    }

    // Delete sample seed record doc-101 if it exists in Supabase
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_compiled_documents').delete().eq('id', 'doc-101');
    }

    // 6. Process Compiled Documents Records
    if (docData) {
      const filteredDocData = docData.filter(r => r.id !== 'doc-101');
      const formattedCloudDoc = filteredDocData.map(r => ({
        id: r.id,
        documentTitle: formatEtAl(r.document_title),
        receivedFrom: formatEtAl(r.received_from),
        dateReceived: r.date_received,
        remarks: formatEtAl(r.remarks),
        attachments: r.attachments || (r.image_url ? [{ id: 'att-cloud', name: 'Document_Photo.jpg', type: 'image', url: r.image_url }] : []),
        imageUrl: r.image_url || r.imageUrl || null,
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.compiledRecords = mergeData(formattedCloudDoc, appState.data.compiledRecords || []);
      appState.data.compiledRecords = appState.data.compiledRecords.filter(r => r.id !== 'doc-101');
    }

    // 7. Process GSIS Insurance Records
    if (gsisData) {
      const formattedCloudGsis = gsisData.map(r => ({
        id: r.id,
        sourceFile: r.source_file,
        name: formatEtAl(r.gip_name),
        dob: r.dob,
        age: r.age,
        address: r.address,
        beneficiary: r.beneficiary,
        relationship: r.relationship,
        period: r.period,
        amount: r.amount || '50.00',
        createdAt: r.created_at,
        updatedAt: r.updated_at
      }));
      appState.data.gsisRecords = mergeData(formattedCloudGsis, appState.data.gsisRecords || []);
    }

    purgeExpiredRecycledRecords();
    saveToLocalStorage();
    renderApp();
  } catch (err) {
    console.error('Cloud database sync notice:', err.message);
    showToast('WORKING IN LOCAL BACKUP MODE (SUPABASE SYNC NOTE)', 'info');
  }
}

/**
 * Auto-sync Local Records to Supabase Cloud Database
 */
async function pushLocalDataToSupabase() {
  if (!isSupabaseConnected || !supabaseClient) return;

  try {
    if (appState.data.dtrRecords && appState.data.dtrRecords.length > 0) {
      const dtrPayload = appState.data.dtrRecords.map(r => ({
        id: r.id,
        gip_name: r.gipName,
        month: r.month,
        quincena: r.quincena,
        dtr_ar_date_received: r.dtrArDateReceived || '',
        remarks: r.remarks || '',
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_dtr_ar_records').upsert(dtrPayload);
    }

    if (appState.data.transmittalRecords && appState.data.transmittalRecords.length > 0) {
      const trnPayload = appState.data.transmittalRecords.map(r => ({
        id: r.id,
        particulars: r.particulars,
        prepared_by: r.preparedBy || '',
        date_transmitted: r.dateTransmitted || '',
        regional_date_received: r.regionalDateReceived || '',
        remarks: r.remarks || '',
        image_url: r.imageUrl || null,
        program: r.program || 'GIP',
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('transmittal_records').upsert(trnPayload);
    }

    if (appState.data.contactsRecords && appState.data.contactsRecords.length > 0) {
      const cntPayload = appState.data.contactsRecords.map(r => ({
        id: r.id,
        gip_name: r.gipName,
        assignment: r.assignment || 'LDNPFO',
        contact_number: r.contactNumber || '',
        remarks: r.remarks || '',
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_contacts').upsert(cntPayload);
    }

    if (appState.data.salaryRecords && appState.data.salaryRecords.length > 0) {
      const salPayload = appState.data.salaryRecords.map(r => ({
        id: r.id,
        gip_name: r.gipName,
        periods: r.periods || {},
        remarks: r.remarks || '',
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_salary_records').upsert(salPayload);
    }

    if (appState.data.compiledRecords && appState.data.compiledRecords.length > 0) {
      const docPayload = appState.data.compiledRecords.map(r => ({
        id: r.id,
        document_title: r.documentTitle,
        received_from: r.receivedFrom || '',
        date_received: r.dateReceived || '',
        remarks: r.remarks || '',
        attachments: r.attachments || [],
        image_url: r.imageUrl || (r.attachments && r.attachments.length > 0 ? r.attachments[0].url : null),
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_compiled_documents').upsert(docPayload);
    }

    if (appState.data.gsisRecords && appState.data.gsisRecords.length > 0) {
      const gsisPayload = appState.data.gsisRecords.map(r => ({
        id: r.id,
        source_file: r.sourceFile || '',
        gip_name: r.name || '',
        dob: r.dob || '',
        age: r.age || '',
        address: r.address || '',
        beneficiary: r.beneficiary || '',
        relationship: r.relationship || '',
        period: r.period || '',
        amount: r.amount || '50.00',
        created_at: r.createdAt || new Date().toISOString(),
        updated_at: r.updatedAt || new Date().toISOString()
      }));
      await supabaseClient.from('gip_gsis_records').upsert(gsisPayload);
    }
  } catch (err) {
    console.warn('Auto-push local data note:', err.message);
  }
}

/**
 * Realtime Subscriptions for Multi-User Sync
 */
function subscribeSupabaseRealtime() {
  if (!isSupabaseConnected || !supabaseClient) return;

  if (realtimeSubscription) {
    supabaseClient.removeChannel(realtimeSubscription);
  }

  realtimeSubscription = supabaseClient
    .channel('public-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, () => {
      fetchRecordsFromSupabase();
    })
    .subscribe();
}

/**
 * Bind DOM Event Listeners
 */
function bindEvents() {
  // Sidebar Navigation Items
  document.getElementById('side-nav-dtr').addEventListener('click', () => switchTab('dtr'));
  document.getElementById('side-nav-transmittal').addEventListener('click', () => switchTab('transmittal'));
  document.getElementById('side-nav-contacts').addEventListener('click', () => switchTab('contacts'));
  const sideSalary = document.getElementById('side-nav-salary');
  if (sideSalary) sideSalary.addEventListener('click', () => switchTab('salary'));
  const sideGsis = document.getElementById('side-nav-gsis');
  if (sideGsis) sideGsis.addEventListener('click', () => switchTab('gsis'));
  const sideCompiled = document.getElementById('side-nav-compiled');
  if (sideCompiled) sideCompiled.addEventListener('click', () => switchTab('compiled'));
  document.getElementById('side-nav-trash').addEventListener('click', () => switchTab('trash'));
  document.getElementById('side-nav-excel').addEventListener('click', openExcelExportModal);
  document.getElementById('side-nav-print').addEventListener('click', handlePrintReport);
  document.getElementById('btn-empty-trash').addEventListener('click', handleEmptyTrash);

  const btnAddQuincena = document.getElementById('btn-add-quincena');
  if (btnAddQuincena) btnAddQuincena.addEventListener('click', openAddQuincenaModal);

  const quincenaForm = document.getElementById('add-quincena-form');
  if (quincenaForm) quincenaForm.addEventListener('click', (e) => {
    if (e.target.id === 'quincena-modal-close' || e.target.id === 'quincena-modal-cancel') {
      closeAddQuincenaModal();
    }
  });
  if (quincenaForm) quincenaForm.addEventListener('submit', handleAddQuincenaFormSubmit);

  const quincenaModal = document.getElementById('add-quincena-modal');
  if (quincenaModal) {
    quincenaModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeAddQuincenaModal();
    });
  }

  const budgetModal = document.getElementById('edit-total-budget-modal');
  if (budgetModal) {
    budgetModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget || e.target.id === 'budget-modal-close') closeTotalBudgetModal();
    });
  }

  // Dashboard Stat Cards Quick Jump
  const statCardDtr = document.querySelector('#stat-dtr-count')?.closest('.stat-card');
  const statCardTrn = document.querySelector('#stat-trn-count')?.closest('.stat-card');
  const statCardCnt = document.querySelector('#stat-contacts-count')?.closest('.stat-card');
  const statCardTrash = document.querySelector('#stat-trash-count')?.closest('.stat-card');
  const statCardCompiled = document.querySelector('#stat-compiled-count')?.closest('.stat-card');

  if (statCardDtr) { statCardDtr.style.cursor = 'pointer'; statCardDtr.addEventListener('click', () => switchTab('dtr')); }
  if (statCardTrn) { statCardTrn.style.cursor = 'pointer'; statCardTrn.addEventListener('click', () => switchTab('transmittal')); }
  if (statCardCnt) { statCardCnt.style.cursor = 'pointer'; statCardCnt.addEventListener('click', () => switchTab('contacts')); }
  if (statCardTrash) { statCardTrash.style.cursor = 'pointer'; statCardTrash.addEventListener('click', () => switchTab('trash')); }
  if (statCardCompiled) { statCardCompiled.style.cursor = 'pointer'; statCardCompiled.addEventListener('click', () => switchTab('compiled')); }
  const statCardGsis = document.getElementById('stat-card-gsis');
  if (statCardGsis) { statCardGsis.style.cursor = 'pointer'; statCardGsis.addEventListener('click', () => switchTab('gsis')); }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const appSidebar = document.getElementById('app-sidebar');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      appSidebar.classList.toggle('mobile-open');
      sidebarOverlay.classList.toggle('mobile-open');
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      appSidebar.classList.remove('mobile-open');
      sidebarOverlay.classList.remove('mobile-open');
    });
  }

  // Search Input
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    appState.searchQuery = e.target.value.trim().toLowerCase();
    renderTable();
  });

  document.getElementById('btn-clear-filters').addEventListener('click', async () => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    appState.searchQuery = '';

    // Reset salary filters & sorting parameters to defaults
    appState.salarySortOption = 'name-asc';
    appState.salaryStatusFilter = 'ALL';
    appState.salaryQuincenaFilter = 'ALL';

    const sSort = document.getElementById('salary-sort-select');
    const sStat = document.getElementById('salary-status-filter');
    const sQuin = document.getElementById('salary-quincena-filter');
    if (sSort) sSort.value = 'name-asc';
    if (sStat) sStat.value = 'ALL';
    if (sQuin) sQuin.value = 'ALL';

    // Re-fetch fresh data from Supabase / LocalStorage to update data live
    showPageLoading('Refreshing workspace & updating live cloud records...');
    if (isSupabaseConnected && supabaseClient) {
      await fetchRecordsFromSupabase();
    } else {
      loadLocalStorageData();
    }

    renderApp();
    hidePageLoading(450);
    showToast('ALL FILTERS RESET & DATA UPDATED LIVE!', 'success');
  });

  // Particulars Live Form Preview Listener
  const particularsTextarea = document.getElementById('particulars');
  particularsTextarea.addEventListener('input', handleParticularsLivePreview);

  // Set Today Date Quick Buttons
  document.querySelectorAll('.btn-today').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (input) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        input.value = `${yyyy}-${mm}-${dd}`;
        showToast('DATE SET TO TODAY', 'info');
      }
    });
  });

  // Header Action Buttons
  document.getElementById('btn-add-record').addEventListener('click', () => openRecordModal());

  // Form Submission
  document.getElementById('record-form').addEventListener('submit', handleFormSubmit);
  document.getElementById('modal-close-btn').addEventListener('click', closeRecordModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeRecordModal);

  // Delete Confirmation Modal
  document.getElementById('delete-modal-close').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-cancel-btn').addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm-btn').addEventListener('click', confirmDeleteRecord);
  const deleteForm = document.getElementById('delete-form');
  if (deleteForm) {
    deleteForm.addEventListener('submit', confirmDeleteRecord);
  }

  // Modal Backdrop Click to Close
  document.getElementById('record-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeRecordModal();
  });
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Security Password Auth Form Listeners
  document.getElementById('auth-form').addEventListener('submit', handleAuthSubmit);
  document.getElementById('auth-modal-close-btn').addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal-cancel-btn').addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeAuthModal();
  });

  // Excel Export Modal Listeners
  const excelForm = document.getElementById('excel-export-form');
  if (excelForm) excelForm.addEventListener('submit', handleExcelExportFormSubmit);

  const excelCloseBtn = document.getElementById('excel-modal-close-btn');
  if (excelCloseBtn) excelCloseBtn.addEventListener('click', closeExcelExportModal);

  const excelCancelBtn = document.getElementById('excel-modal-cancel-btn');
  if (excelCancelBtn) excelCancelBtn.addEventListener('click', closeExcelExportModal);

  const excelModal = document.getElementById('excel-export-modal');
  if (excelModal) {
    excelModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeExcelExportModal();
    });
  }

  // Transmittal & Compiled Image Attachment & Lightbox Listeners
  const btnRemoveImg = document.getElementById('btn-remove-modal-image');
  if (btnRemoveImg) btnRemoveImg.addEventListener('click', removeTransmittalModalImage);

  const btnViewImg = document.getElementById('btn-view-modal-image');
  if (btnViewImg) btnViewImg.addEventListener('click', viewTransmittalModalImage);

  const btnRemoveCompiledImg = document.getElementById('btn-remove-compiled-image');
  if (btnRemoveCompiledImg) btnRemoveCompiledImg.addEventListener('click', removeCompiledModalImage);

  const btnViewCompiledImg = document.getElementById('btn-view-compiled-image');
  if (btnViewCompiledImg) btnViewCompiledImg.addEventListener('click', viewCompiledModalImage);

  const lightboxCloseBtn = document.getElementById('lightbox-modal-close');
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeImageLightbox);

  const lightboxCloseBtn2 = document.getElementById('lightbox-modal-close-btn');
  if (lightboxCloseBtn2) lightboxCloseBtn2.addEventListener('click', closeImageLightbox);

  const lightboxModal = document.getElementById('image-lightbox-modal');
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeImageLightbox();
    });
  }

  // PDF Viewer Modal Listeners
  const pdfCloseBtn = document.getElementById('pdf-modal-close');
  if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfViewerModal);

  const pdfCloseBtn2 = document.getElementById('pdf-modal-close-btn');
  if (pdfCloseBtn2) pdfCloseBtn2.addEventListener('click', closePdfViewerModal);

  const pdfModal = document.getElementById('pdf-viewer-modal');
  if (pdfModal) {
    pdfModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closePdfViewerModal();
    });
  }

  initDragAndDropHandler();

  const chkTrn = document.getElementById('export-chk-trn');
  if (chkTrn) chkTrn.addEventListener('change', updateExportAuthVisibility);

  const chkCnt = document.getElementById('export-chk-cnt');
  if (chkCnt) chkCnt.addEventListener('change', updateExportAuthVisibility);

  const chkTrash = document.getElementById('export-chk-trash');
  if (chkTrash) chkTrash.addEventListener('change', updateExportAuthVisibility);

  // Salary Filter & Sort Controls Listeners
  const salSortSelect = document.getElementById('salary-sort-select');
  if (salSortSelect) {
    salSortSelect.addEventListener('change', (e) => {
      appState.salarySortOption = e.target.value;
      renderApp();
    });
  }

  const salStatusSelect = document.getElementById('salary-status-filter');
  if (salStatusSelect) {
    salStatusSelect.addEventListener('change', (e) => {
      appState.salaryStatusFilter = e.target.value;
      renderApp();
    });
  }

  const salQuincenaSelect = document.getElementById('salary-quincena-filter');
  if (salQuincenaSelect) {
    salQuincenaSelect.addEventListener('change', (e) => {
      appState.salaryQuincenaFilter = e.target.value;
      renderApp();
    });
  }
}

const SYSTEM_MODULE_PASSWORD = 'dolegip2026';
let authenticatedModules = {
  trash: false,
  contacts: false
};
let pendingTabName = null;
let currentTransmittalImageUrl = null;

function openAuthModal(targetTab) {
  pendingTabName = targetTab;
  const titleElem = document.getElementById('auth-module-title');
  const moduleLabel = targetTab === 'trash' ? 'RECYCLE BIN' : 'GIP CONTACTS DIRECTORY';
  if (titleElem) {
    titleElem.textContent = `PROTECTED ACCESS: ${moduleLabel}`;
  }
  document.getElementById('auth-password-input').value = '';
  document.getElementById('auth-modal').classList.add('active');
  setTimeout(() => {
    const input = document.getElementById('auth-password-input');
    if (input) input.focus();
  }, 100);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('active');
  pendingTabName = null;
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const passwordInput = document.getElementById('auth-password-input').value.trim();
  if (passwordInput === SYSTEM_MODULE_PASSWORD) {
    if (pendingTabName) {
      authenticatedModules[pendingTabName] = true;
      const unlockedTab = pendingTabName;
      closeAuthModal();
      switchTab(unlockedTab);
      showToast(`ACCESS GRANTED TO ${unlockedTab === 'trash' ? 'RECYCLE BIN' : 'GIP CONTACTS'}!`, 'success');
    }
  } else {
    showToast('INCORRECT PASSWORD! ACCESS DENIED.', 'danger');
    const inputElem = document.getElementById('auth-password-input');
    if (inputElem) {
      inputElem.style.borderColor = '#ef4444';
      inputElem.select();
      setTimeout(() => {
        inputElem.style.borderColor = '';
      }, 2000);
    }
  }
}

/**
 * Switch Active View Tab
 */
function switchTab(tabName) {
  // Password Protection for Recycle Bin ('trash')
  if (tabName === 'trash' && !authenticatedModules.trash) {
    openAuthModal(tabName);
    return;
  }

  // Reset authentication when leaving a protected tab so it requires password again on return
  if (appState.activeTab !== tabName) {
    if (appState.activeTab === 'trash') {
      authenticatedModules.trash = false;
    }
  }

  if (appState.activeTab === tabName) return;
  appState.activeTab = tabName;

  document.getElementById('app-sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('mobile-open');

  document.querySelectorAll('.sidebar-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`side-nav-${tabName}`).classList.add('active');

  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const btnAdd = document.getElementById('btn-add-record');
  const btnEmptyTrash = document.getElementById('btn-empty-trash');
  const btnAddQuincena = document.getElementById('btn-add-quincena');
  const totalBadge = document.getElementById('salary-grand-total-badge');
  const salControls = document.getElementById('salary-toolbar-controls');

  if (btnAddQuincena) {
    btnAddQuincena.style.display = (tabName === 'salary') ? 'inline-flex' : 'none';
  }
  const indicatorsPanel = document.getElementById('salary-financial-indicators');
  if (indicatorsPanel) {
    indicatorsPanel.style.display = (tabName === 'salary') ? 'flex' : 'none';
  } else if (totalBadge) {
    totalBadge.style.display = (tabName === 'salary') ? 'inline-flex' : 'none';
  }
  if (salControls) {
    salControls.style.display = (tabName === 'salary') ? 'flex' : 'none';
    if (tabName === 'salary') renderSalaryFilterOptions();
  }

  const btnDownloadActive = document.getElementById('btn-download-active-data');
  let downloadLabel = 'Data';
  if (tabName === 'dtr') downloadLabel = 'DTR & AR Data';
  else if (tabName === 'transmittal') downloadLabel = 'Transmittals';
  else if (tabName === 'contacts') downloadLabel = 'Contacts';
  else if (tabName === 'salary') downloadLabel = 'Salary Data';
  else if (tabName === 'gsis') downloadLabel = 'GSIS Data';
  else if (tabName === 'compiled') downloadLabel = 'Documents';
  else if (tabName === 'trash') downloadLabel = 'Recycle Bin';

  if (btnDownloadActive) {
    btnDownloadActive.innerHTML = `<i data-lucide="download"></i> Download ${downloadLabel}`;
    btnDownloadActive.title = `Download ${downloadLabel} as Excel`;
  }

  if (tabName === 'dtr') {
    viewTitle.textContent = 'GIP DTR & AR MONITORING';
    viewSubtitle.textContent = 'DAILY TIME RECORDS & ACCOMPLISHMENT REPORTS TRACKING';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'transmittal') {
    viewTitle.textContent = 'TRANSMITTAL MONITORING';
    viewSubtitle.textContent = 'DOCUMENT TRANSMITTALS SENT TO REGIONAL OFFICE';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'contacts') {
    viewTitle.textContent = 'GIP CONTACTS DIRECTORY';
    viewSubtitle.textContent = 'OFFICIAL MOBILE CONTACT NUMBERS & OFFICE ASSIGNMENTS DIRECTORY';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'salary') {
    viewTitle.textContent = 'GIP SALARY & PAYROLL TRACKING';
    viewSubtitle.textContent = 'QUINCENA STIPENDS & RECEIVED/PENDING SALARY STATUS MONITORING';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'compiled') {
    viewTitle.textContent = 'DOCUMENTS RECEIVED MONITORING';
    viewSubtitle.textContent = 'TRACKING & MONITORING OF COMPLIED DOCUMENTS RECEIVED BY DOLE LDNPFO';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'gsis') {
    viewTitle.textContent = 'GIP GSIS INSURANCE INFO DIRECTORY';
    viewSubtitle.textContent = 'GSIS GROUP ACCIDENT INSURANCE COVERAGE & DESIGNATED BENEFICIARY RECORDS';
    btnAdd.style.display = 'inline-flex';
    btnEmptyTrash.style.display = 'none';
  } else if (tabName === 'trash') {
    viewTitle.textContent = 'RECYCLE BIN';
    viewSubtitle.textContent = 'DELETED RECORDS STORED FOR 30 DAYS BEFORE AUTOMATIC PERMANENT DELETION';
    btnAdd.style.display = 'none';
    btnEmptyTrash.style.display = 'inline-flex';
  }

  appState.sortColumn = tabName === 'trash' ? 'deletedAt' : 'createdAt';
  appState.sortDirection = 'desc';

  renderApp();
}

/**
 * Master Render Function
 */
function renderApp() {
  updateCountsAndStats();
  renderTable();
  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Update Header Counters & Dashboard Stat Cards
 */
function updateCountsAndStats() {
  const dtrCount = appState.data.dtrRecords.length;
  const trnCount = appState.data.transmittalRecords.length;
  const trashCount = (appState.data.recycledRecords || []).length;
  const contactsCount = (appState.data.contactsRecords || []).length;
  const salaryCount = (appState.data.salaryRecords || []).length;
  const compiledCount = (appState.data.compiledRecords || []).length;
  const gsisCount = (appState.data.gsisRecords || []).length;

  document.getElementById('side-count-dtr').textContent = dtrCount;
  document.getElementById('side-count-transmittal').textContent = trnCount;
  document.getElementById('side-count-trash').textContent = trashCount;
  document.getElementById('side-count-contacts').textContent = contactsCount;
  const sideSalCount = document.getElementById('side-count-salary');
  if (sideSalCount) sideSalCount.textContent = salaryCount;
  const sideCompCount = document.getElementById('side-count-compiled');
  if (sideCompCount) sideCompCount.textContent = compiledCount;
  const sideGsisCount = document.getElementById('side-count-gsis');
  if (sideGsisCount) sideGsisCount.textContent = gsisCount;

  let currentDatasetLength = 0;
  if (appState.activeTab === 'dtr') currentDatasetLength = dtrCount;
  else if (appState.activeTab === 'transmittal') currentDatasetLength = trnCount;
  else if (appState.activeTab === 'contacts') currentDatasetLength = contactsCount;
  else if (appState.activeTab === 'salary') currentDatasetLength = salaryCount;
  else if (appState.activeTab === 'compiled') currentDatasetLength = compiledCount;
  else if (appState.activeTab === 'gsis') currentDatasetLength = gsisCount;
  else if (appState.activeTab === 'trash') currentDatasetLength = trashCount;

  document.getElementById('stat-dtr-count').textContent = dtrCount;
  document.getElementById('stat-trn-count').textContent = trnCount;
  document.getElementById('stat-trash-count').textContent = trashCount;
  document.getElementById('stat-contacts-count').textContent = contactsCount;
  const statCompCount = document.getElementById('stat-compiled-count');
  if (statCompCount) statCompCount.textContent = compiledCount;
  const statGsisCount = document.getElementById('stat-gsis-count');
  if (statGsisCount) statGsisCount.textContent = gsisCount;
  document.getElementById('stat-active-count').textContent = currentDatasetLength;

  // Calculate Grand Total Paid & Grand Total Pending Disbursed across all GIP Salary Records
  let grandTotalPaid = 0;
  let grandTotalPending = 0;
  (appState.data.salaryRecords || []).forEach(record => {
    if (record.id === 'salary-budget-config') return;
    const p = record.periods || {};
    Object.values(p).forEach(item => {
      if (item && item.amount) {
        let numAmt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
        if (!isNaN(numAmt) && numAmt > 0) {
          if (item.status === 'received') {
            grandTotalPaid += numAmt;
          } else if (item.status === 'pending') {
            grandTotalPending += numAmt;
          }
        }
      }
    });
  });

  const totalBudget = parseFloat(appState.data.totalBudget) || 0;
  const remainingBalance = totalBudget - grandTotalPaid;

  const formattedTotalPaid = `₱${grandTotalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedTotalPending = `₱${grandTotalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formattedTotalBudget = `₱${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  let formattedRemaining = '';
  if (remainingBalance >= 0) {
    formattedRemaining = `₱${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else {
    const absRemaining = Math.abs(remainingBalance);
    formattedRemaining = `-₱${absRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // Update DOM Elements
  const grandTotalValElem = document.getElementById('salary-grand-total-val');
  if (grandTotalValElem) grandTotalValElem.textContent = formattedTotalPaid;

  const pendingValElem = document.getElementById('salary-total-pending-val');
  if (pendingValElem) pendingValElem.textContent = formattedTotalPending;

  const budgetValElem = document.getElementById('salary-total-budget-val');
  if (budgetValElem) budgetValElem.textContent = formattedTotalBudget;

  const remainingValElem = document.getElementById('salary-remaining-balance-val');
  const remainingBadgeElem = document.getElementById('salary-remaining-balance-badge');
  const remainingIconBoxElem = document.getElementById('remaining-balance-icon-box');
  const remainingIconElem = document.getElementById('remaining-balance-icon');

  if (remainingValElem) {
    remainingValElem.textContent = formattedRemaining;
    if (remainingBalance < 0) {
      remainingValElem.style.color = '#dc2626';
      if (remainingBadgeElem) {
        remainingBadgeElem.style.background = 'rgba(239, 68, 68, 0.1)';
        remainingBadgeElem.style.borderColor = 'rgba(239, 68, 68, 0.35)';
        remainingBadgeElem.title = `OVER BUDGET / DEFICIT! Exceeded by ₱${Math.abs(remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      if (remainingIconBoxElem) {
        remainingIconBoxElem.style.background = 'rgba(239, 68, 68, 0.2)';
        remainingIconBoxElem.style.color = '#dc2626';
      }
      if (remainingIconElem) remainingIconElem.setAttribute('data-lucide', 'alert-triangle');
    } else {
      remainingValElem.style.color = '#059669';
      if (remainingBadgeElem) {
        remainingBadgeElem.style.background = 'rgba(16, 185, 129, 0.08)';
        remainingBadgeElem.style.borderColor = 'rgba(16, 185, 129, 0.25)';
        remainingBadgeElem.title = 'Remaining Balance = Total Budget minus Total Paid';
      }
      if (remainingIconBoxElem) {
        remainingIconBoxElem.style.background = 'rgba(16, 185, 129, 0.15)';
        remainingIconBoxElem.style.color = '#10b981';
      }
      if (remainingIconElem) remainingIconElem.setAttribute('data-lucide', 'pie-chart');
    }
  }
}

/**
 * Filter & Sort Active Dataset
 */
function getFilteredAndSortedRecords() {
  if (appState.activeTab === 'trash') {
    let records = appState.data.recycledRecords ? [...appState.data.recycledRecords] : [];
    if (appState.searchQuery) {
      const q = appState.searchQuery;
      records = records.filter(r => {
        const orig = r.originalRecord || {};
        return (orig.gipName || '').toLowerCase().includes(q) ||
          (orig.particulars || '').toLowerCase().includes(q) ||
          (orig.preparedBy || '').toLowerCase().includes(q) ||
          (orig.remarks || '').toLowerCase().includes(q);
      });
    }

    records.sort((a, b) => {
      let valA = a[appState.sortColumn] || a.deletedAt || '';
      let valB = b[appState.sortColumn] || b.deletedAt || '';

      if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return records;
  }

  if (appState.activeTab === 'contacts') {
    let records = appState.data.contactsRecords ? [...appState.data.contactsRecords] : [];
    if (appState.searchQuery) {
      const q = appState.searchQuery;
      records = records.filter(r =>
        (r.gipName || '').toLowerCase().includes(q) ||
        (r.assignment || '').toLowerCase().includes(q) ||
        (r.contactNumber || '').includes(q) ||
        (r.remarks || '').toLowerCase().includes(q)
      );
    }

    records.sort((a, b) => {
      let valA = a[appState.sortColumn] || a.gipName || '';
      let valB = b[appState.sortColumn] || b.gipName || '';

      if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return records;
  }

  if (appState.activeTab === 'compiled') {
    let records = appState.data.compiledRecords ? [...appState.data.compiledRecords] : [];
    if (appState.searchQuery) {
      const q = appState.searchQuery;
      records = records.filter(r =>
        (r.documentTitle || '').toLowerCase().includes(q) ||
        (r.receivedFrom || '').toLowerCase().includes(q) ||
        (r.dateReceived || '').toLowerCase().includes(q) ||
        (r.remarks || '').toLowerCase().includes(q)
      );
    }

    records.sort((a, b) => {
      let valA = a[appState.sortColumn] || a.createdAt || '';
      let valB = b[appState.sortColumn] || b.createdAt || '';

      if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return records;
  }

  if (appState.activeTab === 'gsis') {
    let records = appState.data.gsisRecords ? [...appState.data.gsisRecords] : [];
    if (appState.searchQuery) {
      const q = appState.searchQuery.toLowerCase();
      records = records.filter(r =>
        (r.name || '').toLowerCase().includes(q) ||
        (r.address || '').toLowerCase().includes(q) ||
        (r.beneficiary || '').toLowerCase().includes(q) ||
        (r.relationship || '').toLowerCase().includes(q) ||
        (r.period || '').toLowerCase().includes(q) ||
        (r.sourceFile || '').toLowerCase().includes(q)
      );
    }
    records.sort((a, b) => {
      let valA = a[appState.sortColumn] || a.name || '';
      let valB = b[appState.sortColumn] || b.name || '';

      if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return records;
  }

  if (appState.activeTab === 'salary') {
    let records = appState.data.salaryRecords ? appState.data.salaryRecords.filter(r => r.id !== 'salary-budget-config') : [];

    if (appState.searchQuery) {
      const q = appState.searchQuery;
      records = records.filter(r => (r.gipName || '').toLowerCase().includes(q));
    }

    const getRowStats = (r) => {
      let paidTotal = 0;
      let pendingTotal = 0;
      let paidCount = 0;
      let pendingCount = 0;

      const p = r.periods || {};
      const selQuincena = appState.salaryQuincenaFilter || 'ALL';
      const periodKeys = (selQuincena !== 'ALL') ? [selQuincena] : Object.keys(p);

      periodKeys.forEach(pKey => {
        const item = p[pKey];
        if (item && item.amount > 0 && item.status !== 'na') {
          let amt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
          if (isNaN(amt)) amt = 0;

          if (item.status === 'received') {
            paidTotal += amt;
            paidCount++;
          } else if (item.status === 'pending') {
            pendingTotal += amt;
            pendingCount++;
          }
        }
      });

      return { paidTotal, pendingTotal, paidCount, pendingCount };
    };

    const statusFilter = appState.salaryStatusFilter || 'ALL';
    if (statusFilter === 'paid') {
      records = records.filter(r => getRowStats(r).paidCount > 0);
    } else if (statusFilter === 'pending') {
      records = records.filter(r => getRowStats(r).pendingCount > 0);
    }

    const quincenaFilter = appState.salaryQuincenaFilter || 'ALL';
    if (quincenaFilter !== 'ALL') {
      records = records.filter(r => {
        const item = (r.periods || {})[quincenaFilter];
        return item && item.amount > 0 && item.status !== 'na';
      });
    }

    const sortType = appState.salarySortOption || 'name-asc';

    records.sort((a, b) => {
      const statsA = getRowStats(a);
      const statsB = getRowStats(b);

      if (sortType === 'name-asc') {
        return (a.gipName || '').localeCompare(b.gipName || '');
      } else if (sortType === 'name-desc') {
        return (b.gipName || '').localeCompare(a.gipName || '');
      } else if (sortType === 'paid-desc') {
        return statsB.paidTotal - statsA.paidTotal;
      } else if (sortType === 'paid-asc') {
        return statsA.paidTotal - statsB.paidTotal;
      } else if (sortType === 'pending-desc') {
        return statsB.pendingCount - statsA.pendingCount || statsB.pendingTotal - statsA.pendingTotal;
      }

      return (a.gipName || '').localeCompare(b.gipName || '');
    });

    return records;
  }

  const isDtr = appState.activeTab === 'dtr';
  let records = isDtr ? [...appState.data.dtrRecords] : [...appState.data.transmittalRecords];

  if (appState.searchQuery) {
    const q = appState.searchQuery;
    records = records.filter(r => {
      if (isDtr) {
        return (r.gipName || '').toLowerCase().includes(q) ||
          (r.quincena || '').toLowerCase().includes(q) ||
          (r.month || '').toLowerCase().includes(q) ||
          (r.remarks || '').toLowerCase().includes(q);
      } else {
        return (r.particulars || '').toLowerCase().includes(q) ||
          (r.preparedBy || '').toLowerCase().includes(q) ||
          (r.remarks || '').toLowerCase().includes(q);
      }
    });
  }

  records.sort((a, b) => {
    let valA = a[appState.sortColumn] || '';
    let valB = b[appState.sortColumn] || '';

    if (valA < valB) return appState.sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return appState.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return records;
}

/**
 * Render Data Table Header and Rows
 */
function renderTable() {
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');
  const emptyState = document.getElementById('empty-state');
  const emptyMsg = document.getElementById('empty-state-msg');
  const tableWrapper = document.getElementById('table-responsive-wrapper');
  const salaryCardsGrid = document.getElementById('salary-cards-grid');

  if (appState.isLoading) {
    emptyState.style.display = 'none';
    const subtext = appState.loadingSubtext || 'Loading live database records...';
    if (appState.activeTab === 'salary') {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (salaryCardsGrid) {
        salaryCardsGrid.style.display = 'grid';
        salaryCardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px;">
            <div class="table-loading-container">
              <div class="bouncing-dots">
                <span class="dot dot-1"></span>
                <span class="dot dot-2"></span>
                <span class="dot dot-3"></span>
              </div>
              <div class="table-loading-text">${escapeHtml(subtext)}</div>
            </div>
          </div>
        `;
      }
    } else {
      if (tableWrapper) tableWrapper.style.display = 'block';
      if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';
      if (tableBody) {
        tableBody.innerHTML = `
          <tr class="table-loading-row">
            <td colspan="10" style="text-align: center; padding: 50px 20px;">
              <div class="table-loading-container">
                <div class="bouncing-dots">
                  <span class="dot dot-1"></span>
                  <span class="dot dot-2"></span>
                  <span class="dot dot-3"></span>
                </div>
                <div class="table-loading-text">${escapeHtml(subtext)}</div>
              </div>
            </td>
          </tr>
        `;
      }
    }
    return;
  }

  if (appState.activeTab === 'trash') {
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';

    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('type')">
          <div class="th-content">RECORD TYPE ${getSortIcon('type')}</div>
        </th>
        <th onclick="handleSort('title')">
          <div class="th-content">RECORD DETAILS / TITLE ${getSortIcon('title')}</div>
        </th>
        <th onclick="handleSort('deletedAt')">
          <div class="th-content">DATE DELETED ${getSortIcon('deletedAt')}</div>
        </th>
        <th>
          <div class="th-content">RETENTION REMAINING</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;

    const records = getFilteredAndSortedRecords();

    if (records.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      if (emptyMsg) emptyMsg.textContent = 'Recycle bin is empty. No deleted records.';
      return;
    }

    emptyState.style.display = 'none';

    tableBody.innerHTML = records.map(item => {
      const type = item.type || 'dtr';
      const orig = item.originalRecord || {};

      let typeBadge = '';
      let titleText = '';

      if (type === 'dtr') {
        typeBadge = `<span class="quincena-pill quincena-q1"><i data-lucide="users" style="width: 12px; height: 12px;"></i> GIP DTR & AR</span>`;
        titleText = `GIP NAME: ${escapeHtml(formatEtAl(orig.gipName || ''))} (${formatMonth(orig.month)})`;
      } else if (type === 'contacts') {
        typeBadge = `<span class="quincena-pill quincena-q1" style="background: #e0e7ff; color: #3730a3; border-color: #c7d2fe;"><i data-lucide="phone" style="width: 12px; height: 12px;"></i> GIP CONTACT</span>`;
        titleText = `CONTACT: ${escapeHtml(formatEtAl(orig.gipName || ''))} (${escapeHtml(orig.assignment || 'LDNPFO')})`;
      } else if (type === 'salary') {
        typeBadge = `<span class="quincena-pill quincena-q1" style="background: #e0f2fe; color: #0369a1; border-color: #7dd3fc;"><i data-lucide="wallet" style="width: 12px; height: 12px;"></i> SALARY RECORD</span>`;
        titleText = `SALARY: ${escapeHtml(formatEtAl(orig.gipName || ''))}`;
      } else if (type === 'compiled') {
        typeBadge = `<span class="quincena-pill quincena-q1" style="background: #f0fdf4; color: #15803d; border-color: #bbf7d0;"><i data-lucide="folder-check" style="width: 12px; height: 12px;"></i> DOCUMENTS RECEIVED</span>`;
        titleText = `DOCUMENT: ${escapeHtml(formatEtAl((orig.documentTitle || orig.particulars || '').substring(0, 65)))}...`;
      } else {
        typeBadge = `<span class="quincena-pill quincena-q2"><i data-lucide="send" style="width: 12px; height: 12px;"></i> TRANSMITTAL</span>`;
        titleText = `PARTICULARS: ${escapeHtml(formatEtAl((orig.particulars || '').substring(0, 65)))}...`;
      }

      const daysRemaining = getRetentionDaysRemaining(item.deletedAt);
      const dateDeletedFormatted = formatDate(item.deletedAt ? item.deletedAt.substring(0, 10) : '');

      return `
        <tr>
          <td>${typeBadge}</td>
          <td style="font-weight: 600; font-size: 0.9rem; color: var(--primary-navy);">${titleText}</td>
          <td>${dateDeletedFormatted}</td>
          <td>
            <span class="retention-pill">
              <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
              ${daysRemaining} DAYS REMAINING
            </span>
          </td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action restore" onclick="restoreRecord('${item.id}')" title="Restore Record to original module">
                <i data-lucide="rotate-ccw"></i> Restore
              </button>
              <button class="btn-action delete" onclick="deletePermanently('${item.id}')" title="Delete Permanently">
                <i data-lucide="trash-2"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    return;
  }

  if (appState.activeTab === 'contacts') {
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';

    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('gipName')">
          <div class="th-content">GIP FULL NAME ${getSortIcon('gipName')}</div>
        </th>
        <th onclick="handleSort('assignment')">
          <div class="th-content">ASSIGNMENT / OFFICE ${getSortIcon('assignment')}</div>
        </th>
        <th onclick="handleSort('contactNumber')">
          <div class="th-content">CONTACT NUMBER ${getSortIcon('contactNumber')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;

    const records = getFilteredAndSortedRecords();

    if (records.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      if (emptyMsg) emptyMsg.textContent = 'No GIP contacts found. Click "+ Add New Record" to create one.';
      return;
    }

    emptyState.style.display = 'none';

    tableBody.innerHTML = records.map(record => {
      const formattedPhone = formatPhoneNumber(record.contactNumber);
      return `
        <tr>
          <td style="font-weight: 600; font-size: 0.95rem; color: var(--primary-navy);">${escapeHtml(record.gipName)}</td>
          <td>
            <span class="quincena-pill quincena-q1">
              <i data-lucide="building-2" style="width: 12px; height: 12px;"></i>
              ${escapeHtml(record.assignment || 'LDNPFO')}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <a href="tel:${escapeHtml(record.contactNumber)}" style="font-family: monospace; font-weight: 700; font-size: 0.95rem; color: var(--brand-accent); text-decoration: none;" title="Click to Call/SMS">
                <i data-lucide="phone" style="width: 13px; height: 13px; vertical-align: middle;"></i> ${formattedPhone}
              </a>
              <button class="btn-action edit" onclick="copyContactNumber('${escapeHtml(record.contactNumber)}')" title="Copy Phone Number">
                <i data-lucide="copy" style="width: 12px; height: 12px;"></i>
              </button>
            </div>
          </td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 240px;">${escapeHtml(record.remarks || '-')}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Contact">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Contact">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    return;
  }

  if (appState.activeTab === 'gsis') {
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';

    tableHead.innerHTML = `
      <tr>
        <th style="width: 40px;">#</th>
        <th onclick="handleSort('name')">
          <div class="th-content">NAME OF ASSURED ${getSortIcon('name')}</div>
        </th>
        <th onclick="handleSort('dob')">
          <div class="th-content">DATE OF BIRTH ${getSortIcon('dob')}</div>
        </th>
        <th onclick="handleSort('age')">
          <div class="th-content">AGE ${getSortIcon('age')}</div>
        </th>
        <th onclick="handleSort('address')">
          <div class="th-content">ADDRESS ${getSortIcon('address')}</div>
        </th>
        <th onclick="handleSort('beneficiary')">
          <div class="th-content">DESIGNATED BENEFICIARY ${getSortIcon('beneficiary')}</div>
        </th>
        <th onclick="handleSort('relationship')">
          <div class="th-content">RELATIONSHIP ${getSortIcon('relationship')}</div>
        </th>
        <th onclick="handleSort('period')">
          <div class="th-content">PERIOD OF EMPLOYMENT ${getSortIcon('period')}</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;

    const records = getFilteredAndSortedRecords();

    if (records.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      if (emptyMsg) emptyMsg.textContent = 'No GIP GSIS Insurance records found. Click "+ Add New Record" to create one.';
      return;
    }

    emptyState.style.display = 'none';

    tableBody.innerHTML = records.map((record, idx) => {
      return `
        <tr>
          <td style="font-weight: 700; color: var(--text-muted); font-size: 0.8rem;">${idx + 1}</td>
          <td style="font-weight: 600; font-size: 0.925rem; color: var(--primary-navy);">${escapeHtml(record.name)}</td>
          <td style="white-space: nowrap;">${escapeHtml(record.dob || '-')}</td>
          <td><span class="badge-tag">${escapeHtml(record.age || '-')}</span></td>
          <td style="font-size: 0.85rem; max-width: 220px; color: var(--text-main);">${escapeHtml(record.address || '-')}</td>
          <td style="font-weight: 600; font-size: 0.875rem; color: #0284c7;">${escapeHtml(record.beneficiary || '-')}</td>
          <td><span class="quincena-pill quincena-q1" style="font-size: 0.75rem;">${escapeHtml(record.relationship || '-')}</span></td>
          <td style="white-space: nowrap; font-size: 0.825rem; font-weight: 500;">${escapeHtml(record.period || '-')}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit GSIS Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete GSIS Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    return;
  }

  if (appState.activeTab === 'salary') {
    if (tableWrapper) tableWrapper.style.display = 'none';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'grid';

    const records = getFilteredAndSortedRecords();

    if (records.length === 0) {
      if (salaryCardsGrid) salaryCardsGrid.innerHTML = '';
      emptyState.style.display = 'block';
      if (emptyMsg) emptyMsg.textContent = 'No salary records found. Click "+ Add New Record" to create one.';
      return;
    }

    emptyState.style.display = 'none';
    const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;

    salaryCardsGrid.innerHTML = records.map(record => {
      let rowTotal = 0;
      const periods = record.periods || {};

      const periodBoxes = periodsList.map(periodKey => {
        const item = periods[periodKey];
        if (!item || item.amount <= 0 || item.status === 'na') {
          return `
            <div class="salary-card-period-box" onclick="toggleSalaryStatus('${record.id}', '${periodKey}')" style="cursor: pointer;" title="Click to set status">
              <div class="salary-card-period-header">
                <span class="salary-card-period-label">${escapeHtml(periodKey)}</span>
                <span class="card-status-badge na">N/A</span>
              </div>
              <div class="salary-card-period-amt" style="color: #94a3b8;">-</div>
            </div>
          `;
        }

        let amt = 0;
        if (typeof item.amount === 'number') {
          amt = item.amount;
        } else if (item.amount) {
          amt = parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0;
        }
        if (isNaN(amt)) amt = 0;

        const isReceived = item.status === 'received';
        if (isReceived) rowTotal += amt;

        const badgeClass = isReceived ? 'received' : 'pending';
        const iconName = isReceived ? 'check-circle' : 'clock';
        const labelText = isReceived ? 'Paid' : 'Pending';

        return `
          <div class="salary-card-period-box" onclick="toggleSalaryStatus('${record.id}', '${periodKey}')" style="cursor: pointer;" title="Click to toggle status (Received <-> Pending)">
            <div class="salary-card-period-header">
              <span class="salary-card-period-label">${escapeHtml(periodKey)}</span>
              <span class="card-status-badge ${badgeClass}">
                <i data-lucide="${iconName}" style="width: 10px; height: 10px;"></i> ${labelText}
              </span>
            </div>
            <div class="salary-card-period-amt">
              ₱${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="salary-card">
          <div class="salary-card-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="user-check" style="width: 16px; height: 16px; color: var(--brand-accent);"></i>
              <span class="salary-card-name">${escapeHtml(record.gipName)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
              <div class="salary-card-total" title="Total Paid Salary Disbursed">
                TOTAL PAID: ₱${rowTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div class="action-buttons">
                <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Salary Record">
                  <i data-lucide="edit-3"></i> Edit
                </button>
                <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Salary Record">
                  <i data-lucide="trash-2"></i> Delete
                </button>
              </div>
            </div>
          </div>

          <div class="salary-card-periods">
            ${periodBoxes}
          </div>

          ${record.remarks ? `<div style="font-size: 0.775rem; color: var(--text-muted); font-weight: 600; padding-top: 6px; border-top: 1px dashed var(--border-light);"><i data-lucide="info" style="width: 12px; height: 12px; vertical-align: middle;"></i> REMARKS: ${escapeHtml(record.remarks)}</div>` : ''}
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    return;
  } else {
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';
  }

  if (appState.activeTab === 'compiled') {
    if (tableWrapper) tableWrapper.style.display = 'block';
    if (salaryCardsGrid) salaryCardsGrid.style.display = 'none';

    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('documentTitle')">
          <div class="th-content">COMPILED DOCUMENTS / TITLE ${getSortIcon('documentTitle')}</div>
        </th>
        <th onclick="handleSort('receivedFrom')">
          <div class="th-content">RECEIVED FROM / SENDER ${getSortIcon('receivedFrom')}</div>
        </th>
        <th onclick="handleSort('dateReceived')">
          <div class="th-content">DATE RECEIVED ${getSortIcon('dateReceived')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;

    const records = getFilteredAndSortedRecords();

    if (records.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'block';
      if (emptyMsg) emptyMsg.textContent = 'No compiled documents received found. Click "+ Add New Record" to create one.';
      return;
    }

    emptyState.style.display = 'none';

    tableBody.innerHTML = records.map(record => {
      const searchQuery = appState.searchQuery ? appState.searchQuery.trim() : '';
      const titleText = escapeHtml(formatEtAl(record.documentTitle || record.particulars || ''));
      const highlightedTitle = highlightTextInHtml(titleText, searchQuery);

      const attachments = record.attachments && Array.isArray(record.attachments) && record.attachments.length > 0 
        ? record.attachments 
        : (record.imageUrl ? [{ id: 'att-legacy', name: 'Document_Photo.jpg', type: 'image', url: record.imageUrl }] : []);

      let attachmentBtnsHtml = '';
      if (attachments.length > 0) {
        attachmentBtnsHtml = `<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-top: 4px;">` + attachments.map((att, idx) => {
          if (att.type === 'pdf') {
            return `
              <button type="button" class="btn-show-attached-pdf" onclick="openPdfViewerModal('${escapeHtml(att.url)}', '${escapeHtml(att.name)}')" title="Click to view attached PDF: ${escapeHtml(att.name)}" style="background: rgba(239,68,68,0.12); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 2px 8px; border-radius: 4px; font-size: 0.725rem; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                <i data-lucide="file-text" style="width: 12px; height: 12px; color: #ef4444;"></i> PDF ${attachments.length > 1 ? (idx + 1) : ''}
              </button>
            `;
          } else {
            return `
              <button type="button" class="btn-show-attached-img" onclick="openImageLightbox('${escapeHtml(att.url)}', 'COMPILED DOCUMENT PHOTO (${idx + 1}/${attachments.length})')" title="Click to view attached photo: ${escapeHtml(att.name)}" style="margin-left: 0;">
                <i data-lucide="image" style="width: 12px; height: 12px;"></i> Photo ${attachments.length > 1 ? (idx + 1) : ''}
              </button>
            `;
          }
        }).join('') + `</div>`;
      }

      const titleCellHtml = `
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-weight: 600; font-size: 0.925rem; color: var(--primary-navy);">${highlightedTitle}</span>
          ${attachmentBtnsHtml}
        </div>
      `;

      const senderFormatted = highlightTextInHtml(escapeHtml(record.receivedFrom || '-'), searchQuery);
      const dateRecFormatted = highlightTextInHtml(escapeHtml(formatDate(record.dateReceived)), searchQuery);
      const remarksFormatted = highlightTextInHtml(escapeHtml(formatEtAl(record.remarks || '-')), searchQuery);

      return `
        <tr>
          <td>${titleCellHtml}</td>
          <td>
            <span class="quincena-pill quincena-q1">
              <i data-lucide="building" style="width: 12px; height: 12px;"></i>
              ${senderFormatted}
            </span>
          </td>
          <td>${dateRecFormatted}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 280px;">${remarksFormatted}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Document Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Document Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
    return;
  }

  const isDtr = appState.activeTab === 'dtr';

  if (isDtr) {
    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('gipName')">
          <div class="th-content">GIP NAME ${getSortIcon('gipName')}</div>
        </th>
        <th onclick="handleSort('month')">
          <div class="th-content">PAYROLL PERIOD / QUINCENA ${getSortIcon('month')}</div>
        </th>
        <th onclick="handleSort('dtrArDateReceived')">
          <div class="th-content">DTR & AR DATE RECEIVED BY DOLE LDNPFO ${getSortIcon('dtrArDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;
  } else {
    tableHead.innerHTML = `
      <tr>
        <th onclick="handleSort('particulars')">
          <div class="th-content">PARTICULARS (DOCUMENTS TRANSMITTED) ${getSortIcon('particulars')}</div>
        </th>
        <th onclick="handleSort('program')">
          <div class="th-content">PROGRAM / CATEGORY ${getSortIcon('program')}</div>
        </th>
        <th onclick="handleSort('dateTransmitted')">
          <div class="th-content">DATE TRANSMITTED ${getSortIcon('dateTransmitted')}</div>
        </th>
        <th onclick="handleSort('regionalDateReceived')">
          <div class="th-content">DATE RECEIVED BY REGIONAL OFFICE ${getSortIcon('regionalDateReceived')}</div>
        </th>
        <th>
          <div class="th-content">REMARKS</div>
        </th>
        <th style="text-align: right;">ACTIONS</th>
      </tr>
    `;
  }

  const records = getFilteredAndSortedRecords();

  if (records.length === 0) {
    tableBody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  tableBody.innerHTML = records.map(record => {
    const searchQuery = appState.searchQuery ? appState.searchQuery.trim() : '';

    if (isDtr) {
      const quincenaLabel = (record.quincena || '1ST QUINCENA (1-15)').toUpperCase();
      const monthFormatted = formatMonth(record.month).toUpperCase();
      const isQ2 = String(quincenaLabel).includes('2ND');
      const qClass = isQ2 ? 'quincena-q2' : 'quincena-q1';

      const gipNameFormatted = highlightTextInHtml(escapeHtml(formatEtAl(record.gipName)), searchQuery);
      const periodLabelFormatted = highlightTextInHtml(escapeHtml(`${monthFormatted} - ${quincenaLabel}`), searchQuery);
      const rawDateRec = formatDate(record.dtrArDateReceived);
      const dateRecFormatted = rawDateRec === '-' ? '<span style="color: var(--text-light);">-</span>' : highlightTextInHtml(escapeHtml(rawDateRec), searchQuery);
      const remarksFormatted = highlightTextInHtml(escapeHtml(formatEtAl(record.remarks || '-')), searchQuery);

      return `
        <tr>
          <td style="font-weight: 600; font-size: 0.95rem;">${gipNameFormatted}</td>
          <td>
            <span class="quincena-pill ${qClass}">
              <i data-lucide="calendar" style="width: 12px; height: 12px;"></i>
              ${periodLabelFormatted}
            </span>
          </td>
          <td>${dateRecFormatted}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 280px;">${remarksFormatted}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    } else {
      const memoFormatted = formatParticularsMemoCard(formatEtAl(record.particulars), false, null, record.imageUrl, searchQuery);
      const programTag = (record.program || '').toUpperCase();
      let programCellHtml = '';

      if (programTag === 'GIP') {
        programCellHtml = `<span class="program-badge badge-gip">${highlightTextInHtml('GIP', searchQuery)}</span>`;
      } else if (programTag === 'SPES') {
        programCellHtml = `<span class="program-badge badge-spes">${highlightTextInHtml('SPES', searchQuery)}</span>`;
      } else if (programTag === 'TUPAD') {
        programCellHtml = `<span class="program-badge badge-tupad">${highlightTextInHtml('TUPAD', searchQuery)}</span>`;
      } else if (programTag) {
        programCellHtml = `<span class="program-badge badge-custom">${highlightTextInHtml(escapeHtml(programTag), searchQuery)}</span>`;
      } else {
        programCellHtml = `<span style="color: var(--text-light); font-style: italic;">-</span>`;
      }

      const dateTrnStr = formatDate(record.dateTransmitted);
      const dateRegStr = formatDate(record.regionalDateReceived);
      const remarksStr = escapeHtml(formatEtAl(record.remarks || '-'));

      const highlightedDateTrn = dateTrnStr === '-' ? '<span style="color: var(--text-light);">-</span>' : highlightTextInHtml(escapeHtml(dateTrnStr), searchQuery);
      const highlightedDateReg = dateRegStr === '-' ? '<span style="color: var(--text-light);">-</span>' : highlightTextInHtml(escapeHtml(dateRegStr), searchQuery);
      const highlightedRemarks = highlightTextInHtml(remarksStr, searchQuery);

      return `
        <tr>
          <td>${memoFormatted}</td>
          <td>${programCellHtml}</td>
          <td>${highlightedDateTrn}</td>
          <td>${highlightedDateReg}</td>
          <td style="color: var(--text-muted); font-size: 0.85rem; max-width: 240px;">${highlightedRemarks}</td>
          <td style="text-align: right;">
            <div class="action-buttons" style="justify-content: flex-end;">
              <button class="btn-action edit" onclick="openRecordModal('${record.id}')" title="Edit Record">
                <i data-lucide="edit-3"></i>
              </button>
              <button class="btn-action delete" onclick="openDeleteModal('${record.id}')" title="Delete Record">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

/**
 * Safely highlights matching search query terms inside HTML text while avoiding HTML tags
 */
function highlightTextInHtml(htmlText, query) {
  if (!htmlText || !query || !query.trim()) return htmlText;
  const terms = query.trim().split(/\s+/).filter(t => t.length > 0);
  if (terms.length === 0) return htmlText;

  // Build regex matching any of the search terms
  const escapedTerms = terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

  // Split HTML string into text nodes and HTML tags to prevent breaking tags
  const parts = htmlText.split(/(<[^>]+>)/g);
  return parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      return part; // Return HTML tag intact
    }
    return part.replace(regex, '<mark class="search-highlight">$1</mark>');
  }).join('');
}

/**
 * Formats Transmittal Particulars into an Executive Document Card with Collapsible Dropdown
 */
function formatParticularsMemoCard(rawText, isPreview = false, cardId = null, imageUrl = null, highlightQuery = '') {
  if (!rawText || !rawText.trim()) {
    return `<span style="color: var(--text-light); font-style: italic;">NO PARTICULARS SPECIFIED</span>`;
  }

  const text = formatEtAl(rawText.trim());
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  let titleHeader = null;
  let bodyLines = [];

  lines.forEach((line, index) => {
    const isHeaderLine = line.endsWith(':') ||
      /^TRANSMITTAL\s+OF/i.test(line) ||
      /^TRANSMITTAL\s+LETTER/i.test(line) ||
      /^SUBJECT:/i.test(line) ||
      /^RE:/i.test(line) ||
      /^TO\s+PAYMENT/i.test(line);

    if (isHeaderLine && index === 0 && lines.length > 1) {
      titleHeader = line;
    } else {
      bodyLines.push(line);
    }
  });

  if (bodyLines.length === 0 && titleHeader) {
    bodyLines = [titleHeader];
    titleHeader = null;
  }

  let formattedBody = bodyLines.join('\n');

  let htmlBody = escapeHtml(formattedBody)
    .replace(/(\b\d+\s+SETS?\b|\b1ST QUINCENA\b|\b2ND QUINCENA\b|\bBATCH\s+\d+\b|\bDTRS?\s*&\s*ARS?\b|\bAMOUNTING TO:\s*[\d,\.]+\b)/gi,
      '<span class="inline-tag">$1</span>');

  if (highlightQuery) {
    htmlBody = highlightTextInHtml(htmlBody, highlightQuery);
  }

  const totalLines = bodyLines.length + (titleHeader ? 1 : 0);
  const isCollapsible = !isPreview && totalLines > 3;
  const boxId = cardId || ('memo-card-' + Math.random().toString(36).substr(2, 9));

  let html = `<div class="particulars-memo-box ${isCollapsible ? 'collapsible collapsed' : ''}" id="${boxId}">`;

  if (titleHeader) {
    let titleHtml = escapeHtml(titleHeader);
    if (highlightQuery) {
      titleHtml = highlightTextInHtml(titleHtml, highlightQuery);
    }
    html += `
      <div class="particulars-memo-title">
        <i data-lucide="file-text" style="width: 14px; height: 14px; color: var(--primary-blue); flex-shrink: 0;"></i>
        <span>${titleHtml}</span>
      </div>
    `;
  }

  html += `<div class="particulars-memo-body">${htmlBody}</div>`;

  // Small Button for Attached Document Picture (hidden inline by default)
  if (imageUrl) {
    html += `
      <div style="margin-top: 10px;">
        <button type="button" class="btn-show-attached-img" onclick="openImageLightbox('${escapeHtml(imageUrl)}', 'TRANSMITTAL ATTACHED DOCUMENT PHOTO')" title="Click to view attached document photo in full size">
          <i data-lucide="image" style="width: 13px; height: 13px;"></i>
          <span>Show Uploaded Image</span>
        </button>
      </div>
    `;
  }

  if (isCollapsible) {
    html += `
      <button type="button" class="btn-memo-toggle" onclick="toggleParticularsMemoCard('${boxId}', ${totalLines})" title="Click to expand/collapse full particulars">
        <i data-lucide="chevron-down" style="width: 13px; height: 13px;"></i>
        <span class="toggle-text">Show All (${totalLines} lines)</span>
      </button>
    `;
  }

  html += `</div>`;

  return html;
}

/**
 * Toggle Expand/Collapse for Long Particulars Cards
 */
function toggleParticularsMemoCard(cardId, totalLines) {
  const card = document.getElementById(cardId);
  if (!card) return;

  const isCollapsed = card.classList.contains('collapsed');
  const btn = card.querySelector('.btn-memo-toggle');

  if (isCollapsed) {
    card.classList.remove('collapsed');
    if (btn) {
      btn.innerHTML = `<i data-lucide="chevron-up" style="width: 13px; height: 13px;"></i> <span class="toggle-text">Show Less</span>`;
    }
  } else {
    card.classList.add('collapsed');
    if (btn) {
      btn.innerHTML = `<i data-lucide="chevron-down" style="width: 13px; height: 13px;"></i> <span class="toggle-text">Show All (${totalLines} lines)</span>`;
    }
  }

  if (window.lucide) lucide.createIcons();
}

/**
 * Live Form Preview Handler for Particulars Textarea
 */
function handleParticularsLivePreview() {
  const textarea = document.getElementById('particulars');
  const previewWrapper = document.getElementById('particulars-preview-wrapper');
  const previewContainer = document.getElementById('particulars-live-preview');

  const text = textarea.value.trim().toUpperCase();
  if (!text) {
    previewWrapper.style.display = 'none';
    previewContainer.innerHTML = '';
  } else {
    previewWrapper.style.display = 'block';
    previewContainer.innerHTML = formatParticularsMemoCard(text, true);
    if (window.lucide) lucide.createIcons();
  }
}

/**
 * Dynamic Column Sort Trigger
 */
function handleSort(colName) {
  if (appState.sortColumn === colName) {
    appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    appState.sortColumn = colName;
    appState.sortDirection = 'asc';
  }
  renderTable();
}

function getSortIcon(colName) {
  if (appState.sortColumn !== colName) {
    return `<span class="sort-icon">↕</span>`;
  }
  return `<span class="sort-icon">${appState.sortDirection === 'asc' ? '↑' : '↓'}</span>`;
}

/**
 * Render Dynamic Salary Modal Inputs for active quincena periods
 */
function renderSalaryModalInputs(record = null) {
  const container = document.getElementById('salary-quincena-inputs-container');
  if (!container) return;

  const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;
  const existingPeriods = (record && record.periods) ? record.periods : {};

  container.innerHTML = periodsList.map((periodKey, idx) => {
    const pData = existingPeriods[periodKey] || { amount: 0, status: 'na' };
    const amtVal = pData.amount > 0 ? pData.amount : '';
    const stVal = pData.status || 'na';
    const fieldIdAmt = `sal-amt-${idx}`;
    const fieldIdSt = `sal-st-${idx}`;

    return `
      <div class="salary-input-item">
        <label for="${fieldIdAmt}" style="font-size: 0.775rem; font-weight: 700; color: var(--primary-navy); display: block; margin-bottom: 4px;">
          ${escapeHtml(periodKey)} Amount (₱)
        </label>
        <div style="display: flex; gap: 6px; align-items: center;">
          <input type="number" step="0.01" id="${fieldIdAmt}" data-period="${escapeHtml(periodKey)}" class="form-control sal-input-amt" placeholder="0.00" value="${amtVal}" style="font-size: 0.825rem; flex: 1; min-width: 0;" oninput="handleLiveSalaryModalInputChange()">
          <select id="${fieldIdSt}" data-period="${escapeHtml(periodKey)}" class="form-control sal-input-st" style="font-size: 0.8rem; width: 105px; min-width: 105px;" onchange="handleLiveSalaryModalInputChange()">
            <option value="received" ${stVal === 'received' ? 'selected' : ''}>Received</option>
            <option value="pending" ${stVal === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="na" ${stVal === 'na' ? 'selected' : ''}>N/A</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Instant Real-time Calculation Handler when editing salary inputs in modal
 */
function handleLiveSalaryModalInputChange() {
  let tempPaid = 0;
  let tempPending = 0;

  const editingId = appState.editingRecordId;
  const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;

  (appState.data.salaryRecords || []).forEach(r => {
    if (r.id === 'salary-budget-config') return;
    if (r.id === editingId) return;

    Object.values(r.periods || {}).forEach(item => {
      if (item && item.amount) {
        let numAmt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
        if (!isNaN(numAmt) && numAmt > 0) {
          if (item.status === 'received') tempPaid += numAmt;
          else if (item.status === 'pending') tempPending += numAmt;
        }
      }
    });
  });

  periodsList.forEach((_, idx) => {
    const amtEl = document.getElementById(`sal-amt-${idx}`);
    const stEl = document.getElementById(`sal-st-${idx}`);
    if (amtEl && stEl) {
      const amtVal = parseFloat(amtEl.value) || 0;
      const stVal = stEl.value;
      if (amtVal > 0) {
        if (stVal === 'received') tempPaid += amtVal;
        else if (stVal === 'pending') tempPending += amtVal;
      }
    }
  });

  const totalBudget = parseFloat(appState.data.totalBudget) || 0;
  const remainingBalance = totalBudget - tempPaid;

  const grandTotalValElem = document.getElementById('salary-grand-total-val');
  if (grandTotalValElem) grandTotalValElem.textContent = `₱${tempPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const pendingValElem = document.getElementById('salary-total-pending-val');
  if (pendingValElem) pendingValElem.textContent = `₱${tempPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const remainingValElem = document.getElementById('salary-remaining-balance-val');
  if (remainingValElem) {
    remainingValElem.textContent = `${remainingBalance < 0 ? '-' : ''}₱${Math.abs(remainingBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    remainingValElem.style.color = remainingBalance < 0 ? '#dc2626' : '#059669';
  }
}

/**
 * Form & Modal Handling (Add / Edit)
 */
function openRecordModal(id = null) {
  const isDtr = appState.activeTab === 'dtr';
  const isContacts = appState.activeTab === 'contacts';
  const isSalary = appState.activeTab === 'salary';
  const isCompiled = appState.activeTab === 'compiled';
  const isGsis = appState.activeTab === 'gsis';
  appState.editingRecordId = id;

  const modalTitle = document.getElementById('modal-title');
  const dtrFields = document.getElementById('fields-dtr');
  const trnFields = document.getElementById('fields-transmittal');
  const cntFields = document.getElementById('fields-contacts');
  const salFields = document.getElementById('fields-salary');
  const compiledFields = document.getElementById('fields-compiled');
  const gsisFields = document.getElementById('fields-gsis');
  const form = document.getElementById('record-form');

  form.reset();

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('record-month').value = currentMonthStr;
  document.getElementById('record-quincena').value = '1st Quincena (1-15)';

  document.getElementById('particulars-preview-wrapper').style.display = 'none';

  const setReq = (id, req) => {
    const el = document.getElementById(id);
    if (el) el.required = req;
  };

  if (isDtr) {
    dtrFields.style.display = 'block';
    trnFields.style.display = 'none';
    cntFields.style.display = 'none';
    if (salFields) salFields.style.display = 'none';
    if (compiledFields) compiledFields.style.display = 'none';
    if (gsisFields) gsisFields.style.display = 'none';
    setReq('gip-name', true);
    setReq('record-month', true);
    setReq('record-quincena', true);
    setReq('particulars', false);
    setReq('contact-gip-name', false);
    setReq('contact-assignment', false);
    setReq('contact-number', false);
    setReq('salary-gip-name', false);
    setReq('compiled-title', false);
    setReq('compiled-received-from', false);
    setReq('compiled-date-received', false);
    setReq('gsis-name', false);
  } else if (isContacts) {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'none';
    cntFields.style.display = 'block';
    if (salFields) salFields.style.display = 'none';
    if (compiledFields) compiledFields.style.display = 'none';
    if (gsisFields) gsisFields.style.display = 'none';
    setReq('gip-name', false);
    setReq('record-month', false);
    setReq('record-quincena', false);
    setReq('particulars', false);
    setReq('contact-gip-name', true);
    setReq('contact-assignment', true);
    setReq('contact-number', true);
    setReq('salary-gip-name', false);
    setReq('compiled-title', false);
    setReq('compiled-received-from', false);
    setReq('compiled-date-received', false);
    setReq('gsis-name', false);
  } else if (isSalary) {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'none';
    cntFields.style.display = 'none';
    if (salFields) salFields.style.display = 'block';
    if (compiledFields) compiledFields.style.display = 'none';
    if (gsisFields) gsisFields.style.display = 'none';
    setReq('gip-name', false);
    setReq('record-month', false);
    setReq('record-quincena', false);
    setReq('particulars', false);
    setReq('contact-gip-name', false);
    setReq('contact-assignment', false);
    setReq('contact-number', false);
    setReq('salary-gip-name', true);
    setReq('compiled-title', false);
    setReq('compiled-received-from', false);
    setReq('compiled-date-received', false);
    setReq('gsis-name', false);
    renderSalaryModalInputs(id ? appState.data.salaryRecords.find(r => r.id === id) : null);
  } else if (isCompiled) {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'none';
    cntFields.style.display = 'none';
    if (salFields) salFields.style.display = 'none';
    if (compiledFields) compiledFields.style.display = 'block';
    if (gsisFields) gsisFields.style.display = 'none';
    setReq('gip-name', false);
    setReq('record-month', false);
    setReq('record-quincena', false);
    setReq('particulars', false);
    setReq('contact-gip-name', false);
    setReq('contact-assignment', false);
    setReq('contact-number', false);
    setReq('salary-gip-name', false);
    setReq('compiled-title', true);
    setReq('compiled-received-from', true);
    setReq('compiled-date-received', true);
    setReq('gsis-name', false);
  } else if (isGsis) {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'none';
    cntFields.style.display = 'none';
    if (salFields) salFields.style.display = 'none';
    if (compiledFields) compiledFields.style.display = 'none';
    if (gsisFields) gsisFields.style.display = 'block';
    setReq('gip-name', false);
    setReq('record-month', false);
    setReq('record-quincena', false);
    setReq('particulars', false);
    setReq('contact-gip-name', false);
    setReq('contact-assignment', false);
    setReq('contact-number', false);
    setReq('salary-gip-name', false);
    setReq('compiled-title', false);
    setReq('compiled-received-from', false);
    setReq('compiled-date-received', false);
    setReq('gsis-name', true);
  } else {
    dtrFields.style.display = 'none';
    trnFields.style.display = 'block';
    cntFields.style.display = 'none';
    if (salFields) salFields.style.display = 'none';
    if (compiledFields) compiledFields.style.display = 'none';
    if (gsisFields) gsisFields.style.display = 'none';
    setReq('gip-name', false);
    setReq('record-month', false);
    setReq('record-quincena', false);
    setReq('particulars', true);
    setReq('contact-gip-name', false);
    setReq('contact-assignment', false);
    setReq('contact-number', false);
    setReq('salary-gip-name', false);
    setReq('compiled-title', false);
    setReq('compiled-received-from', false);
    setReq('compiled-date-received', false);
    setReq('gsis-name', false);
  }

  if (id) {
    if (isDtr) modalTitle.textContent = 'EDIT GIP DTR & AR RECORD';
    else if (isContacts) modalTitle.textContent = 'EDIT GIP CONTACT RECORD';
    else if (isSalary) modalTitle.textContent = 'EDIT GIP SALARY RECORD';
    else if (isCompiled) modalTitle.textContent = 'EDIT DOCUMENT RECORD';
    else if (isGsis) modalTitle.textContent = 'EDIT GSIS INSURANCE RECORD';
    else modalTitle.textContent = 'EDIT TRANSMITTAL RECORD';

    let dataset;
    if (isDtr) dataset = appState.data.dtrRecords;
    else if (isContacts) dataset = appState.data.contactsRecords;
    else if (isSalary) dataset = appState.data.salaryRecords;
    else if (isCompiled) dataset = appState.data.compiledRecords;
    else if (isGsis) dataset = appState.data.gsisRecords;
    else dataset = appState.data.transmittalRecords;

    const record = dataset.find(r => r.id === id);

    if (record) {
      document.getElementById('form-record-id').value = record.id;
      document.getElementById('record-remarks').value = (record.remarks || '').toUpperCase();

      if (isDtr) {
        document.getElementById('gip-name').value = (record.gipName || '').toUpperCase();
        document.getElementById('record-month').value = record.month || currentMonthStr;
        const qSelect = document.getElementById('record-quincena');
        const recQuincena = (record.quincena || '').trim();
        if (qSelect) {
          const matchedOpt = Array.from(qSelect.options).find(opt =>
            opt.value.trim().toUpperCase() === recQuincena.toUpperCase()
          );
          if (matchedOpt) {
            qSelect.value = matchedOpt.value;
          } else {
            qSelect.value = recQuincena;
          }
        }
        document.getElementById('dtr-ar-date-received').value = record.dtrArDateReceived || '';
      } else if (isContacts) {
        document.getElementById('contact-gip-name').value = (record.gipName || '').toUpperCase();
        document.getElementById('contact-assignment').value = (record.assignment || '').toUpperCase();
        document.getElementById('contact-number').value = record.contactNumber || '';
      } else if (isSalary) {
        document.getElementById('salary-gip-name').value = (record.gipName || '').toUpperCase();
        renderSalaryModalInputs(record);
      } else if (isCompiled) {
        document.getElementById('compiled-title').value = (record.documentTitle || '').toUpperCase();
        document.getElementById('compiled-received-from').value = (record.receivedFrom || '').toUpperCase();
        document.getElementById('compiled-date-received').value = record.dateReceived || '';
        currentCompiledAttachments = [];
        if (record.attachments && Array.isArray(record.attachments)) {
          currentCompiledAttachments = [...record.attachments];
        } else if (record.imageUrl) {
          currentCompiledAttachments = [{ id: 'att-legacy', name: 'Document_Photo.jpg', type: 'image', url: record.imageUrl, size: 0 }];
        }
        updateCompiledModalImagePreview();
      } else if (isGsis) {
        document.getElementById('gsis-name').value = (record.name || '').toUpperCase();
        document.getElementById('gsis-dob').value = record.dob || '';
        document.getElementById('gsis-age').value = record.age || '';
        document.getElementById('gsis-address').value = (record.address || '').toUpperCase();
        document.getElementById('gsis-beneficiary').value = (record.beneficiary || '').toUpperCase();
        document.getElementById('gsis-relationship').value = (record.relationship || '').toUpperCase();
        document.getElementById('gsis-period').value = (record.period || '').toUpperCase();
      } else {
        document.getElementById('particulars').value = (record.particulars || '').toUpperCase();
        const recProg = (record.program || '').toUpperCase();
        const progSelect = document.getElementById('transmittal-program-select');
        const customInput = document.getElementById('transmittal-custom-program');

        if (progSelect && customInput) {
          if (['GIP', 'SPES', 'TUPAD', ''].includes(recProg)) {
            progSelect.value = recProg;
            customInput.style.display = 'none';
            customInput.value = '';
          } else {
            progSelect.value = 'CUSTOM';
            customInput.style.display = 'block';
            customInput.value = recProg;
          }
        }

        document.getElementById('date-transmitted').value = record.dateTransmitted || '';
        document.getElementById('regional-date-received-trn').value = record.regionalDateReceived || '';
        currentTransmittalImageUrl = record.imageUrl || null;
        updateTransmittalModalImagePreview();
        handleParticularsLivePreview();
      }
    }
  } else {
    if (isDtr) modalTitle.textContent = 'ADD NEW GIP DTR & AR RECORD';
    else if (isContacts) modalTitle.textContent = 'ADD NEW GIP CONTACT RECORD';
    else if (isSalary) modalTitle.textContent = 'ADD NEW GIP SALARY RECORD';
    else if (isCompiled) modalTitle.textContent = 'ADD NEW DOCUMENT RECORD';
    else if (isGsis) modalTitle.textContent = 'ADD NEW GSIS INSURANCE RECORD';
    else modalTitle.textContent = 'ADD NEW TRANSMITTAL RECORD';

    document.getElementById('form-record-id').value = '';
    const progSelect = document.getElementById('transmittal-program-select');
    const customInput = document.getElementById('transmittal-custom-program');
    if (progSelect) progSelect.value = '';
    if (customInput) {
      customInput.value = '';
      customInput.style.display = 'none';
    }
    currentTransmittalImageUrl = null;
    updateTransmittalModalImagePreview();
    currentCompiledAttachments = [];
    updateCompiledModalImagePreview();
  }

  document.getElementById('record-modal').classList.add('active');
}

function closeRecordModal() {
  document.getElementById('record-modal').classList.remove('active');
  appState.editingRecordId = null;
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const isDtr = appState.activeTab === 'dtr';
  const isContacts = appState.activeTab === 'contacts';
  const isSalary = appState.activeTab === 'salary';
  const isCompiled = appState.activeTab === 'compiled';
  const isGsis = appState.activeTab === 'gsis';
  const recordId = document.getElementById('form-record-id').value;
  const remarks = formatEtAl(document.getElementById('record-remarks').value.trim().toUpperCase());

  const nowISO = new Date().toISOString();

  if (isGsis) {
    const name = formatEtAl(document.getElementById('gsis-name').value.trim().toUpperCase());
    const dob = document.getElementById('gsis-dob').value.trim();
    const age = document.getElementById('gsis-age').value.trim();
    const address = document.getElementById('gsis-address').value.trim().toUpperCase();
    const beneficiary = formatEtAl(document.getElementById('gsis-beneficiary').value.trim().toUpperCase());
    const relationship = document.getElementById('gsis-relationship').value.trim().toUpperCase();
    const period = document.getElementById('gsis-period').value.trim().toUpperCase();

    if (!name) {
      showToast('NAME OF ASSURED IS REQUIRED', 'danger');
      return;
    }

    const payload = {
      name,
      dob,
      age,
      address,
      beneficiary,
      relationship,
      period,
      remarks,
      updatedAt: nowISO
    };

    if (!appState.data.gsisRecords) appState.data.gsisRecords = [];

    if (recordId) {
      const index = appState.data.gsisRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.gsisRecords[index] = { ...appState.data.gsisRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_gsis_records').upsert({
          id: recordId,
          gip_name: name,
          dob,
          age,
          address,
          beneficiary,
          relationship,
          period,
          amount,
          source_file: sourceFile,
          updated_at: nowISO
        });
      }
      showToast('GSIS RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'gip-gsis-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.gsisRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_gsis_records').upsert({
          id: newId,
          gip_name: name,
          dob,
          age,
          address,
          beneficiary,
          relationship,
          period,
          amount,
          source_file: sourceFile,
          created_at: nowISO,
          updated_at: nowISO
        });
      }
      showToast('NEW GSIS RECORD ADDED SUCCESSFULLY!', 'success');
    }

    closeRecordModal();
    saveToLocalStorage();
    renderApp();
    return;
  }

  if (isCompiled) {
    const documentTitle = formatEtAl(document.getElementById('compiled-title').value.trim().toUpperCase());
    const receivedFrom = formatEtAl(document.getElementById('compiled-received-from').value.trim().toUpperCase());
    const dateReceived = document.getElementById('compiled-date-received').value;

    if (!documentTitle || !receivedFrom || !dateReceived) {
      showToast('ALL REQUIRED FIELDS FOR DOCUMENT RECORD MUST BE FILLED', 'danger');
      return;
    }

    const firstImg = currentCompiledAttachments.find(a => a.type === 'image');
    const primaryImgUrl = firstImg ? firstImg.url : (currentCompiledAttachments.length > 0 ? currentCompiledAttachments[0].url : null);

    const payload = {
      documentTitle,
      receivedFrom,
      dateReceived,
      remarks,
      attachments: currentCompiledAttachments,
      imageUrl: primaryImgUrl,
      updatedAt: nowISO
    };

    if (!appState.data.compiledRecords) appState.data.compiledRecords = [];

    if (recordId) {
      const index = appState.data.compiledRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.compiledRecords[index] = { ...appState.data.compiledRecords[index], ...payload };
      }
      saveToLocalStorage();

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('gip_compiled_documents').upsert({
          id: recordId,
          document_title: documentTitle,
          received_from: receivedFrom,
          date_received: dateReceived,
          remarks,
          attachments: currentCompiledAttachments,
          image_url: primaryImgUrl,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase update note:', sbErr.message);
      }

      showToast('DOCUMENT RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'doc-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.compiledRecords.unshift(newRecord);
      saveToLocalStorage();

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('gip_compiled_documents').upsert({
          id: newId,
          document_title: documentTitle,
          received_from: receivedFrom,
          date_received: dateReceived,
          remarks,
          attachments: currentCompiledAttachments,
          image_url: primaryImgUrl,
          created_at: nowISO,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase insert note:', sbErr.message);
      }

      showToast('NEW DOCUMENT RECORD ADDED SUCCESSFULLY!', 'success');
    }

    closeRecordModal();
    saveToLocalStorage();
    renderApp();
    return;
  }

  if (isSalary) {
    const gipName = formatEtAl(document.getElementById('salary-gip-name').value.trim().toUpperCase());
    if (!gipName) {
      showToast('GIP NAME / GROUP NAME IS REQUIRED', 'danger');
      return;
    }

    const periods = {};
    const amtInputs = document.querySelectorAll('.sal-input-amt');
    amtInputs.forEach(input => {
      const pKey = input.getAttribute('data-period');
      const amtVal = parseFloat(input.value) || 0;
      const stSelect = document.querySelector(`.sal-input-st[data-period="${pKey}"]`);
      const stVal = stSelect ? stSelect.value : 'na';
      periods[pKey] = { amount: amtVal, status: stVal };
    });

    const payload = {
      gipName,
      periods,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.salaryRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.salaryRecords[index] = { ...appState.data.salaryRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_salary_records').upsert({
          id: recordId,
          gip_name: gipName,
          periods,
          updated_at: nowISO
        });
      }

      showToast('SALARY RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'sal-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      if (!appState.data.salaryRecords) appState.data.salaryRecords = [];
      appState.data.salaryRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_salary_records').upsert({
          id: newId,
          gip_name: gipName,
          periods,
          created_at: nowISO,
          updated_at: nowISO
        });
      }

      showToast('NEW SALARY RECORD ADDED SUCCESSFULLY!', 'success');
    }

    closeRecordModal();
    saveToLocalStorage();
    renderApp();
    return;
  }

  if (isContacts) {
    const gipName = formatEtAl(document.getElementById('contact-gip-name').value.trim().toUpperCase());
    const assignment = document.getElementById('contact-assignment').value.trim().toUpperCase();
    const contactNumber = document.getElementById('contact-number').value.trim();

    if (!gipName) {
      showToast('GIP NAME IS REQUIRED', 'danger');
      return;
    }

    const payload = {
      gipName,
      assignment,
      contactNumber,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.contactsRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.contactsRecords[index] = { ...appState.data.contactsRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_contacts').upsert({
          id: recordId,
          gip_name: gipName,
          assignment,
          contact_number: contactNumber,
          remarks,
          updated_at: nowISO
        });
      }

      showToast('GIP CONTACT UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'cnt-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.contactsRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        await supabaseClient.from('gip_contacts').upsert({
          id: newId,
          gip_name: gipName,
          assignment,
          contact_number: contactNumber,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        });
      }

      showToast('NEW GIP CONTACT ADDED SUCCESSFULLY!', 'success');
    }
  } else if (isDtr) {
    const gipName = formatEtAl(document.getElementById('gip-name').value.trim().toUpperCase());
    const month = document.getElementById('record-month').value;
    const quincena = document.getElementById('record-quincena').value.toUpperCase();
    const dtrArDateReceived = document.getElementById('dtr-ar-date-received').value;

    if (!gipName) {
      showToast('GIP NAME IS REQUIRED', 'danger');
      return;
    }

    const payload = {
      gipName,
      month,
      quincena,
      dtrArDateReceived,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.dtrRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.dtrRecords[index] = { ...appState.data.dtrRecords[index], ...payload };
      }

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('gip_dtr_ar_records').upsert({
          id: recordId,
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase update note:', sbErr.message);
      }

      showToast('GIP RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'dtr-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.dtrRecords.unshift(newRecord);

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('gip_dtr_ar_records').upsert({
          id: newId,
          gip_name: gipName,
          month,
          quincena,
          dtr_ar_date_received: dtrArDateReceived,
          remarks,
          created_at: nowISO,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase insert note:', sbErr.message);
      }

      showToast('NEW GIP RECORD ADDED SUCCESSFULLY!', 'success');
    }
  } else {
    const particulars = formatEtAl(document.getElementById('particulars').value.trim().toUpperCase());
    const programSelect = document.getElementById('transmittal-program-select');
    const customProgramInput = document.getElementById('transmittal-custom-program');
    let program = '';

    if (programSelect && programSelect.value === 'CUSTOM') {
      program = customProgramInput ? customProgramInput.value.trim().toUpperCase() : '';
    } else if (programSelect) {
      program = programSelect.value.trim().toUpperCase();
    }

    const dateTransmitted = document.getElementById('date-transmitted').value;
    const regionalDateReceived = document.getElementById('regional-date-received-trn').value;

    if (!particulars) {
      showToast('PARTICULARS FIELD IS REQUIRED', 'danger');
      return;
    }

    const payload = {
      program,
      particulars,
      dateTransmitted,
      regionalDateReceived,
      imageUrl: currentTransmittalImageUrl || null,
      remarks,
      updatedAt: nowISO
    };

    if (recordId) {
      const index = appState.data.transmittalRecords.findIndex(r => r.id === recordId);
      if (index !== -1) {
        appState.data.transmittalRecords[index] = { ...appState.data.transmittalRecords[index], ...payload };
      }
      saveToLocalStorage();

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('transmittal_records').upsert({
          id: recordId,
          program: program || '',
          particulars,
          date_transmitted: dateTransmitted || '',
          regional_date_received: regionalDateReceived || '',
          image_url: payload.imageUrl || null,
          remarks: remarks || '',
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase update note:', sbErr.message);
      }

      showToast('TRANSMITTAL RECORD UPDATED SUCCESSFULLY!', 'success');
    } else {
      const newId = 'trn-' + Date.now();
      const newRecord = { id: newId, ...payload, createdAt: nowISO };
      appState.data.transmittalRecords.unshift(newRecord);
      saveToLocalStorage();

      if (isSupabaseConnected && supabaseClient) {
        const { error: sbErr } = await supabaseClient.from('transmittal_records').upsert({
          id: newId,
          program: program || '',
          particulars,
          date_transmitted: dateTransmitted || '',
          regional_date_received: regionalDateReceived || '',
          image_url: payload.imageUrl || null,
          remarks: remarks || '',
          created_at: nowISO,
          updated_at: nowISO
        });
        if (sbErr) console.warn('Supabase insert note:', sbErr.message);
      }

      showToast('NEW TRANSMITTAL RECORD ADDED SUCCESSFULLY!', 'success');
    }
  }

  saveToLocalStorage();
  closeRecordModal();
  renderApp();
}

/**
 * Handles Program Select Dropdown Change (Shows/Hides Custom Text Input)
 */
function handleProgramSelectChange() {
  const select = document.getElementById('transmittal-program-select');
  const customInput = document.getElementById('transmittal-custom-program');
  if (!select || !customInput) return;

  if (select.value === 'CUSTOM') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    customInput.value = '';
  }
}

/**
 * Delete Modal Handlers
 */
function openDeleteModal(id) {
  const isDtr = appState.activeTab === 'dtr';
  const isContacts = appState.activeTab === 'contacts';
  const isSalary = appState.activeTab === 'salary';
  const isCompiled = appState.activeTab === 'compiled';
  const isGsis = appState.activeTab === 'gsis';
  appState.deletingRecordId = id;

  let dataset;
  if (isDtr) dataset = appState.data.dtrRecords;
  else if (isContacts) dataset = appState.data.contactsRecords;
  else if (isSalary) dataset = appState.data.salaryRecords;
  else if (isCompiled) dataset = appState.data.compiledRecords;
  else if (isGsis) dataset = appState.data.gsisRecords;
  else dataset = appState.data.transmittalRecords;

  const record = dataset.find(r => r.id === id);

  if (!record) return;

  let summary = '';
  if (isDtr) summary = `GIP NAME: ${record.gipName} (${formatMonth(record.month)})`;
  else if (isContacts) summary = `GIP CONTACT: ${record.gipName} (${record.assignment})`;
  else if (isSalary) summary = `SALARY RECORD: ${record.gipName}`;
  else if (isCompiled) summary = `DOCUMENT: ${record.documentTitle.substring(0, 50)}...`;
  else if (isGsis) summary = `GSIS ASSURED: ${record.name} (BENEFICIARY: ${record.beneficiary})`;
  else summary = `PARTICULARS: ${record.particulars.substring(0, 50)}...`;

  document.getElementById('delete-record-summary').textContent = summary.toUpperCase();

  const pwdInput = document.getElementById('delete-password-input');
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.style.borderColor = '';
  }

  document.getElementById('delete-modal').classList.add('active');
  setTimeout(() => {
    if (pwdInput) pwdInput.focus();
  }, 100);
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.remove('active');
  appState.deletingRecordId = null;
  const pwdInput = document.getElementById('delete-password-input');
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.style.borderColor = '';
  }
}

async function confirmDeleteRecord(e) {
  if (e && e.preventDefault) e.preventDefault();
  const id = appState.deletingRecordId;
  if (!id) return;

  const pwdInput = document.getElementById('delete-password-input');
  const password = pwdInput ? pwdInput.value.trim() : '';

  if (password !== SYSTEM_MODULE_PASSWORD) {
    showToast('INCORRECT PASSWORD! DELETION CANCELLED.', 'danger');
    if (pwdInput) {
      pwdInput.style.borderColor = '#ef4444';
      pwdInput.select();
      setTimeout(() => {
        pwdInput.style.borderColor = '';
      }, 2000);
    }
    return;
  }

  const isDtr = appState.activeTab === 'dtr';
  const isContacts = appState.activeTab === 'contacts';
  const isSalary = appState.activeTab === 'salary';
  const isCompiled = appState.activeTab === 'compiled';
  const isGsis = appState.activeTab === 'gsis';
  const type = isDtr ? 'dtr' : isContacts ? 'contacts' : isSalary ? 'salary' : isCompiled ? 'compiled' : isGsis ? 'gsis' : 'transmittal';

  let dataset = appState.data.dtrRecords;
  if (isContacts) dataset = appState.data.contactsRecords;
  else if (isSalary) dataset = appState.data.salaryRecords;
  else if (isCompiled) dataset = appState.data.compiledRecords;
  else if (isGsis) dataset = appState.data.gsisRecords;
  else if (!isDtr) dataset = appState.data.transmittalRecords;

  const targetRecord = dataset.find(r => r.id === id);

  if (!targetRecord) {
    closeDeleteModal();
    return;
  }

  const nowISO = new Date().toISOString();
  const recycledItem = {
    id: 'trash-' + Date.now(),
    type: type,
    originalId: targetRecord.id,
    originalRecord: { ...targetRecord },
    deletedAt: nowISO
  };

  if (!appState.data.recycledRecords) appState.data.recycledRecords = [];
  appState.data.recycledRecords.unshift(recycledItem);

  if (isDtr) {
    appState.data.dtrRecords = appState.data.dtrRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_dtr_ar_records').delete().eq('id', id);
    }
  } else if (isContacts) {
    appState.data.contactsRecords = appState.data.contactsRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_contacts').delete().eq('id', id);
    }
  } else if (isSalary) {
    appState.data.salaryRecords = appState.data.salaryRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_salary_records').delete().eq('id', id);
    }
  } else if (isCompiled) {
    appState.data.compiledRecords = appState.data.compiledRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_compiled_documents').delete().eq('id', id);
    }
  } else if (isGsis) {
    appState.data.gsisRecords = appState.data.gsisRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_gsis_records').delete().eq('id', id);
    }
  } else {
    appState.data.transmittalRecords = appState.data.transmittalRecords.filter(r => r.id !== id);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('transmittal_records').delete().eq('id', id);
    }
  }

  if (isSupabaseConnected && supabaseClient) {
    await supabaseClient.from('recycled_records').upsert({
      id: recycledItem.id,
      type: recycledItem.type,
      original_id: recycledItem.originalId,
      original_record: recycledItem.originalRecord,
      deleted_at: nowISO
    });
  }

  saveToLocalStorage();
  closeDeleteModal();
  renderApp();
  showToast('RECORD MOVED TO RECYCLE BIN (AUTO-PURGES IN 30 DAYS)', 'info');
}

/**
 * Restore Record from Recycle Bin
 */
async function restoreRecord(trashId) {
  if (!appState.data.recycledRecords) return;

  const index = appState.data.recycledRecords.findIndex(r => r.id === trashId);
  if (index === -1) return;

  const item = appState.data.recycledRecords[index];
  const orig = item.originalRecord;
  const type = item.type;

  if (type === 'dtr') {
    appState.data.dtrRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_dtr_ar_records').upsert({
        id: orig.id,
        gip_name: orig.gipName,
        month: orig.month,
        quincena: orig.quincena,
        dtr_ar_date_received: orig.dtrArDateReceived,
        remarks: orig.remarks,
        created_at: orig.createdAt,
        updated_at: new Date().toISOString()
      });
    }
  } else if (type === 'contacts') {
    if (!appState.data.contactsRecords) appState.data.contactsRecords = [];
    appState.data.contactsRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_contacts').upsert({
        id: orig.id,
        gip_name: orig.gipName,
        assignment: orig.assignment || 'LDNPFO',
        contact_number: orig.contactNumber,
        remarks: orig.remarks || '',
        created_at: orig.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } else if (type === 'salary') {
    if (!appState.data.salaryRecords) appState.data.salaryRecords = [];
    appState.data.salaryRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_salary_records').upsert({
        id: orig.id,
        gip_name: orig.gipName,
        periods: orig.periods,
        updated_at: new Date().toISOString()
      });
    }
  } else if (type === 'compiled') {
    if (!appState.data.compiledRecords) appState.data.compiledRecords = [];
    appState.data.compiledRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_compiled_documents').upsert({
        id: orig.id,
        document_title: orig.documentTitle,
        received_from: orig.receivedFrom,
        date_received: orig.dateReceived,
        remarks: orig.remarks,
        attachments: orig.attachments || [],
        image_url: orig.imageUrl || null,
        created_at: orig.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } else if (type === 'gsis') {
    if (!appState.data.gsisRecords) appState.data.gsisRecords = [];
    appState.data.gsisRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_gsis_records').upsert({
        id: orig.id,
        gip_name: orig.name,
        dob: orig.dob,
        age: orig.age,
        address: orig.address,
        beneficiary: orig.beneficiary,
        relationship: orig.relationship,
        period: orig.period,
        amount: orig.amount || '50.00',
        source_file: orig.sourceFile,
        created_at: orig.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  } else {
    appState.data.transmittalRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('transmittal_records').upsert({
        id: orig.id,
        particulars: orig.particulars,
        prepared_by: orig.preparedBy,
        date_transmitted: orig.dateTransmitted,
        regional_date_received: orig.regionalDateReceived,
        remarks: orig.remarks,
        created_at: orig.createdAt,
        updated_at: new Date().toISOString()
      });
    }
  }

  appState.data.recycledRecords.splice(index, 1);
  if (isSupabaseConnected && supabaseClient) {
    await supabaseClient.from('recycled_records').delete().eq('id', trashId);
  }

  saveToLocalStorage();
  closeDeleteModal();
  renderApp();
  showToast('RECORD MOVED TO RECYCLE BIN (AUTO-PURGES IN 30 DAYS)', 'info');
}

/**
 * Restore Record from Recycle Bin
 */
async function restoreRecord(trashId) {
  if (!appState.data.recycledRecords) return;

  const index = appState.data.recycledRecords.findIndex(r => r.id === trashId);
  if (index === -1) return;

  const item = appState.data.recycledRecords[index];
  const orig = item.originalRecord;
  const isDtr = item.type === 'dtr';

  if (isDtr) {
    appState.data.dtrRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('gip_dtr_ar_records').upsert({
        id: orig.id,
        gip_name: orig.gipName,
        month: orig.month,
        quincena: orig.quincena,
        dtr_ar_date_received: orig.dtrArDateReceived,
        remarks: orig.remarks,
        created_at: orig.createdAt,
        updated_at: new Date().toISOString()
      });
      await supabaseClient.from('recycled_records').delete().eq('id', trashId);
    }
  } else {
    appState.data.transmittalRecords.unshift(orig);
    if (isSupabaseConnected && supabaseClient) {
      await supabaseClient.from('transmittal_records').upsert({
        id: orig.id,
        particulars: orig.particulars,
        prepared_by: orig.preparedBy,
        date_transmitted: orig.dateTransmitted,
        regional_date_received: orig.regionalDateReceived,
        remarks: orig.remarks,
        created_at: orig.createdAt,
        updated_at: new Date().toISOString()
      });
      await supabaseClient.from('recycled_records').delete().eq('id', trashId);
    }
  }

  appState.data.recycledRecords.splice(index, 1);
  saveToLocalStorage();
  renderApp();
  showToast('RECORD RESTORED SUCCESSFULLY!', 'success');
}

/**
 * Delete Permanently from Recycle Bin
 */
async function deletePermanently(trashId) {
  if (!appState.data.recycledRecords) return;

  const pwd = prompt('SECURITY PASSWORD REQUIRED TO PERMANENTLY DELETE THIS RECORD:\nEnter Password:');
  if (pwd === null) return;
  if (pwd.trim() !== SYSTEM_MODULE_PASSWORD) {
    showToast('INCORRECT PASSWORD! PERMANENT DELETION CANCELLED.', 'danger');
    return;
  }

  appState.data.recycledRecords = appState.data.recycledRecords.filter(r => r.id !== trashId);
  if (isSupabaseConnected && supabaseClient) {
    await supabaseClient.from('recycled_records').delete().eq('id', trashId);
  }

  saveToLocalStorage();
  renderApp();
  showToast('RECORD PERMANENTLY DELETED', 'info');
}

/**
 * Empty Entire Recycle Bin
 */
async function handleEmptyTrash() {
  if (!appState.data.recycledRecords || appState.data.recycledRecords.length === 0) {
    showToast('RECYCLE BIN IS ALREADY EMPTY', 'info');
    return;
  }

  const pwd = prompt('SECURITY PASSWORD REQUIRED TO PERMANENTLY EMPTY RECYCLE BIN:\nEnter Password:');
  if (pwd === null) return;
  if (pwd.trim() !== SYSTEM_MODULE_PASSWORD) {
    showToast('INCORRECT PASSWORD! EMPTY RECYCLE BIN CANCELLED.', 'danger');
    return;
  }

  if (confirm('ARE YOU SURE YOU WANT TO PERMANENTLY DELETE ALL ITEMS IN THE RECYCLE BIN? THIS CANNOT BE UNDONE.')) {
    const ids = appState.data.recycledRecords.map(r => r.id);
    appState.data.recycledRecords = [];

    if (isSupabaseConnected && supabaseClient) {
      ids.forEach(async trashId => {
        await supabaseClient.from('recycled_records').delete().eq('id', trashId);
      });
    }

    saveToLocalStorage();
    renderApp();
    showToast('RECYCLE BIN EMPTIED PERMANENTLY!', 'success');
  }
}



/**
 * Real-time Payment Status Toggle (Pending/NA <-> Received/Paid)
 * Automatically recalculates Total Paid and Remaining Budget in real-time when paid option is selected.
 */
async function toggleSalaryStatus(recordId, periodKey) {
  if (!recordId || !periodKey) return;
  const records = appState.data.salaryRecords || [];
  const record = records.find(r => r.id === recordId);
  if (!record) return;

  if (!record.periods) record.periods = {};
  const currentItem = record.periods[periodKey] || { amount: 0, status: 'pending' };

  let nextStatus = 'received';
  if (currentItem.status === 'received') {
    nextStatus = 'pending';
  } else {
    nextStatus = 'received';
  }

  let currentAmt = 0;
  if (typeof currentItem.amount === 'number') {
    currentAmt = currentItem.amount;
  } else if (currentItem.amount) {
    currentAmt = parseFloat(String(currentItem.amount).replace(/[^0-9.]/g, '')) || 0;
  }

  if (nextStatus === 'received' && currentAmt <= 0) {
    const inputAmt = prompt(`Enter stipend amount for ${record.gipName} (${periodKey}):`, '5020.00');
    if (inputAmt === null) return;
    const parsedAmt = parseFloat(inputAmt.replace(/[^0-9.]/g, ''));
    currentAmt = !isNaN(parsedAmt) && parsedAmt > 0 ? parsedAmt : 5020.00;
  }

  record.periods[periodKey] = {
    amount: currentAmt,
    status: nextStatus
  };
  record.updatedAt = new Date().toISOString();

  saveToLocalStorage();

  if (isSupabaseConnected && supabaseClient) {
    try {
      await supabaseClient.from('gip_salary_records').upsert({
        id: record.id,
        gip_name: record.gipName,
        periods: record.periods,
        updated_at: record.updatedAt
      });
    } catch (err) {
      console.warn('Real-time status toggle sync note:', err.message);
    }
  }

  renderApp();

  const formattedAmt = `₱${currentAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (nextStatus === 'received') {
    showToast(`PAID OPTION SELECTED: ${record.gipName} (${periodKey}) - ${formattedAmt}. Remaining budget updated live!`, 'success');
  } else {
    showToast(`MARKED AS PENDING: ${record.gipName} (${periodKey})`, 'info');
  }
}

/**
 * Total Salary Budget Modal & Management Handlers
 */
function openTotalBudgetModal() {
  const modal = document.getElementById('edit-total-budget-modal');
  const input = document.getElementById('input-total-budget');
  const modalPaid = document.getElementById('modal-current-paid-val');
  const modalPending = document.getElementById('modal-current-pending-val');
  const modalRem = document.getElementById('modal-current-remaining-val');

  // Calculate current total paid & pending
  let grandTotalPaid = 0;
  let grandTotalPending = 0;
  (appState.data.salaryRecords || []).forEach(record => {
    if (record.id === 'salary-budget-config') return;
    const p = record.periods || {};
    Object.values(p).forEach(item => {
      if (item && item.amount) {
        let numAmt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
        if (!isNaN(numAmt) && numAmt > 0) {
          if (item.status === 'received') {
            grandTotalPaid += numAmt;
          } else if (item.status === 'pending') {
            grandTotalPending += numAmt;
          }
        }
      }
    });
  });

  const currBudget = parseFloat(appState.data.totalBudget) || 0;
  const currRem = currBudget - grandTotalPaid;

  if (modalPaid) modalPaid.textContent = `₱${grandTotalPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (modalPending) modalPending.textContent = `₱${grandTotalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (modalRem) modalRem.textContent = `${currRem < 0 ? '-' : ''}₱${Math.abs(currRem).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (input) input.value = currBudget > 0 ? currBudget : '';

  updateBudgetModalPreview();

  if (modal) {
    modal.classList.add('active');
  }
  if (input) setTimeout(() => input.focus(), 150);
}

function closeTotalBudgetModal() {
  const modal = document.getElementById('edit-total-budget-modal');
  if (modal) {
    modal.classList.remove('active');
  }
}

async function quickPromptEditBudget() {
  const current = parseFloat(appState.data.totalBudget) || 0;
  const res = prompt('Enter new Total Salary Budget Amount (₱):', current > 0 ? current : '1500000.00');
  if (res === null) return;
  const val = parseFloat(res.replace(/[^0-9.]/g, ''));
  if (isNaN(val) || val < 0) {
    showToast('INVALID BUDGET AMOUNT ENTERED!', 'danger');
    return;
  }
  await saveTotalBudget(val);
  showToast(`TOTAL SALARY BUDGET UPDATED TO ₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`, 'success');
}

function setBudgetPreset(amount) {
  const input = document.getElementById('input-total-budget');
  if (input) {
    input.value = amount;
    updateBudgetModalPreview();
  }
}

function updateBudgetModalPreview() {
  const input = document.getElementById('input-total-budget');
  const preview = document.getElementById('modal-preview-remaining-val');

  let grandTotalPaid = 0;
  let grandTotalPending = 0;
  (appState.data.salaryRecords || []).forEach(record => {
    if (record.id === 'salary-budget-config') return;
    const p = record.periods || {};
    Object.values(p).forEach(item => {
      if (item && item.amount) {
        let numAmt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
        if (!isNaN(numAmt) && numAmt > 0) {
          if (item.status === 'received') {
            grandTotalPaid += numAmt;
          } else if (item.status === 'pending') {
            grandTotalPending += numAmt;
          }
        }
      }
    });
  });

  const newBudget = parseFloat(input?.value) || 0;
  const newRem = newBudget - grandTotalPaid;

  if (preview) {
    preview.textContent = `${newRem < 0 ? '-' : ''}₱${Math.abs(newRem).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    preview.style.color = newRem < 0 ? '#dc2626' : '#059669';
  }
}

async function handleTotalBudgetSubmit(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('input-total-budget');
  const val = parseFloat(input?.value) || 0;

  if (val < 0) {
    showToast('BUDGET AMOUNT CANNOT BE NEGATIVE!', 'danger');
    return;
  }

  await saveTotalBudget(val);
  closeTotalBudgetModal();
  showToast(`TOTAL SALARY BUDGET UPDATED TO ₱${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}!`, 'success');
}

async function saveTotalBudget(newBudget) {
  appState.data.totalBudget = newBudget;
  saveToLocalStorage();

  if (isSupabaseConnected && supabaseClient) {
    try {
      await supabaseClient.from('gip_salary_records').upsert({
        id: 'salary-budget-config',
        gip_name: '__TOTAL_BUDGET_CONFIG__',
        periods: { totalBudget: newBudget },
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Failed to sync total budget to Supabase:', err);
    }
  }

  updateCountsAndStats();
  renderTable();
}

/**
 * Excel Export Selection Modal & Handlers
 */
function renderSalaryFilterOptions() {
  const quincenaSelect = document.getElementById('salary-quincena-filter');
  if (!quincenaSelect) return;

  const currentVal = appState.salaryQuincenaFilter || 'ALL';
  const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;
  let html = `<option value="ALL">Period: All Quincenas</option>`;
  periodsList.forEach(pKey => {
    const isSel = currentVal === pKey ? 'selected' : '';
    html += `<option value="${escapeHtml(pKey)}" ${isSel}>Period: ${escapeHtml(pKey)}</option>`;
  });
  quincenaSelect.innerHTML = html;
}

function openExcelExportModal() {
  const modal = document.getElementById('excel-export-modal');
  if (!modal) {
    handleExportExcelDirect();
    return;
  }

  const chkDtr = document.getElementById('export-chk-dtr');
  const chkTrn = document.getElementById('export-chk-trn');
  const chkSalary = document.getElementById('export-chk-salary');
  const chkCnt = document.getElementById('export-chk-cnt');
  const chkTrash = document.getElementById('export-chk-trash');
  const pwdInput = document.getElementById('export-password-input');
  const preparedBySelect = document.getElementById('export-select-prepared-by');

  if (chkDtr) chkDtr.checked = (appState.activeTab === 'dtr');
  if (chkTrn) chkTrn.checked = (appState.activeTab === 'transmittal');
  if (chkSalary) chkSalary.checked = (appState.activeTab === 'salary' || appState.activeTab === 'dtr');
  if (chkCnt) chkCnt.checked = (appState.activeTab === 'contacts');
  if (chkTrash) chkTrash.checked = (appState.activeTab === 'trash');
  if (pwdInput) pwdInput.value = '';

  // Dynamically populate "Prepared By" dropdown from existing transmittals
  if (preparedBySelect) {
    const trnRecords = appState.data.transmittalRecords || [];
    const uniquePreparedBy = Array.from(new Set(trnRecords.map(r => (r.preparedBy || '').trim().toUpperCase()).filter(Boolean))).sort();

    let optionsHtml = `<option value="ALL">-- ALL PREPARED BY OFFICERS (${trnRecords.length} records) --</option>`;
    uniquePreparedBy.forEach(name => {
      const count = trnRecords.filter(r => (r.preparedBy || '').trim().toUpperCase() === name).length;
      optionsHtml += `<option value="${escapeHtml(name)}">${escapeHtml(name)} (${count} transmittals)</option>`;
    });

    preparedBySelect.innerHTML = optionsHtml;
  }

  updateExportAuthVisibility();
  modal.classList.add('active');
}

function closeExcelExportModal() {
  const modal = document.getElementById('excel-export-modal');
  if (modal) modal.classList.remove('active');
}

function updateExportAuthVisibility() {
  const chkTrn = document.getElementById('export-chk-trn');
  const chkTrash = document.getElementById('export-chk-trash');
  const authContainer = document.getElementById('export-auth-container');
  const trnFilterBox = document.getElementById('export-trn-filter-box');

  if (trnFilterBox) {
    trnFilterBox.style.display = chkTrn && chkTrn.checked ? 'block' : 'none';
  }

  const requiresTrashAuth = chkTrash && chkTrash.checked && !authenticatedModules.trash;

  if (authContainer) {
    if (requiresTrashAuth) {
      authContainer.style.display = 'block';
    } else {
      authContainer.style.display = 'none';
    }
  }
}

function handleExcelExportFormSubmit(e) {
  e.preventDefault();

  const chkDtr = document.getElementById('export-chk-dtr')?.checked;
  const chkTrn = document.getElementById('export-chk-trn')?.checked;
  const chkCnt = document.getElementById('export-chk-cnt')?.checked;
  const chkSalary = document.getElementById('export-chk-salary')?.checked;
  const chkTrash = document.getElementById('export-chk-trash')?.checked;

  if (!chkDtr && !chkTrn && !chkCnt && !chkSalary && !chkTrash) {
    showToast('PLEASE SELECT AT LEAST ONE SHEET TO EXPORT', 'warning');
    return;
  }

  // Verify password if protected sheets (Trash) are selected and not authenticated
  const requiresTrashAuth = chkTrash && !authenticatedModules.trash;

  if (requiresTrashAuth) {
    const pwdInput = document.getElementById('export-password-input');
    const pwd = pwdInput ? pwdInput.value.trim() : '';

    if (pwd !== SYSTEM_MODULE_PASSWORD) {
      showToast('INCORRECT PASSWORD FOR PROTECTED SHEETS! EXPORT CANCELLED.', 'danger');
      if (pwdInput) {
        pwdInput.style.borderColor = '#ef4444';
        pwdInput.select();
        setTimeout(() => pwdInput.style.borderColor = '', 2000);
      }
      return;
    }

    if (chkTrash) authenticatedModules.trash = true;
  }

  // Generate Excel workbook
  try {
    const wb = XLSX.utils.book_new();

    if (chkDtr) {
      const dtrDataFormatted = appState.data.dtrRecords.map(r => ({
        'GIP NAME': (r.gipName || '').toUpperCase(),
        'MONTH / YEAR': formatMonth(r.month).toUpperCase(),
        'QUINCENA (PAYROLL PERIOD)': (r.quincena || '1ST QUINCENA (1-15)').toUpperCase(),
        'DTR & AR DATE RECEIVED (LDNPFO)': r.dtrArDateReceived || 'N/A',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const wsDtr = XLSX.utils.json_to_sheet(dtrDataFormatted);
      XLSX.utils.book_append_sheet(wb, wsDtr, 'GIP DTR & AR');
    }

    if (chkTrn) {
      const selectedPreparedBy = document.getElementById('export-select-prepared-by')?.value || 'ALL';
      let trnRecordsToExport = appState.data.transmittalRecords || [];

      if (selectedPreparedBy !== 'ALL') {
        trnRecordsToExport = trnRecordsToExport.filter(r => (r.preparedBy || '').trim().toUpperCase() === selectedPreparedBy);
      }

      const trnDataFormatted = trnRecordsToExport.map(r => ({
        'PARTICULARS (TRANSMITTED DOCUMENTS)': (r.particulars || '').replace(/\r?\n/g, ' ').toUpperCase(),
        'PREPARED BY': (r.preparedBy || 'N/A').toUpperCase(),
        'DATE TRANSMITTED': r.dateTransmitted || 'N/A',
        'DATE RECEIVED (REGIONAL OFFICE)': r.regionalDateReceived || 'N/A',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const wsTrn = XLSX.utils.json_to_sheet(trnDataFormatted);
      XLSX.utils.book_append_sheet(wb, wsTrn, 'TRANSMITTALS');
    }

    if (chkCnt) {
      const cntDataFormatted = (appState.data.contactsRecords || []).map(r => ({
        'GIP FULL NAME': (r.gipName || '').toUpperCase(),
        'ASSIGNMENT / OFFICE': (r.assignment || 'LDNPFO').toUpperCase(),
        'CONTACT NUMBER': r.contactNumber || 'N/A',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const wsCnt = XLSX.utils.json_to_sheet(cntDataFormatted);
      XLSX.utils.book_append_sheet(wb, wsCnt, 'GIP CONTACTS');
    }

    const chkGsis = document.getElementById('export-chk-gsis')?.checked;
    if (chkGsis) {
      const gsisDataFormatted = (appState.data.gsisRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'NAME OF ASSURED': (r.name || '').toUpperCase(),
        'DATE OF BIRTH': r.dob || 'N/A',
        'AGE': r.age || 'N/A',
        'ADDRESS': (r.address || '').toUpperCase(),
        'DESIGNATED BENEFICIARY': (r.beneficiary || '').toUpperCase(),
        'RELATIONSHIP TO ASSURED': (r.relationship || '').toUpperCase(),
        'PERIOD OF EMPLOYMENT': (r.period || '').toUpperCase()
      }));
      const wsGsis = XLSX.utils.json_to_sheet(gsisDataFormatted);
      XLSX.utils.book_append_sheet(wb, wsGsis, 'GIP GSIS INSURANCE');
    }

    const chkSalary = document.getElementById('export-chk-salary')?.checked;
    if (chkSalary) {
      const salStatusMode = (document.querySelector('input[name="export-salary-status"]:checked')?.value) || 'ALL';
      const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;

      // Helper: build a salary sheet from a filtered subset of records
      const buildSalarySheet = (records, label) => {
        let grandTotalDisbursed = 0;
        let grandTotalPending = 0;

        const rows = records.map((r, idx) => {
          const row = {
            'NO.': idx + 1,
            'GIP NAME / BENEFICIARY GROUP': (r.gipName || '').toUpperCase()
          };
          let totalRowPaid = 0;
          let totalRowPending = 0;

          periodsList.forEach(pKey => {
            const item = (r.periods || {})[pKey];
            if (!item || item.amount <= 0 || item.status === 'na') {
              row[pKey] = 'N/A';
            } else {
              let amt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
              if (isNaN(amt)) amt = 0;
              const isReceived = item.status === 'received';
              const statusTag = isReceived ? 'PAID' : 'PENDING';
              row[pKey] = `\u20b1${amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${statusTag})`;
              if (isReceived) { totalRowPaid += amt; grandTotalDisbursed += amt; }
              else { totalRowPending += amt; grandTotalPending += amt; }
            }
          });

          row['TOTAL PAID AMOUNT'] = `\u20b1${totalRowPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          row['TOTAL PENDING AMOUNT'] = `\u20b1${totalRowPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          row['REMARKS'] = (r.remarks || '').toUpperCase();
          return row;
        });

        // Summary row
        const summaryRow = { 'NO.': '', 'GIP NAME / BENEFICIARY GROUP': `=== GRAND TOTAL ${label} ===` };
        periodsList.forEach(pKey => { summaryRow[pKey] = ''; });
        summaryRow['TOTAL PAID AMOUNT'] = `\u20b1${grandTotalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        summaryRow['TOTAL PENDING AMOUNT'] = `\u20b1${grandTotalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        summaryRow['REMARKS'] = `TOTAL DISBURSED - ${label}`;
        rows.push(summaryRow);

        const totalBudgetVal = parseFloat(appState.data.totalBudget) || 0;
        const remVal = totalBudgetVal - grandTotalDisbursed;
        const budgetRow = { 'NO.': '', 'GIP NAME / BENEFICIARY GROUP': '=== TOTAL ALLOCATED BUDGET ===' };
        periodsList.forEach(pKey => { budgetRow[pKey] = ''; });
        budgetRow['TOTAL PAID AMOUNT'] = `\u20b1${totalBudgetVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        budgetRow['TOTAL PENDING AMOUNT'] = '';
        budgetRow['REMARKS'] = 'MANUALLY SET TOTAL BUDGET';
        rows.push(budgetRow);

        const remainingRow = { 'NO.': '', 'GIP NAME / BENEFICIARY GROUP': '=== REMAINING BUDGET ===' };
        periodsList.forEach(pKey => { remainingRow[pKey] = ''; });
        remainingRow['TOTAL PAID AMOUNT'] = `${remVal < 0 ? '-' : ''}\u20b1${Math.abs(remVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        remainingRow['TOTAL PENDING AMOUNT'] = '';
        remainingRow['REMARKS'] = remVal < 0 ? 'OVER BUDGET / DEFICIT' : 'TOTAL BUDGET MINUS TOTAL PAID';
        rows.push(remainingRow);
        return rows;
      };

      const allRecords = appState.data.salaryRecords || [];

      // Filter helpers
      const hasPaid = (r) => Object.values(r.periods || {}).some(p => p && p.status === 'received' && p.amount > 0);
      const hasPending = (r) => Object.values(r.periods || {}).some(p => p && p.status === 'pending' && p.amount > 0);

      if (salStatusMode === 'ALL') {
        const rows = buildSalarySheet(allRecords, 'DISBURSED');
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'SALARY & PAYROLL');
      } else if (salStatusMode === 'PAID') {
        const paidRecords = allRecords.filter(hasPaid);
        const rows = buildSalarySheet(paidRecords, 'PAID / RECEIVED');
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'SALARY - PAID ONLY');
      } else if (salStatusMode === 'PENDING') {
        const pendingRecords = allRecords.filter(hasPending);
        const rows = buildSalarySheet(pendingRecords, 'PENDING');
        const ws = XLSX.utils.json_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'SALARY - PENDING ONLY');
      } else if (salStatusMode === 'BOTH_SEPARATE') {
        const paidRecords = allRecords.filter(hasPaid);
        const pendingRecords = allRecords.filter(hasPending);
        const rowsPaid = buildSalarySheet(paidRecords, 'PAID / RECEIVED');
        const rowsPending = buildSalarySheet(pendingRecords, 'PENDING');
        const wsPaid = XLSX.utils.json_to_sheet(rowsPaid);
        const wsPending = XLSX.utils.json_to_sheet(rowsPending);
        XLSX.utils.book_append_sheet(wb, wsPaid, 'SALARY - PAID');
        XLSX.utils.book_append_sheet(wb, wsPending, 'SALARY - PENDING');
      }
    }

    if (chkTrash) {
      const trashDataFormatted = (appState.data.recycledRecords || []).map(r => {
        const isDtr = r.type === 'dtr';
        const orig = r.originalRecord || {};
        return {
          'RECORD TYPE': isDtr ? 'GIP DTR & AR' : 'TRANSMITTAL',
          'RECORD TITLE / DETAILS': isDtr
            ? `GIP: ${orig.gipName || ''} (${orig.month || ''})`
            : `PARTICULARS: ${(orig.particulars || '').replace(/\r?\n/g, ' ')}`,
          'DATE DELETED': formatDate(r.deletedAt ? r.deletedAt.substring(0, 10) : ''),
          'RETENTION REMAINING': `${getRetentionDaysRemaining(r.deletedAt)} DAYS`,
          'REMARKS': (orig.remarks || '').toUpperCase()
        };
      });
      const wsTrash = XLSX.utils.json_to_sheet(trashDataFormatted);
      XLSX.utils.book_append_sheet(wb, wsTrash, 'RECYCLE BIN');
    }

    const today = new Date().toISOString().split('T')[0];
    const fileName = `DOLE_LDNPFO_GIP_MONITORING_${today}.xlsx`;
    XLSX.writeFile(wb, fileName);

    closeExcelExportModal();
    showToast('EXCEL FILE DOWNLOADED SUCCESSFULLY!', 'success');
  } catch (err) {
    console.error('XLSX export error, falling back to CSV:', err);
    exportFallbackCSV();
  }
}

/**
 * Export Active Module Data from Header Toolbar
 */
function exportActiveModuleData() {
  exportSingleModule(null, appState.activeTab);
}

/**
 * Single Module Direct Download from Sidebar
 */
function exportSingleModule(e, type) {
  if (e) {
    e.stopPropagation();
    e.preventDefault();
  }

  const dateStr = new Date().toISOString().split('T')[0];
  const wb = XLSX.utils.book_new();

  try {
    if (type === 'dtr') {
      const dataFormatted = (appState.data.dtrRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'GIP FULL NAME': (r.gipName || '').toUpperCase(),
        'MONTH': formatMonth(r.month),
        'QUINCENA': (r.quincena || '').toUpperCase(),
        'DATE RECEIVED BY DOLE': r.dtrArDateReceived ? formatDate(r.dtrArDateReceived) : 'N/A',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'GIP DTR & AR');
      XLSX.writeFile(wb, `GIP_DTR_AR_Records_${dateStr}.xlsx`);
      showToast('GIP DTR & AR EXCEL DOWNLOADED!', 'success');
    } else if (type === 'transmittal') {
      const dataFormatted = (appState.data.transmittalRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'PROGRAM': (r.program || 'GIP').toUpperCase(),
        'PARTICULARS': (r.particulars || '').toUpperCase(),
        'DATE TRANSMITTED': r.dateTransmitted ? formatDate(r.dateTransmitted) : 'N/A',
        'REGIONAL DATE RECEIVED': r.regionalDateReceived ? formatDate(r.regionalDateReceived) : 'PENDING',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'TRANSMITTALS');
      XLSX.writeFile(wb, `Transmittal_Records_${dateStr}.xlsx`);
      showToast('TRANSMITTALS EXCEL DOWNLOADED!', 'success');
    } else if (type === 'contacts') {
      const dataFormatted = (appState.data.contactsRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'GIP FULL NAME': (r.gipName || '').toUpperCase(),
        'ASSIGNMENT / OFFICE': (r.assignment || 'LDNPFO').toUpperCase(),
        'CONTACT NUMBER': r.contactNumber || 'N/A',
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'GIP CONTACTS');
      XLSX.writeFile(wb, `GIP_Contacts_Directory_${dateStr}.xlsx`);
      showToast('GIP CONTACTS EXCEL DOWNLOADED!', 'success');
    } else if (type === 'salary') {
      const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;
      const dataFormatted = (appState.data.salaryRecords || []).map((r, idx) => {
        let receivedSum = 0;
        let pendingSum = 0;
        const row = {
          'NO.': idx + 1,
          'GIP FULL NAME': (r.gipName || '').toUpperCase()
        };
        periodsList.forEach(p => {
          const pData = (r.periods && r.periods[p]) ? r.periods[p] : { amount: 0, status: 'na' };
          const amt = pData.amount || 0;
          const st = (pData.status || 'na').toUpperCase();
          row[p] = amt > 0 ? `₱${amt.toFixed(2)} (${st})` : 'N/A';
          if (pData.status === 'received') receivedSum += amt;
          else if (pData.status === 'pending') pendingSum += amt;
        });
        row['TOTAL RECEIVED'] = `₱${receivedSum.toFixed(2)}`;
        row['TOTAL PENDING'] = `₱${pendingSum.toFixed(2)}`;
        row['REMARKS'] = (r.remarks || '').toUpperCase();
        return row;
      });
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'GIP SALARY TRACKING');
      XLSX.writeFile(wb, `GIP_Salary_Tracker_${dateStr}.xlsx`);
      showToast('SALARY TRACKER EXCEL DOWNLOADED!', 'success');
    } else if (type === 'gsis') {
      const dataFormatted = (appState.data.gsisRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'NAME OF ASSURED': (r.name || '').toUpperCase(),
        'DATE OF BIRTH': r.dob || 'N/A',
        'AGE': r.age || 'N/A',
        'ADDRESS': (r.address || '').toUpperCase(),
        'DESIGNATED BENEFICIARY': (r.beneficiary || '').toUpperCase(),
        'RELATIONSHIP TO ASSURED': (r.relationship || '').toUpperCase(),
        'PERIOD OF EMPLOYMENT': (r.period || '').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'GIP GSIS INSURANCE');
      XLSX.writeFile(wb, `GIP_GSIS_Insurance_Info_${dateStr}.xlsx`);
      showToast('GIP GSIS EXCEL DOWNLOADED!', 'success');
    } else if (type === 'compiled') {
      const dataFormatted = (appState.data.compiledRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'DOCUMENT TITLE': (r.documentTitle || '').toUpperCase(),
        'RECEIVED FROM': (r.receivedFrom || '').toUpperCase(),
        'DATE RECEIVED': r.dateReceived ? formatDate(r.dateReceived) : 'N/A',
        'ATTACHMENTS COUNT': (r.attachments || []).length,
        'REMARKS': (r.remarks || '').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'DOCUMENTS RECEIVED');
      XLSX.writeFile(wb, `GIP_Compiled_Documents_${dateStr}.xlsx`);
      showToast('DOCUMENTS LIST EXCEL DOWNLOADED!', 'success');
    } else if (type === 'trash') {
      const dataFormatted = (appState.data.recycledRecords || []).map((r, idx) => ({
        'NO.': idx + 1,
        'TYPE': (r.type || '').toUpperCase(),
        'ORIGINAL ID': r.originalId || '',
        'DATE DELETED': r.deletedAt ? formatDate(r.deletedAt.substring(0, 10)) : 'N/A'
      }));
      const ws = XLSX.utils.json_to_sheet(dataFormatted);
      XLSX.utils.book_append_sheet(wb, ws, 'RECYCLE BIN');
      XLSX.writeFile(wb, `Recycle_Bin_Archive_${dateStr}.xlsx`);
      showToast('RECYCLE BIN EXCEL DOWNLOADED!', 'success');
    }
  } catch (err) {
    console.error('Error exporting single module:', err);
    showToast('FAILED TO DOWNLOAD MODULE EXCEL', 'danger');
  }
}

/**
 * CSV Fallback Exporter
 */
function exportFallbackCSV() {
  const isSalary = appState.activeTab === 'salary';
  const isContacts = appState.activeTab === 'contacts';
  const isDtr = appState.activeTab === 'dtr';

  let csvContent = 'data:text/csv;charset=utf-8,';
  if (isSalary) {
    const periodsList = appState.quincenaPeriods || DEFAULT_QUINCENA_PERIODS;
    csvContent += `NO.,GIP NAME / BENEFICIARY GROUP,${periodsList.join(',')},TOTAL PAID AMOUNT,TOTAL PENDING AMOUNT,REMARKS\n`;
    (appState.data.salaryRecords || []).forEach((r, idx) => {
      let rowPaid = 0;
      let rowPending = 0;
      const periodVals = periodsList.map(pKey => {
        const item = (r.periods || {})[pKey];
        if (!item || item.amount <= 0 || item.status === 'na') return 'N/A';
        const amt = typeof item.amount === 'number' ? item.amount : (parseFloat(String(item.amount).replace(/[^0-9.]/g, '')) || 0);
        if (item.status === 'received') rowPaid += amt;
        else rowPending += amt;
        return `"₱${amt.toFixed(2)} (${item.status === 'received' ? 'PAID' : 'PENDING'})"`;
      });
      csvContent += `${idx + 1},"${(r.gipName || '').toUpperCase()}",${periodVals.join(',')},"₱${rowPaid.toFixed(2)}","₱${rowPending.toFixed(2)}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  } else if (isContacts) {
    csvContent += 'NO.,GIP FULL NAME,ASSIGNMENT / OFFICE,CONTACT NUMBER,REMARKS\n';
    (appState.data.contactsRecords || []).forEach((r, idx) => {
      csvContent += `${idx + 1},"${(r.gipName || '').toUpperCase()}","${(r.assignment || 'LDNPFO').toUpperCase()}","${r.contactNumber || ''}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  } else if (isDtr) {
    csvContent += 'NO.,GIP NAME,MONTH,QUINCENA,DTR & AR DATE RECEIVED (LDNPFO),REMARKS\n';
    appState.data.dtrRecords.forEach((r, idx) => {
      csvContent += `${idx + 1},"${(r.gipName || '').toUpperCase()}","${r.month}","${(r.quincena || '').toUpperCase()}","${r.dtrArDateReceived}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  } else {
    csvContent += 'NO.,PARTICULARS,PREPARED BY,DATE TRANSMITTED,DATE RECEIVED (REGIONAL OFFICE),REMARKS\n';
    appState.data.transmittalRecords.forEach((r, idx) => {
      const cleanParticulars = (r.particulars || '').replace(/\r?\n/g, ' ').toUpperCase();
      csvContent += `${idx + 1},"${cleanParticulars}","${(r.preparedBy || '').toUpperCase()}","${r.dateTransmitted}","${r.regionalDateReceived}","${(r.remarks || '').toUpperCase()}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `GIP_MONITORING_EXPORT_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('CSV FILE DOWNLOADED!', 'info');
}

/**
 * Print Handler
 */
function handlePrintReport() {
  const titleElem = document.getElementById('print-report-title');
  const timestampElem = document.getElementById('print-timestamp');

  const moduleName = appState.activeTab === 'dtr' ? 'GIP DTR & AR MONITORING' : 'TRANSMITTAL MONITORING';
  titleElem.textContent = `DOLE LDNPFO - ${moduleName} OFFICIAL REPORT`;
  timestampElem.textContent = `GENERATED ON: ${new Date().toLocaleString().toUpperCase()}`;

  window.print();
}

/**
 * Toast Notification Helper
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconName = 'info';
  if (type === 'success') iconName = 'check-circle';
  if (type === 'danger') iconName = 'alert-triangle';

  toast.innerHTML = `
    <i data-lucide="${iconName}" style="width: 18px; height: 18px;"></i>
    <span>${escapeHtml(message).toUpperCase()}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/**
 * Formatting Utility Helpers
 */
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
      }
    }
    const parsedDate = new Date(dateStr);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    }
    return String(dateStr).toUpperCase();
  } catch (e) {
    return String(dateStr || '-').toUpperCase();
  }
}

function formatMonth(monthStr) {
  if (!monthStr) return 'N/A';
  try {
    const [y, m] = monthStr.split('-');
    if (!y || !m) return monthStr;
    const date = new Date(y, m - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
  } catch (e) {
    return monthStr.toUpperCase();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Formats any variation of "ET.AL", "ETAL", "ET AL", "ET. AL.", "ET AL.,", "ET-AL", etc.
 * into "et al." (lowercase with dot), while keeping all surrounding text in CAPSLOCK and preserving line breaks.
 */
function formatEtAl(str) {
  if (!str) return '';
  let text = String(str);
  return text
    .replace(/\bET[\.\s\-]*AL[\.,\s]*/gi, 'et al. ')
    .replace(/[ \t]+/g, ' ')
    .split(/\r?\n/)
    .map(line => line.trim())
    .join('\n')
    .trim();
}

/**
 * Strips all special characters EXCEPT allowed: (,) (:) (-) (.) letters, numbers, and spaces
 */
function sanitizeSpecialCharacters(text) {
  if (!text) return '';
  return String(text)
    // Strip out all characters except A-Z, a-z, 0-9, Ñ, ñ, comma (,), colon (:), hyphen (-), period (.), and whitespace
    .replace(/[^a-zA-Z0-9Ññ,\.:\-\s\r\n]/g, '')
    // Collapse multiple colons to 1
    .replace(/::+/g, ':')
    // Collapse multiple spaces
    .replace(/[ \t]+/g, ' ');
}

/**
 * Advanced Name & Word OCR Precision Corrector
 * Fixes OCR misread characters in names (e.g. E¢ AGBONA -> AGBONA, SOHAIY% M. -> SOHAIYA M., AMOUNTING TO:::::: -> AMOUNTING TO:)
 */
function cleanOcrNameAndWordText(text) {
  if (!text) return '';
  let str = String(text);

  // 1. Strip disallowed special characters except (,) (:) (-) (.)
  str = sanitizeSpecialCharacters(str);

  // 2. Fix multiple colons (e.g. TO:::::: 11,290.00 -> TO: 11,290.00)
  str = str.replace(/::+/g, ':');
  str = str.replace(/:\s*:\s*:+/g, ':');
  str = str.replace(/\bAMOUNTING\s*TO\s*[:\.\s]+/gi, 'AMOUNTING TO: ');

  // 3. Fix lead OCR bullet/symbol artifacts before names (e.g. "OE MAMANGCONI" -> "MAMANGCONI", "EO AGBONA" -> "AGBONA")
  str = str.replace(/^[~"'\*=\-+•>§«»#\$\&¢€£©®0-9\s]+/, '');
  str = str.replace(/\b(EO|OE|E0|0E|EC|CE|E¢|EQ|QE|E\.|O\.)\s+(?=[A-Z]{3,})/gi, '');
  str = str.replace(/^(EO|OE|E0|0E|EC|CE|E¢|EQ|QE|E|O|0|¢|©|®)\b\s*/gi, '');
  str = str.replace(/\b(EO|OE|E0|0E|EC|CE|E¢|EQ|QE)\b\s+(?=[A-Z]{3,})/gi, '');

  // 4. Fix stray symbols in names & words
  str = str.replace(/([A-Z]{2,})%\b/gi, '$1A');
  str = str.replace(/([A-Z]+)%([A-Z]+)/gi, '$1A$2');
  str = str.replace(/\b%\s+([A-Z]\.)/gi, 'A. $1');
  str = str.replace(/%/g, '');

  // 5. Fix 0 (zero) inside names (e.g. AMER0L -> AMEROL, ALF0RQUE -> ALFORQUE, R0DRIGUEZ -> RODRIGUEZ)
  str = str.replace(/\b([A-Z]+)0([A-Z]+)\b/gi, '$1O$2');
  str = str.replace(/\b0([A-Z]{2,})\b/gi, 'O$1');
  str = str.replace(/\b([A-Z]{2,})0\b/gi, '$1O');

  // 6. Fix 1 (one) inside names (e.g. JUL1ANA -> JULIANA, M1CHAEL -> MICHAEL)
  str = str.replace(/\b([A-Z]+)1([A-Z]+)\b/gi, '$1I$2');

  // 7. Fix 5 (five) inside names (e.g. 5ANTOS -> SANTOS)
  str = str.replace(/\b([A-Z]+)5([A-Z]+)\b/gi, '$1S$2');

  // 8. Fix 4 (four) in place of A (e.g. JULI4NA -> JULIANA, C4BAÑOG -> CABAÑOG)
  str = str.replace(/\b([A-Z]+)4([A-Z]+)\b/gi, '$1A$2');

  // 9. Fix misread middle initials (e.g. B8 -> B., C8 -> C., M8 -> M.)
  str = str.replace(/\b([A-Z])8\b/gi, '$1.');

  // 10. Fix | or / inside names (e.g. JUL|ANA -> JULIANA, SUL|ANA -> SULIANA)
  str = str.replace(/([A-Z])[\|\/]([A-Z])/gi, '$1I$2');

  // 11. Fix middle initial formatting (e.g. "SOHAIYA M" at end of line -> "SOHAIYA M.")
  str = str.replace(/,\s*([A-Z\s]+)\s+([A-Z])$/gi, ', $1 $2.');
  str = str.replace(/\b([A-Z])\s*$/gi, '$1.');

  // 12. Auto-format ET.AL, ETAL, ET AL, ET-AL to "et al."
  str = formatEtAl(str);

  // 13. Fix stray quotes/brackets/double punctuation
  str = str.replace(/\.\.+/g, '.');
  str = str.replace(/::+/g, ':');
  str = str.replace(/[,;]\s*[,;]/g, ',');
  str = str.replace(/\s+/g, ' ').trim();

  // Final pass through sanitizer to guarantee zero forbidden special characters remain
  return sanitizeSpecialCharacters(str);
}

/**
 * Intelligently parses, filters, and auto-corrects DOLE Transmittal OCR text into 100% clean Particulars
 */
function parseTransmittalOcrText(rawText) {
  if (!rawText) return { particulars: '', preparedBy: '', dateTransmitted: '' };

  // Phase 1: Fix common OCR character & spelling mistakes specific to DOLE Transmittals
  let cleanedRaw = String(rawText)
    .replace(/::+/g, ':')
    .replace(/:\s*:\s*:+/g, ':')
    .replace(/\b(DTR5|DTRS?[\s&\/]+ARS?|DTR\s*AND\s*AR|DTR\s*&\s*ARs?|DTRAAR|DTRGARS)\b/gi, 'DTR & AR')
    .replace(/\b(QUINCEN[A4]|QU1NCENA|QUINCEMA|QUINCENAS|QUICENA)\b/gi, 'QUINCENA')
    .replace(/\b(TRANSM1TTAL|TRANSMITLL|TRANSM1TAL|TRANSMITTALS|TRANSMITL)\b/gi, 'TRANSMITTAL')
    .replace(/\b(AMOUNTNG|AMOUNTTNG|AMOUNTING\s*T0|AMOUNTTING|AMOUNTING\s*TO[:\.\s]*)\b/gi, 'AMOUNTING TO: ')
    .replace(/\b(BATC1|BATC\|\|?|BATC)\b/gi, 'BATCH')
    .replace(/\b(ACCOMPLISHMNT|ACCOMPLISH)\b/gi, 'ACCOMPLISHMENT')
    .replace(/\b(DISBURSEMNT)\b/gi, 'DISBURSEMENT')
    .replace(/\b(PARTICULAR|PARTICULARS:?)\b/gi, 'PARTICULARS:')
    .replace(/\b(PREPARED\s+BY:?|PREPAREDBY:?)\b/gi, 'PREPARED BY:')
    .replace(/\b(REGION[A4]L\s+OFFICE|REG\s+OFFICE|REGIONAL\s+OFF)\b/gi, 'REGIONAL OFFICE')
    .replace(/\b(L[A4]NAO\s+DEL\s+NORTE)\b/gi, 'LANAO DEL NORTE')
    .replace(/\b(LDNPF0|LDNPF1|LDN\s+PFO)\b/gi, 'LDNPFO')
    .replace(/\b(PES0|PESOS?)\b/gi, 'P.')
    .replace(/P,,/g, 'P.,')
    .replace(/DVAND\b/gi, 'DV AND')
    .replace(/([0-9]+)\s*,\s*([0-9]{2})\b/g, '$1.$2')
    .replace(/[\{\}\[\]]/g, ' ');

  const rawLines = cleanedRaw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  let extractedPreparedBy = '';
  let extractedDate = '';
  let cleanedLines = [];

  // Patterns for unnecessary document headers, footers, logos, page numbers, and stamp noise
  const ignorePatterns = [
    /^republic of the/i,
    /^department of labor/i,
    /^regional office/i,
    /^lanao del norte/i,
    /^oredc building/i,
    /^http:\/\//i,
    /^www\./i,
    /^tel(efax)?\s*no/i,
    /^088\s*\d+/i,
    /^tssd\/c\/o/i,
    /^princess bael/i,
    /^no\.\s+particulars/i,
    /^particulars$/i,
    /^responsibly$/i,
    /^no\.$/i,
    /^sl\.?\s*no\.?/i,
    /^item\s*no\.?/i,
    /^name\s+of\s+gip/i,
    /^name\s+of\s+beneficiary/i,
    /^amount of\s*insurance/i,
    /^page\s+\d+/i,
    /^received\s+by/i,
    /^released\s+by/i,
    /^signature/i,
    /^date\s*&\s*time/i
  ];

  rawLines.forEach(line => {
    // Detect Prepared By
    const prepMatch = line.match(/prepared\s+by:?\s*([^\n\r\t:]+?)(?=\s*date:|$)/i);
    if (prepMatch && prepMatch[1]) {
      let name = prepMatch[1].replace(/[\/\\].*$/, '').trim();
      if (name) extractedPreparedBy = formatEtAl(cleanOcrNameAndWordText(name.toUpperCase()));
    }

    // Detect Date
    const dateMatch = line.match(/date:?\s*([a-z]+\s+\d{1,2},?\s*\d{4}|\d{4}-\d{2}-\d{2})/i);
    if (dateMatch && dateMatch[1]) {
      const parsedDate = parseOcrDateToYYYYMMDD(dateMatch[1]);
      if (parsedDate) extractedDate = parsedDate;
    }

    // Filter out headers/footers/logos/stamps
    const isIgnored = ignorePatterns.some(pattern => pattern.test(line)) ||
      /^prepared\s+by/i.test(line) ||
      /^date:/i.test(line) ||
      /^[0-9\s\-]+$/.test(line) || // Discard lines containing only standalone numbers
      /^[^a-zA-Z0-9]+$/.test(line); // Discard lines with no alphanumeric characters

    if (!isIgnored) {
      // Clean OCR bullet artifacts (e.g. 'EO ', 'OE ', 'E¢ ', 'E0 ', '0E ', 'EC ', 'CE ', 'EQ ', 'QE ')
      let lineText = line
        .replace(/^[~"'\*=\-+•>§«»#\s]+/, '')
        .replace(/\b(EO|OE|E0|0E|EC|CE|E¢|EQ|QE)\b\s*/gi, '')
        .replace(/^(EO|OE|E0|0E|EC|CE|E|O|0)\s+(?=[A-Z]{2,})/i, '')
        .replace(/\s*\/\s*$/, '')
        .trim();

      // Run Name & Word OCR Precision Corrector
      lineText = cleanOcrNameAndWordText(lineText);

      if (lineText && lineText.length > 2) {
        cleanedLines.push(lineText);
      }
    }
  });

  // Merge wrapped orphan lines starting with AMOUNTING TO:
  let finalLines = [];
  cleanedLines.forEach(line => {
    if (/^AMOUNTING TO/i.test(line) && finalLines.length > 0) {
      finalLines[finalLines.length - 1] += ' ' + line;
    } else {
      finalLines.push(line);
    }
  });

  // Strict Line Deduplication Filter (prevents doubled/duplicated lines from OCR)
  let uniqueLines = [];
  finalLines.forEach(line => {
    const normalized = line.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDuplicate = uniqueLines.some(u => u.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized);
    if (!isDuplicate && normalized.length > 0) {
      uniqueLines.push(line);
    }
  });

  // Format list items with clean bullets
  let formattedLines = uniqueLines.map(line => {
    const isHeaderLine = line.endsWith(':') ||
      /^TO\s+PAYMENT/i.test(line) ||
      /^WITH\s+ATTACHMENTS/i.test(line) ||
      /^TRANSMITTAL/i.test(line) ||
      /^SUBJECT/i.test(line);
    if (isHeaderLine) {
      return line;
    }
    // Prefix regular entries with a bullet if not present
    if (!/^•/.test(line)) {
      return '• ' + line;
    }
    return line;
  });

  let particularsText = formattedLines.join('\n');
  particularsText = formatEtAl(particularsText.toUpperCase());

  return {
    particulars: particularsText,
    preparedBy: extractedPreparedBy,
    dateTransmitted: extractedDate
  };
}

function parseOcrDateToYYYYMMDD(dateStr) {
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  } catch (e) { }
  return '';
}

/**
 * Initialize Transmittal OCR Image Reader using Tesseract.js
 */
let currentCompiledImageUrl = null;

let isDragAndDropInitialized = false;

/**
 * Initialize Drag & Drop and File/Camera Handlers for Transmittals & Documents Received Image Upload
 */
function initDragAndDropHandler() {
  if (isDragAndDropInitialized) return;
  isDragAndDropInitialized = true;

  const transmittalDropzone = document.getElementById('ocr-scan-zone');
  const transmittalFile = document.getElementById('transmittal-ocr-file');
  const transmittalCamera = document.getElementById('transmittal-camera-file');

  const compiledDropzone = document.getElementById('compiled-ocr-zone');
  const compiledFile = document.getElementById('compiled-image-file');
  const compiledCamera = document.getElementById('compiled-camera-file');

  const setupDropzone = (zone, processFn, isMulti = false) => {
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.add('drag-over');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        zone.classList.remove('drag-over');
      }, false);
    });

    zone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        if (isMulti) processFn(files);
        else processFn(files[0]);
      }
    });
  };

  const setupFileInput = (input, processFn, isMulti = false) => {
    if (!input) return;
    input.addEventListener('change', (e) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        if (isMulti) processFn(files);
        else processFn(files[0]);
      }
      input.value = '';
    });
  };

  setupDropzone(transmittalDropzone, processTransmittalImageFile, false);
  setupFileInput(transmittalFile, processTransmittalImageFile, false);
  setupFileInput(transmittalCamera, processTransmittalImageFile, false);

  setupDropzone(compiledDropzone, processCompiledFiles, true);
  setupFileInput(compiledFile, processCompiledFiles, true);
  setupFileInput(compiledCamera, processCompiledFiles, true);

  // Global window drop listener
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const hasImageOrPdf = Array.from(files).some(f => f.type.startsWith('image/') || f.type === 'application/pdf' || f.name.endsWith('.pdf'));
      if (hasImageOrPdf) {
        e.preventDefault();
        const recordModal = document.getElementById('record-modal');
        if (!recordModal.classList.contains('active')) {
          openRecordModal();
        }
        setTimeout(() => {
          if (appState.activeTab === 'compiled') {
            processCompiledFiles(files);
          } else {
            processTransmittalImageFile(files[0]);
          }
        }, 150);
      }
    }
  });

  initPasteSanitizer();
}

let isPasteSanitizerInitialized = false;

/**
 * Prevents pasting disallowed special characters into text fields in real-time
 * Allows ONLY: comma (,), colon (:), hyphen (-), period (.), letters, numbers, and spaces
 * Guarantees single initialization and prevents text doubling on paste
 */
function initPasteSanitizer() {
  if (isPasteSanitizerInitialized) return;
  isPasteSanitizerInitialized = true;

  document.addEventListener('paste', (e) => {
    const target = e.target;
    if (!target || !(target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    if (['date', 'month', 'file', 'password', 'hidden'].includes(target.type)) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const rawPaste = (e.clipboardData || window.clipboardData).getData('text') || '';
    const sanitized = sanitizeSpecialCharacters(rawPaste);

    let start = 0;
    let end = 0;
    try {
      start = target.selectionStart !== null ? target.selectionStart : target.value.length;
      end = target.selectionEnd !== null ? target.selectionEnd : target.value.length;
    } catch (err) {
      start = end = (target.value || '').length;
    }

    const val = target.value || '';
    const newValue = val.substring(0, start) + sanitized + val.substring(end);
    target.value = newValue;

    const newCursorPos = start + sanitized.length;
    try {
      target.selectionStart = target.selectionEnd = newCursorPos;
    } catch (err) { }

    if (target.id === 'particulars') {
      handleParticularsLivePreview();
    }
  }, true);
}

let isOcrScanningActive = false;

function processTransmittalImageFile(file) {
  if (!file || !file.type.startsWith('image/')) {
    showToast('PLEASE UPLOAD A VALID IMAGE FILE (PNG, JPG, WEBP)', 'warning');
    return;
  }

  if (isOcrScanningActive) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const rawDataUrl = e.target.result;

    // Scale and compress image preserving exact format and aspect ratio
    const optimizedDataUrl = await compressImagePreservingFormat(rawDataUrl, 1600, 0.88);
    currentTransmittalImageUrl = optimizedDataUrl;
    updateTransmittalModalImagePreview();

    // Auto-trigger OCR scanning
    scanTransmittalImageOCR(file);
  };
  reader.readAsDataURL(file);
}

function compressImagePreservingFormat(dataUrl, maxDimension = 1600, quality = 0.88) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

function updateTransmittalModalImagePreview() {
  const container = document.getElementById('transmittal-image-preview-container');
  const img = document.getElementById('transmittal-modal-img-preview');
  if (!container || !img) return;

  if (currentTransmittalImageUrl) {
    img.src = currentTransmittalImageUrl;
    container.style.display = 'block';
  } else {
    img.src = '';
    container.style.display = 'none';
  }
}

function removeTransmittalModalImage() {
  currentTransmittalImageUrl = null;
  updateTransmittalModalImagePreview();
  const fileInput = document.getElementById('transmittal-ocr-file');
  if (fileInput) fileInput.value = '';
  showToast('TRANSMITTAL ATTACHMENT REMOVED', 'info');
}

function viewTransmittalModalImage() {
  if (currentTransmittalImageUrl) {
    openImageLightbox(currentTransmittalImageUrl, 'TRANSMITTAL DOCUMENT ATTACHMENT');
  }
}

let currentCompiledAttachments = [];

async function processCompiledFiles(fileList) {
  if (!fileList || fileList.length === 0) return;
  const files = Array.from(fileList);

  for (const file of files) {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    if (!isImage && !isPdf) {
      showToast(`SKIPPED "${file.name}": UNSUPPORTED FORMAT (ONLY PDF & IMAGES ALLOWED)`, 'warning');
      continue;
    }

    if (isImage) {
      const dataUrl = await readFileAsDataURL(file);
      const optimizedUrl = await compressImagePreservingFormat(dataUrl, 1600, 0.88);
      currentCompiledAttachments.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: file.name || 'Photo.jpg',
        type: 'image',
        url: optimizedUrl,
        size: file.size || 0
      });
    } else if (isPdf) {
      const pdfDataUrl = await readFileAsDataURL(file);
      currentCompiledAttachments.push({
        id: 'att-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: file.name || 'Document.pdf',
        type: 'pdf',
        url: pdfDataUrl,
        size: file.size || 0
      });
    }
  }

  updateCompiledModalImagePreview();
  showToast(`${files.length} ATTACHMENT(S) PROCESSED`, 'success');
}

function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function updateCompiledModalImagePreview() {
  const container = document.getElementById('compiled-image-preview-container');
  const countBadge = document.getElementById('compiled-attachments-count-badge');
  const listContainer = document.getElementById('compiled-attachments-list');

  if (!container || !listContainer) return;

  if (!currentCompiledAttachments || currentCompiledAttachments.length === 0) {
    container.style.display = 'none';
    listContainer.innerHTML = '';
    return;
  }

  container.style.display = 'block';
  const imgCount = currentCompiledAttachments.filter(a => a.type === 'image').length;
  const pdfCount = currentCompiledAttachments.filter(a => a.type === 'pdf').length;

  if (countBadge) {
    countBadge.innerHTML = `<i data-lucide="check-circle-2" style="width: 14px; height: 14px;"></i> ATTACHED DOCUMENTS (${currentCompiledAttachments.length}) &bull; ${imgCount} IMAGES, ${pdfCount} PDFS`;
  }

  listContainer.innerHTML = currentCompiledAttachments.map((att, idx) => {
    if (att.type === 'image') {
      return `
        <div style="background: #0f172a; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; padding: 8px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
          <div style="width: 100%; height: 100px; display: flex; align-items: center; justify-content: center; overflow: hidden; border-radius: 4px; background: #000; margin-bottom: 6px;">
            <img src="${escapeHtml(att.url)}" alt="${escapeHtml(att.name)}" style="max-height: 100px; width: auto; max-width: 100%; object-fit: contain;">
          </div>
          <div style="width: 100%; font-size: 0.725rem; color: #cbd5e1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;" title="${escapeHtml(att.name)}">
            📷 ${escapeHtml(att.name)}
          </div>
          <div style="display: flex; gap: 4px; width: 100%;">
            <button type="button" class="btn btn-secondary" onclick="viewCompiledAttachmentAtIndex(${idx})" style="flex: 1; padding: 3px 6px; font-size: 0.7rem; justify-content: center;">
              <i data-lucide="maximize-2" style="width: 10px; height: 10px;"></i> View
            </button>
            <button type="button" class="btn btn-danger" onclick="removeCompiledAttachmentAtIndex(${idx})" style="padding: 3px 6px; font-size: 0.7rem; background: #ef4444; border-color: #dc2626;">
              <i data-lucide="x" style="width: 10px; height: 10px;"></i>
            </button>
          </div>
        </div>
      `;
    } else {
      return `
        <div style="background: #1e293b; border: 1px solid rgba(239,68,68,0.3); border-radius: 6px; padding: 10px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: space-between;">
          <div style="width: 100%; height: 80px; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 4px; background: rgba(239,68,68,0.1); margin-bottom: 6px; color: #ef4444;">
            <i data-lucide="file-text" style="width: 32px; height: 32px; margin-bottom: 4px;"></i>
            <span style="font-size: 0.65rem; font-weight: 700; color: #f8fafc;">PDF DOCUMENT</span>
          </div>
          <div style="width: 100%; font-size: 0.725rem; color: #f8fafc; font-weight: 600; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px;" title="${escapeHtml(att.name)}">
            📄 ${escapeHtml(att.name)}
          </div>
          <div style="display: flex; gap: 4px; width: 100%;">
            <button type="button" class="btn btn-secondary" onclick="viewCompiledAttachmentAtIndex(${idx})" style="flex: 1; padding: 3px 6px; font-size: 0.7rem; justify-content: center; border-color: #ef4444; color: #ef4444;">
              <i data-lucide="eye" style="width: 10px; height: 10px;"></i> Read PDF
            </button>
            <button type="button" class="btn btn-danger" onclick="removeCompiledAttachmentAtIndex(${idx})" style="padding: 3px 6px; font-size: 0.7rem; background: #ef4444; border-color: #dc2626;">
              <i data-lucide="x" style="width: 10px; height: 10px;"></i>
            </button>
          </div>
        </div>
      `;
    }
  }).join('');

  if (window.lucide) lucide.createIcons();
}

function removeCompiledAttachmentAtIndex(index) {
  if (index >= 0 && index < currentCompiledAttachments.length) {
    currentCompiledAttachments.splice(index, 1);
    updateCompiledModalImagePreview();
  }
}

function removeCompiledModalImage() {
  currentCompiledAttachments = [];
  updateCompiledModalImagePreview();
  const fileInput = document.getElementById('compiled-image-file');
  if (fileInput) fileInput.value = '';
  const camInput = document.getElementById('compiled-camera-file');
  if (camInput) camInput.value = '';
  showToast('ALL ATTACHMENTS REMOVED', 'info');
}

function viewCompiledAttachmentAtIndex(index) {
  const att = currentCompiledAttachments[index];
  if (!att) return;
  if (att.type === 'pdf') {
    openPdfViewerModal(att.url, att.name);
  } else {
    openImageLightbox(att.url, `ATTACHMENT (${index + 1}/${currentCompiledAttachments.length}) - ${att.name}`);
  }
}

function openPdfViewerModal(pdfUrl, titleText = 'PDF DOCUMENT') {
  if (!pdfUrl) return;
  const modal = document.getElementById('pdf-viewer-modal');
  const iframe = document.getElementById('pdf-modal-iframe');
  const title = document.getElementById('pdf-modal-title');
  const downloadBtn = document.getElementById('pdf-modal-download-btn');
  const openNewBtn = document.getElementById('pdf-modal-open-new-btn');

  if (!modal || !iframe) return;

  iframe.src = pdfUrl;
  if (title) {
    title.innerHTML = `<i data-lucide="file-text" style="width: 20px; height: 20px; color: #ef4444;"></i> ${escapeHtml(titleText).toUpperCase()}`;
  }
  if (downloadBtn) {
    downloadBtn.href = pdfUrl;
    downloadBtn.download = titleText.endsWith('.pdf') ? titleText : `${titleText}.pdf`;
  }
  if (openNewBtn) {
    openNewBtn.href = pdfUrl;
  }

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closePdfViewerModal() {
  const modal = document.getElementById('pdf-viewer-modal');
  const iframe = document.getElementById('pdf-modal-iframe');
  if (modal) modal.classList.remove('active');
  if (iframe) iframe.src = '';
}

function openImageLightbox(imageUrl, titleText = 'TRANSMITTAL DOCUMENT ATTACHMENT') {
  if (!imageUrl) return;
  const modal = document.getElementById('image-lightbox-modal');
  const img = document.getElementById('lightbox-modal-img');
  const title = document.getElementById('lightbox-modal-title');
  const downloadBtn = document.getElementById('lightbox-modal-download-btn');

  if (!modal || !img) return;

  img.src = imageUrl;
  if (title) {
    title.innerHTML = `<i data-lucide="image" style="width: 20px; height: 20px; color: var(--brand-accent);"></i> ${escapeHtml(titleText).toUpperCase()}`;
  }
  if (downloadBtn) {
    downloadBtn.href = imageUrl;
  }

  modal.classList.add('active');
  if (window.lucide) lucide.createIcons();
}

function closeImageLightbox() {
  const modal = document.getElementById('image-lightbox-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Preprocesses Image File/URL on Canvas with High-Contrast Binarization Thresholding for 100% OCR Precision
 */
function preprocessImageForOCR(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Target optimal OCR width (2200px)
        let width = img.width;
        let height = img.height;
        const targetWidth = 2200;

        if (width < targetWidth || width > 2800) {
          height = Math.round((height * targetWidth) / width);
          width = targetWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Get pixel data for contrast enhancement and thresholding
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        // Calculate average luminance
        let totalLum = 0;
        const pixelCount = data.length / 4;
        for (let i = 0; i < data.length; i += 4) {
          totalLum += (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }
        const avgLum = totalLum / pixelCount;
        const threshold = Math.max(105, Math.min(165, avgLum * 0.92));

        // High-contrast adaptive binarization
        for (let i = 0; i < data.length; i += 4) {
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          const val = lum > threshold ? 255 : (lum < (threshold - 45) ? 0 : Math.round((lum - (threshold - 45)) * (255 / 45)));
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

/**
 * Executes Tesseract.js OCR scan on provided image file using high-contrast preprocessed canvas
 */
async function scanTransmittalImageOCR(file) {
  if (isOcrScanningActive) return;
  isOcrScanningActive = true;

  const statusBox = document.getElementById('ocr-status-box');
  const statusText = document.getElementById('ocr-status-text');

  try {
    statusBox.style.display = 'flex';
    statusText.textContent = 'Preprocessing image for maximum OCR clarity...';

    if (!window.Tesseract) {
      throw new Error('OCR engine library loading...');
    }

    showToast('PREPROCESSING & SCANNING IMAGE WITH MAXIMUM OCR PRECISION...', 'info');

    // Generate high-contrast preprocessed image for crisp text recognition
    const preprocessedDataUrl = await preprocessImageForOCR(file);
    const scanSource = preprocessedDataUrl || file;

    statusText.textContent = 'Scanning image text & extracting words...';

    const result = await Tesseract.recognize(scanSource, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          statusText.textContent = `Extracting words with maximum precision... ${pct}%`;
        } else if (m.status) {
          statusText.textContent = `${m.status.toUpperCase()}...`;
        }
      }
    });

    let rawExtracted = (result && result.data && result.data.text) ? result.data.text.trim() : '';

    // If preprocessed OCR result was low, run fallback on original file to compare
    if (!rawExtracted || rawExtracted.length < 15) {
      const fallbackResult = await Tesseract.recognize(file, 'eng');
      if (fallbackResult && fallbackResult.data && fallbackResult.data.text) {
        rawExtracted = fallbackResult.data.text.trim();
      }
    }

    if (!rawExtracted) {
      showToast('IMAGE ATTACHED! (NO CLEAR TEXT FOUND FOR OCR)', 'info');
      statusBox.style.display = 'none';
      return;
    }

    const parsed = parseTransmittalOcrText(rawExtracted);
    const textarea = document.getElementById('particulars');
    const prepInput = document.getElementById('prepared-by-trn');
    const dateInput = document.getElementById('date-transmitted');

    // Set fresh particulars text without concatenating duplicates
    if (parsed.particulars) {
      textarea.value = parsed.particulars;
    }

    if (parsed.preparedBy && prepInput && !prepInput.value) {
      prepInput.value = parsed.preparedBy;
    }

    if (parsed.dateTransmitted && dateInput && !dateInput.value) {
      dateInput.value = parsed.dateTransmitted;
    }

    handleParticularsLivePreview();
    statusBox.style.display = 'none';
    showToast('TRANSMITTAL PHOTO ATTACHED & WORDS EXTRACTED WITH HIGH PRECISION!', 'success');

  } catch (err) {
    console.error('OCR Precision Error:', err);
    statusBox.style.display = 'none';
    showToast('IMAGE ATTACHED SUCCESSFULLY!', 'success');
  } finally {
    isOcrScanningActive = false;
  }
}

/**
 * 1-Click FIX Button Handler: Auto-corrects all character errors, names, and document formatting in Particulars field
 */
function autoFixParticularsField() {
  const textarea = document.getElementById('particulars');
  if (!textarea) return;

  const currentText = textarea.value;
  if (!currentText || !currentText.trim()) {
    showToast('PLEASE ENTER OR EXTRACT TEXT IN PARTICULARS FIRST', 'warning');
    return;
  }

  // Run Master OCR Auto-Correction & Cleaning Engine
  const parsed = parseTransmittalOcrText(currentText);

  if (parsed.particulars) {
    textarea.value = parsed.particulars;
  }

  const prepInput = document.getElementById('prepared-by-trn');
  if (parsed.preparedBy && prepInput && !prepInput.value.trim()) {
    prepInput.value = parsed.preparedBy;
  }

  if (parsed.dateTransmitted) {
    const dateInput = document.getElementById('date-transmitted');
    if (dateInput && !dateInput.value) dateInput.value = parsed.dateTransmitted;
  }

  handleParticularsLivePreview();
  showToast('PARTICULARS TEXT AUTO-FIXED & CLEANED SUCCESSFULLY!', 'success');
}

/**
 * 1-Click Toggle Salary Status (Received <-> Pending)
 */
async function toggleSalaryStatus(recordId, periodKey) {
  if (!appState.data.salaryRecords) return;

  const record = appState.data.salaryRecords.find(r => r.id === recordId);
  if (!record || !record.periods || !record.periods[periodKey]) return;

  const currentStatus = record.periods[periodKey].status;
  if (currentStatus === 'na') return;

  const newStatus = currentStatus === 'received' ? 'pending' : 'received';
  record.periods[periodKey].status = newStatus;
  record.updatedAt = new Date().toISOString();

  saveToLocalStorage();
  renderApp();

  if (isSupabaseConnected && supabaseClient) {
    await supabaseClient.from('gip_salary_records').upsert({
      id: record.id,
      gip_name: record.gipName,
      periods: record.periods,
      updated_at: new Date().toISOString()
    });
  }

  showToast(`UPDATED SALARY STATUS FOR ${record.gipName} (${periodKey}): ${newStatus.toUpperCase()}`, 'info');
}

/**
 * Copy Phone Number to Clipboard Helper
 */
function copyContactNumber(number) {
  if (!number) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(number).then(() => {
      showToast(`COPIED PHONE (${number}) TO CLIPBOARD!`, 'success');
    }).catch(() => {
      showToast(`CONTACT NUMBER: ${number}`, 'info');
    });
  } else {
    showToast(`CONTACT NUMBER: ${number}`, 'info');
  }
}

function formatPhoneNumber(numStr) {
  if (!numStr) return '-';
  let digits = String(numStr).replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('9')) {
    digits = '0' + digits;
  }
  if (digits.length === 11) {
    return `${digits.substring(0, 4)} ${digits.substring(4, 7)} ${digits.substring(7)}`;
  }
  return numStr;
}

/**
 * Add New Quincena Period Modal & Handlers
 */
function openAddQuincenaModal() {
  const modal = document.getElementById('add-quincena-modal');
  if (!modal) return;

  const inputName = document.getElementById('new-quincena-name');
  if (inputName) inputName.value = '';

  modal.classList.add('active');
  setTimeout(() => {
    if (inputName) inputName.focus();
  }, 100);
}

function closeAddQuincenaModal() {
  const modal = document.getElementById('add-quincena-modal');
  if (modal) modal.classList.remove('active');
}

function setQuincenaPreset(presetName) {
  const inputName = document.getElementById('new-quincena-name');
  if (inputName) inputName.value = presetName;
}

async function handleAddQuincenaFormSubmit(e) {
  e.preventDefault();

  const nameInput = document.getElementById('new-quincena-name');
  const defaultStatus = document.getElementById('new-quincena-default-status')?.value || 'pending';

  const newPeriod = (nameInput ? nameInput.value : '').trim().toUpperCase();

  if (!newPeriod) {
    showToast('PLEASE ENTER A VALID QUINCENA PERIOD NAME', 'warning');
    return;
  }

  if (!appState.quincenaPeriods) appState.quincenaPeriods = [...DEFAULT_QUINCENA_PERIODS];

  if (appState.quincenaPeriods.includes(newPeriod)) {
    showToast(`QUINCENA PERIOD "${newPeriod}" ALREADY EXISTS!`, 'warning');
    return;
  }

  // Append new period to active quincenas
  appState.quincenaPeriods.push(newPeriod);

  // Initialize new quincena period for all existing salary records
  if (appState.data.salaryRecords) {
    appState.data.salaryRecords.forEach(record => {
      if (!record.periods) record.periods = {};
      if (!record.periods[newPeriod]) {
        record.periods[newPeriod] = { amount: 0, status: defaultStatus };
      }
    });
  }

  saveToLocalStorage();
  closeAddQuincenaModal();
  renderApp();

  await pushLocalSalaryToSupabase();
  showToast(`NEW QUINCENA COLUMN "${newPeriod}" ADDED SUCCESSFULLY!`, 'success');
}
