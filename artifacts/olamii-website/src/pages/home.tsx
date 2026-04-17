import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel,
  FormMessage, FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  useSubmitApplication, ApplicationBodyGender, ApplicationBodyEducation,
  ApplicationBodyEmploymentStatus, ApplicationBodyProgramType,
} from "@workspace/api-client-react";
import {
  MapPin, Phone, Mail, Award, BookOpen, Briefcase, FileText,
  CheckCircle2, TrendingUp, Users, CheckSquare, LineChart, Target,
  Compass, ChevronRight, ChevronLeft, User, Home as HomeIcon,
  Briefcase as BriefcaseIcon, ShieldCheck, ChevronDown, BadgeCheck,
  ClipboardList, Search, Send, Star, Building2, Lock, Clock, Euro,
  ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   ELEGANT FEMININE LOGO — cosmetic / beauty brand style
═══════════════════════════════════════════════════════════════════ */
function OlaMiiLogo({ dark = false, size = "md" }: { dark?: boolean; size?: "sm" | "md" | "lg" }) {
  const mainColor = dark ? "#f5e8c4" : "#1a1208";
  const goldColor = "#c89a2a";
  const subColor  = dark ? "rgba(245,232,196,0.55)" : "rgba(26,18,8,0.5)";
  const titleSize = size === "lg" ? "text-[42px]" : size === "sm" ? "text-[26px]" : "text-[34px]";
  const subSize   = size === "sm" ? "text-[8px]" : "text-[9px]";
  const ornamentW = size === "lg" ? 56 : size === "sm" ? 36 : 46;

  return (
    <div className="flex flex-col items-center select-none leading-none" aria-label="Ola Mii Sp. z o.o.">
      {/* Top floral ornament */}
      <svg width={ornamentW} height={ornamentW * 0.32} viewBox="0 0 56 18" fill="none" className="mb-1 opacity-90">
        <line x1="2" y1="9" x2="20" y2="9" stroke={goldColor} strokeWidth="0.8" strokeLinecap="round"/>
        <line x1="36" y1="9" x2="54" y2="9" stroke={goldColor} strokeWidth="0.8" strokeLinecap="round"/>
        {/* Center diamond + dot */}
        <path d="M28 3 L31 9 L28 15 L25 9 Z" fill={goldColor}/>
        <circle cx="22" cy="9" r="1" fill={goldColor}/>
        <circle cx="34" cy="9" r="1" fill={goldColor}/>
      </svg>

      {/* Main wordmark */}
      <div className="flex items-baseline gap-[0.18em]">
        <span
          className={`font-elegant italic ${titleSize}`}
          style={{ color: mainColor, fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1 }}
        >
          Ola
        </span>
        <span
          className={`font-elegant italic ${titleSize}`}
          style={{ color: goldColor, fontWeight: 500, letterSpacing: "0.01em", lineHeight: 1 }}
        >
          Mii
        </span>
      </div>

      {/* Subtitle */}
      <span
        className={`${subSize} uppercase tracking-[0.42em] mt-1 font-medium`}
        style={{ color: subColor, fontFamily: "'Inter', sans-serif" }}
      >
        szkolenia · dofinansowania
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FORM SCHEMA
═══════════════════════════════════════════════════════════════════ */
const formSchema = z.object({
  firstName:        z.string().min(2, "Imię jest wymagane"),
  lastName:         z.string().min(2, "Nazwisko jest wymagane"),
  pesel:            z.string().regex(/^\d{11}$/, "PESEL musi składać się z 11 cyfr"),
  birthDate:        z.string().min(1, "Data urodzenia jest wymagana"),
  gender:           z.nativeEnum(ApplicationBodyGender),
  education:        z.nativeEnum(ApplicationBodyEducation),
  email:            z.string().email("Niepoprawny adres e-mail"),
  phone:            z.string().min(9, "Numer telefonu jest wymagany"),
  street:           z.string().min(2, "Ulica i numer są wymagane"),
  city:             z.string().min(2, "Miasto jest wymagane"),
  postalCode:       z.string().min(5, "Kod pocztowy jest wymagany"),
  voivodeship:      z.string().min(2, "Województwo jest wymagane"),
  employmentStatus: z.nativeEnum(ApplicationBodyEmploymentStatus),
  employer:         z.string().optional(),
  programType:      z.nativeEnum(ApplicationBodyProgramType),
  courseDescription:z.string().optional(),
  fundingAmount:    z.coerce.number().optional(),
  nip:              z.string().optional(),
  disabilityStatus: z.boolean().default(false),
  consent:          z.boolean().refine(v => v === true, { message: "Zgoda na przetwarzanie danych jest wymagana" }),
  consentMarketing: z.boolean().default(false),
});
type FormValues = z.infer<typeof formSchema>;

const STEP_FIELDS: (keyof FormValues)[][] = [
  ["firstName", "lastName", "pesel", "birthDate", "gender"],
  ["education", "email", "phone"],
  ["street", "postalCode", "city", "voivodeship"],
  ["employmentStatus", "programType"],
  ["consent"],
];

const STEPS = [
  { label: "Dane osobowe", icon: User },
  { label: "Kontakt",      icon: Mail },
  { label: "Adres",        icon: HomeIcon },
  { label: "Zatrudnienie", icon: BriefcaseIcon },
  { label: "Zgody",        icon: ShieldCheck },
];

/* ═══════════════════════════════════════════════════════════════════
   FAQ DATA
═══════════════════════════════════════════════════════════════════ */
const FAQ_ITEMS = [
  {
    q: "Czy usługa doradztwa jest płatna?",
    a: "Nie. Wstępna analiza Twojej sytuacji oraz konsultacja dotycząca możliwości pozyskania dofinansowania jest całkowicie bezpłatna i niezobowiązująca. Płacisz dopiero wtedy, gdy decydujesz się na pełną obsługę.",
  },
  {
    q: "Czy to jest legalne? Skąd pochodzi dofinansowanie?",
    a: "Tak, działamy w ramach oficjalnych programów Unii Europejskiej i funduszy krajowych (m.in. Polska Agencja Rozwoju Przedsiębiorczości, Fundusze Europejskie dla Rozwoju Społecznego). Dofinansowania przyznawane są przez akredytowane instytucje pośredniczące. Działamy legalnie na terenie całej Polski.",
  },
  {
    q: "Kto może ubiegać się o dofinansowanie?",
    a: "O wsparcie mogą ubiegać się osoby pracujące, bezrobotne, samozatrudnione oraz przedsiębiorcy. Warunki kwalifikowalności zależą od konkretnego naboru — dlatego właśnie oferujemy bezpłatną analizę, żeby sprawdzić Twoje szanse jeszcze przed złożeniem wniosku.",
  },
  {
    q: "Jak długo trwa proces uzyskania dofinansowania?",
    a: "Od złożenia wniosku do decyzji mija zwykle od 4 do 10 tygodni, w zależności od programu i instytucji finansującej. OLA MII prowadzi Cię przez cały ten czas — informujemy o każdym etapie i odpowiadamy na pytania instytucji.",
  },
  {
    q: "Co, jeśli wniosek zostanie odrzucony?",
    a: "Dokładamy wszelkich starań, żeby wniosek był kompletny i dobrze uzasadniony. W przypadku odmowy analizujemy przyczynę i — jeśli jest to możliwe — składamy odwołanie lub szukamy alternatywnego programu. Informujemy Cię na bieżąco.",
  },
  {
    q: "Czy muszę samodzielnie wypełniać dokumenty?",
    a: "Nie. Przygotowujemy całą dokumentację za Ciebie — wypełniamy formularze, zbieramy zaświadczenia i pilnujemy terminów. Twoja rola ogranicza się do dostarczenia niezbędnych danych i podpisów.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  const [isSuccess, setIsSuccess]       = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const submitApplication               = useSubmitApplication();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "", lastName: "", pesel: "", birthDate: "",
      gender: "kobieta" as ApplicationBodyGender,
      education: "srednie" as ApplicationBodyEducation,
      email: "", phone: "", street: "", city: "", postalCode: "", voivodeship: "",
      employmentStatus: "pracujacy" as ApplicationBodyEmploymentStatus,
      employer: "",
      programType: "rozwijanie_kompetencji" as ApplicationBodyProgramType,
      courseDescription: "", fundingAmount: undefined, nip: "",
      disabilityStatus: false, consent: false, consentMarketing: false,
    },
  });

  const watchEmployment = form.watch("employmentStatus");
  const totalSteps = STEPS.length;

  const handleNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[currentStep] as (keyof FormValues)[]);
    if (valid) setCurrentStep(s => Math.min(s + 1, totalSteps - 1));
  };
  const handleBack = () => setCurrentStep(s => Math.max(s - 1, 0));
  const onSubmit = (values: FormValues) => {
    submitApplication.mutate({ data: values }, { onSuccess: () => setIsSuccess(true) });
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 overflow-x-hidden">

      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/60 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <OlaMiiLogo size="sm" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#o-mnie"   className="hover:text-primary transition-colors">O mnie</a>
            <a href="#uslugi"   className="hover:text-primary transition-colors">Usługi</a>
            <a href="#jak-dzialamy" className="hover:text-primary transition-colors">Jak działamy</a>
            <a href="#programy" className="hover:text-primary transition-colors">Programy</a>
            <a href="#faq"      className="hover:text-primary transition-colors">FAQ</a>
            <a href="#kontakt"  className="hover:text-primary transition-colors">Kontakt</a>
          </nav>
          <a href="#wniosek">
            <Button className="btn-glow font-semibold tracking-wide px-6 rounded-xl">
              Złóż wniosek
            </Button>
          </a>
        </div>
      </header>

      {/* ══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 px-4 relative overflow-hidden bg-gradient-to-b from-[#faf8f3] to-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-100/40 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-7 max-w-2xl">
            {/* Legitimacy badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-semibold text-foreground">
              <Euro className="w-4 h-4 text-primary" />
              Oficjalne programy dofinansowań UE
            </div>

            <h1 className="text-5xl lg:text-[62px] font-bold leading-[1.08] tracking-tight text-foreground">
              Dofinansowanie unijne<br/>
              na <span className="text-primary italic font-serif">szkolenie</span><br/>
              Twojej kariery.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Pomagamy pozyskać środki z Unii Europejskiej na kursy, szkolenia i bilans kompetencji. Bezpłatna analiza Twojej sytuacji, indywidualne dopasowanie programu i kompleksowa obsługa wniosku — od pierwszej rozmowy do wypłaty środków.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <a href="#wniosek" className="w-full sm:w-auto">
                <Button size="lg" className="btn-glow w-full text-base px-8 h-14 rounded-xl font-semibold">
                  Złóż bezpłatny wniosek
                </Button>
              </a>
              <a href="#jak-dzialamy" className="w-full sm:w-auto">
                <Button size="lg" className="btn-glow-light w-full text-base px-8 h-14 rounded-xl font-semibold">
                  Jak to działa?
                </Button>
              </a>
            </div>

            {/* Mini trust signals */}
            <div className="pt-6 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { icon: BadgeCheck, text: "Indywidualne podejście" },
                { icon: Lock, text: "Ochrona RODO" },
                { icon: Clock, text: "Bezpłatna analiza" },
                { icon: CheckCircle2, text: "Legalne programy UE" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/40 lg:h-[580px]">
              <img
                src="/hero.png"
                alt="Sandra Baleja — doradca zawodowy OLA MII"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* Floating card: Free analysis */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-background border border-border/80 p-5 rounded-xl shadow-xl max-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Bezpłatna analiza</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Sprawdzimy Twoją sytuację i wskażemy odpowiedni program dofinansowania — <strong className="text-foreground">bez opłat i zobowiązań</strong>.
              </p>
            </div>

            {/* Floating card: Funding */}
            <div className="absolute top-6 -right-4 z-20 bg-background border border-border/80 p-4 rounded-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Dofinansowanie do</p>
                  <p className="text-xl font-bold text-foreground">100% wartości</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══════════════════════════════════════════════════════ */}
      <section id="o-mnie" className="py-24 bg-[#f7f5ef]/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-border/40">
                <img src="/career.png" alt="Doradztwo zawodowe OLA MII" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
              {/* Credentials badge */}
              <div className="absolute -bottom-8 right-4 bg-background border border-border/70 rounded-xl p-4 shadow-lg max-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold">Certyfikowany doradca</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Uprawnienia do prowadzenia doradztwa zawodowego i pośrednictwa w pozyskiwaniu funduszy UE.</p>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-7 pt-8 lg:pt-0">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                O założycielce
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">
                Pasja, która<br/>otwiera <span className="italic text-primary">możliwości</span>.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Jestem <strong className="text-foreground">Sandra Baleja</strong>, założycielka Ola Mii. Specjalizuję się w pozyskiwaniu unijnych dofinansowań na szkolenia i kursy zawodowe dla osób pracujących, bezrobotnych oraz przedsiębiorców. Wierzę, że odpowiednie wsparcie potrafi całkowicie zmienić czyjąś ścieżkę zawodową.
              </p>
              <p className="text-base text-muted-foreground leading-relaxed">
                Stawiam na pełną transparentność i indywidualne podejście — wstępna analiza Twojej sytuacji jest zawsze bezpłatna i niezobowiązująca. Nie pobieramy żadnych zaliczek przed uzyskaniem decyzji.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { icon: Target, title: "Indywidualne podejście", desc: "Analizujemy Twoją sytuację i dobieramy optymalny program — bez składania obietnic bez pokrycia." },
                  { icon: Compass, title: "Pełna przejrzystość", desc: "Wyjaśniamy każdy krok. Wiesz dokładnie, co robimy, z jakich środków pochodzi dofinansowanie i kiedy dostaniesz decyzję." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">{title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SERVICES ═══════════════════════════════════════════════════ */}
      <section id="uslugi" className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-14 space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Co robimy
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Nasze usługi</h2>
            <p className="text-muted-foreground text-lg">Kompleksowa obsługa — od pierwszej konsultacji do rozliczenia projektu.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Briefcase,  n: "01", title: "Doradztwo Zawodowe",    desc: "Analiza predyspozycji i planowanie ścieżki kariery. Pomagamy określić cele i silne strony, które przekujesz w konkretne kroki na rynku pracy." },
              { icon: LineChart,  n: "02", title: "Bilans Kompetencji",    desc: "Diagnoza umiejętności, wiedzy i potencjału. Niezbędny krok przed wyborem szkolenia — gwarantuje, że inwestycja przyniesie realne efekty." },
              { icon: BookOpen,   n: "03", title: "Szkolenia Zawodowe",    desc: "Dobór kursów z Bazy Usług Rozwojowych. Współpracujemy z akredytowanymi podmiotami, które spełniają wymogi programów unijnych." },
              { icon: FileText,   n: "04", title: "Pozyskanie Środków UE", desc: "Kompletujemy dokumenty, składamy wnioski i pilnujemy terminów. Obsługujemy proces aż do momentu wypłaty środków lub rozliczenia." },
            ].map(({ icon: Icon, n, title, desc }) => (
              <div key={n} className="bg-card border border-border/60 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-3xl font-black text-border/60">{n}</span>
                </div>
                <h3 className="text-lg font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW WE WORK — equal elegant cards with golden timeline ═════ */}
      <section id="jak-dzialamy" className="py-24 relative overflow-hidden bg-gradient-to-b from-background via-[#fbf6e8]/40 to-background">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center mb-16 space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-[0.2em] border border-primary/20">
              Proces współpracy
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Jak <span className="italic text-primary">działamy</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Cztery przejrzyste etapy. Żadnych ukrytych opłat, żadnych obietnic bez pokrycia.
            </p>
          </div>

          {/* Decorative connecting line on desktop */}
          <div className="relative">
            <div className="hidden lg:block absolute top-[68px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {[
                { icon: ClipboardList, step: "01", title: "Bezpłatna analiza",       desc: "Wypełniasz formularz lub dzwonisz do nas. Analizujemy Twoją sytuację — bez opłat i bez zobowiązań." },
                { icon: Search,        step: "02", title: "Dobór programu",           desc: "Wskazujemy konkretny program dofinansowania, który najlepiej pasuje do Twojego profilu zawodowego." },
                { icon: Send,          step: "03", title: "Złożenie wniosku",         desc: "Przygotowujemy kompletną dokumentację i składamy wniosek do właściwej instytucji. Ty tylko podpisujesz." },
                { icon: CheckCircle2,  step: "04", title: "Realizacja kursu",         desc: "Realizujesz wybrane szkolenie, my dopinamy formalności i rozliczamy projekt z instytucją finansującą." },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div
                  key={step}
                  className="group relative bg-card border border-border/60 rounded-2xl p-7 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_50px_-15px_rgba(212,160,23,0.3)] transition-all duration-300 flex flex-col"
                >
                  {/* Numbered circle on top */}
                  <div className="relative w-[60px] h-[60px] mx-auto -mt-12 mb-5">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f0c040] to-[#b8860d] shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow" />
                    <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="absolute -top-1 -right-1 bg-foreground text-primary text-[10px] font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-background">
                      {step}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-center mb-3 text-foreground">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-center flex-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guarantee */}
          <div className="mt-14 max-w-3xl mx-auto bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#f0c040] to-[#b8860d] flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed">
              <strong className="text-foreground font-bold">Gwarancja przejrzystości:</strong> Nie pobieramy żadnych zaliczek ani ukrytych opłat przed uzyskaniem decyzji. Wszystkie warunki współpracy są jasno określone w umowie zawartej przed rozpoczęciem procesu.
            </p>
          </div>
        </div>
      </section>

      {/* ══ PROGRAMS ═══════════════════════════════════════════════════ */}
      <section id="programy" className="py-24 bg-[#f7f5ef]/60">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                Dostępne programy
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                Oficjalne programy<br/>dofinansowań UE
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Pomagamy wnioskować w ramach oficjalnych naborów finansowanych ze środków europejskich — m.in. Funduszy Europejskich dla Rozwoju Społecznego oraz programów regionalnych.
              </p>
              <div className="space-y-4">
                {[
                  { n: "01", title: "Bilans kompetencji z doradztwem",   desc: "Kompleksowa diagnoza predyspozycji i planowanie dalszej ścieżki — dla osób chcących zmienić lub rozwinąć swoją karierę." },
                  { n: "02", title: "Wsparcie doradcy zawodowego",        desc: "Profesjonalna pomoc w przygotowaniu CV, rozmowach kwalifikacyjnych i wejściu lub powrocie na rynek pracy." },
                  { n: "03", title: "Bony szkoleniowe na kursy zawodowe", desc: "Dofinansowanie do 100% kosztów wybranego kursu lub szkolenia z Bazy Usług Rozwojowych PARP." },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4 p-5 rounded-xl border border-border/60 bg-background hover:border-primary/30 hover:shadow-sm transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-sm">{n}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1">{title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border/40">
                <img src="/funding.png" alt="Dokumenty dofinansowania" className="w-full h-full object-cover" />
              </div>
              <div className="bg-background border border-border/60 rounded-xl p-5">
                <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Dla kogo?
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {["Osoby pracujące", "Osoby bezrobotne", "Przedsiębiorcy", "Samozatrudnieni", "Osoby niepełnosprawne", "Powracający na rynek"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" /> {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ BANNER ═════════════════════════════════════════════════════ */}
      <section className="relative h-[38vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/training.png" alt="Szkolenie zawodowe" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/70" />
        </div>
        <div className="relative z-10 text-center px-4 space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white">Zainwestuj w swoją przyszłość już dziś</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto">Fundusze europejskie są dostępne — my pomagamy po nie skutecznie sięgnąć.</p>
          <a href="#wniosek">
            <Button size="lg" className="btn-glow mt-4 px-8 h-14 rounded-xl font-semibold">Złóż bezpłatny wniosek</Button>
          </a>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-14 space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Często zadawane pytania
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Masz wątpliwości?</h2>
            <p className="text-muted-foreground text-lg">Odpowiadamy wprost na najczęstsze pytania dotyczące wiarygodności, legalności i procesu.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className={`border rounded-xl overflow-hidden transition-all ${openFaq === i ? "border-primary/40 shadow-sm" : "border-border/60"}`}>
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className={`font-semibold text-base leading-snug ${openFaq === i ? "text-primary" : "text-foreground"}`}>
                    {item.q}
                  </span>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180 text-primary" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed border-t border-border/40 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-[#f7f5ef]/80 border border-border/50 rounded-xl text-center space-y-3">
            <p className="font-semibold text-foreground">Nie znalazłeś odpowiedzi na swoje pytanie?</p>
            <p className="text-sm text-muted-foreground">Zadzwoń lub napisz — odpowiemy w ciągu jednego dnia roboczego.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <a href="tel:+48500592850">
                <Button variant="outline" className="flex items-center gap-2 rounded-xl">
                  <Phone className="w-4 h-4" /> +48 500 592 850
                </Button>
              </a>
              <a href="mailto:balejasandra@gmail.com">
                <Button variant="outline" className="flex items-center gap-2 rounded-xl">
                  <Mail className="w-4 h-4" /> balejasandra@gmail.com
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FORM ═══════════════════════════════════════════════════════ */}
      <section id="wniosek" className="py-24 bg-[#f7f5ef]/60">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              Formularz zgłoszeniowy
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Złóż bezpłatny wniosek</h2>
            <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
              Wypełnij poniższy formularz. Wstępna analiza jest całkowicie bezpłatna — skontaktujemy się z Tobą w ciągu 2 dni roboczych z oceną Twoich możliwości.
            </p>
          </div>

          <div className="bg-card border border-border/70 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-yellow-500 to-primary/50" />

            {isSuccess ? (
              <div className="p-10 text-center space-y-6 py-20">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Wniosek przyjęty pomyślnie!</h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  Dziękujemy. Nasz doradca przeanalizuje Twoje dane i skontaktuje się z Tobą w ciągu 2 dni roboczych.
                </p>
                <Button variant="outline" className="rounded-xl" onClick={() => { setIsSuccess(false); setCurrentStep(0); form.reset(); }}>
                  Wyślij kolejne zgłoszenie
                </Button>
              </div>
            ) : (
              <>
                {/* Step header */}
                <div className="px-7 pt-8 pb-5">
                  {/* Progress */}
                  <div className="relative mb-7">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50" />
                    <div className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500" style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }} />
                    <div className="relative flex justify-between">
                      {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const done   = i < currentStep;
                        const active = i === currentStep;
                        return (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-300 ${done ? "bg-primary border-primary text-white" : active ? "bg-background border-primary text-primary shadow-md shadow-primary/20" : "bg-background border-border text-muted-foreground"}`}>
                              {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-primary" : done ? "text-primary/60" : "text-muted-foreground"}`}>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{STEPS[currentStep].label}</h3>
                    <span className="text-xs text-muted-foreground font-medium">Krok {currentStep + 1} z {totalSteps}</span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="px-7 pb-6 space-y-5">

                      {/* Step 1 */}
                      {currentStep === 0 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                              <FormItem><FormLabel>Imię <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="np. Anna" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                              <FormItem><FormLabel>Nazwisko <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="np. Kowalska" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="pesel" render={({ field }) => (
                            <FormItem><FormLabel>PESEL <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="11 cyfr" maxLength={11} {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="birthDate" render={({ field }) => (
                              <FormItem><FormLabel>Data urodzenia <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                              <FormItem><FormLabel>Płeć <span className="text-primary">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
                                  <SelectContent>
                                    <SelectItem value="kobieta">Kobieta</SelectItem>
                                    <SelectItem value="mezczyzna">Mężczyzna</SelectItem>
                                    <SelectItem value="inne">Inne</SelectItem>
                                  </SelectContent>
                                </Select><FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      )}

                      {/* Step 2 */}
                      {currentStep === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                          <FormField control={form.control} name="education" render={({ field }) => (
                            <FormItem><FormLabel>Wykształcenie <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Wybierz wykształcenie" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="podstawowe">Podstawowe</SelectItem>
                                  <SelectItem value="gimnazjalne">Gimnazjalne</SelectItem>
                                  <SelectItem value="zasadnicze_zawodowe">Zasadnicze zawodowe</SelectItem>
                                  <SelectItem value="srednie">Średnie</SelectItem>
                                  <SelectItem value="wyzsze_licencjat">Wyższe — Licencjat</SelectItem>
                                  <SelectItem value="wyzsze_magister">Wyższe — Magister</SelectItem>
                                  <SelectItem value="doktorat">Doktorat</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem><FormLabel>E-mail <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" type="email" placeholder="adres@email.pl" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                              <FormItem><FormLabel>Telefon <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="+48 000 000 000" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                        </div>
                      )}

                      {/* Step 3 */}
                      {currentStep === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                          <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem><FormLabel>Ulica i numer <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="ul. Przykładowa 1/2" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="grid sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                              <FormItem><FormLabel>Kod pocztowy <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="00-000" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                              <FormItem><FormLabel>Miasto <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="np. Łódź" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="voivodeship" render={({ field }) => (
                            <FormItem><FormLabel>Województwo <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Wybierz województwo" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {["Dolnośląskie","Kujawsko-pomorskie","Lubelskie","Lubuskie","Łódzkie","Małopolskie","Mazowieckie","Opolskie","Podkarpackie","Podlaskie","Pomorskie","Śląskie","Świętokrzyskie","Warmińsko-mazurskie","Wielkopolskie","Zachodniopomorskie"].map(w => (
                                    <SelectItem key={w} value={w.toLowerCase()}>{w}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* Step 4 */}
                      {currentStep === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-250">
                          <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                            <FormItem><FormLabel>Status zatrudnienia <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Wybierz status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="pracujacy">Pracujący/a</SelectItem>
                                  <SelectItem value="bezrobotny">Bezrobotny/a</SelectItem>
                                  <SelectItem value="nieaktywny">Nieaktywny/a zawodowo</SelectItem>
                                  <SelectItem value="samozatrudniony">Samozatrudniony/a</SelectItem>
                                  <SelectItem value="uczen_student">Uczeń / Student</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          {(watchEmployment === "pracujacy" || watchEmployment === "samozatrudniony") && (
                            <div className="grid sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                              <FormField control={form.control} name="employer" render={({ field }) => (
                                <FormItem><FormLabel>Pracodawca / firma</FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="Nazwa firmy" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="nip" render={({ field }) => (
                                <FormItem><FormLabel>NIP pracodawcy (opcjonalnie)</FormLabel><FormControl><Input className="h-11 rounded-lg" placeholder="0000000000" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                            </div>
                          )}
                          <FormField control={form.control} name="programType" render={({ field }) => (
                            <FormItem><FormLabel>Rodzaj wsparcia <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-11 rounded-lg"><SelectValue placeholder="Wybierz rodzaj wsparcia" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="nabycie_kwalifikacji">Nabycie kwalifikacji zawodowych</SelectItem>
                                  <SelectItem value="rozwijanie_kompetencji">Rozwijanie obecnych kompetencji</SelectItem>
                                  <SelectItem value="bilans_kompetencji">Bilans kompetencji</SelectItem>
                                  <SelectItem value="doradztwo_zawodowe">Doradztwo zawodowe</SelectItem>
                                  <SelectItem value="inne">Inne / nie wiem jeszcze</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="courseDescription" render={({ field }) => (
                            <FormItem><FormLabel>Opis planowanego kursu (opcjonalnie)</FormLabel>
                              <FormControl><Textarea placeholder="Np. kurs obsługi programów księgowych, kurs językowy angielski..." className="min-h-[90px] rounded-lg resize-y" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="fundingAmount" render={({ field }) => (
                            <FormItem><FormLabel>Szacowana kwota kursu (opcjonalnie)</FormLabel>
                              <div className="relative">
                                <FormControl><Input className="h-11 rounded-lg pr-14" type="number" placeholder="np. 3000" {...field} /></FormControl>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">PLN</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* Step 5 */}
                      {currentStep === 4 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-250">
                          <FormField control={form.control} name="disabilityStatus" render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border border-border/60 bg-background/50 p-4">
                              <div className="pr-4">
                                <FormLabel className="text-sm font-semibold">Orzeczenie o niepełnosprawności</FormLabel>
                                <FormDescription className="text-xs mt-0.5">Niektóre programy przyznają pierwszeństwo osobom z orzeczeniem.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                              </FormControl>
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="consent" render={({ field }) => (
                            <FormItem className="flex items-start gap-3 p-4 rounded-xl border border-primary/25 bg-primary/5">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                              </FormControl>
                              <div>
                                <FormLabel className="text-sm leading-relaxed font-normal cursor-pointer">
                                  Wyrażam zgodę na przetwarzanie moich danych osobowych przez Ola Mii Sp. z o.o. w celu obsługi mojego zgłoszenia dotyczącego dofinansowania. Zgoda wymagana. <span className="text-primary font-bold">*</span>
                                </FormLabel>
                                <FormMessage className="mt-1" />
                              </div>
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="consentMarketing" render={({ field }) => (
                            <FormItem className="flex items-start gap-3 p-4 rounded-xl border border-border/50">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <FormLabel className="text-sm font-normal text-muted-foreground leading-relaxed cursor-pointer">
                                Wyrażam zgodę na przesyłanie przez OLA MII Sp. z o.o. informacji o nowych programach dofinansowań, kursach i ofertach. Zgoda opcjonalna, można ją wycofać w dowolnym momencie.
                              </FormLabel>
                            </FormItem>
                          )} />

                          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-border/20 rounded-lg p-3">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                            Twoje dane są chronione zgodnie z Rozporządzeniem RODO. Administratorem danych jest OLA MII Sp. z o.o., ul. Plantowa 17/24, 91-104 Łódź. Dane nie będą przekazywane podmiotom trzecim w celach marketingowych.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation */}
                    <div className="px-7 pb-8 pt-4 flex items-center justify-between border-t border-border/40">
                      <Button type="button" variant="ghost" className="text-muted-foreground flex items-center gap-1.5" onClick={handleBack} disabled={currentStep === 0}>
                        <ChevronLeft className="w-4 h-4" /> Wróć
                      </Button>
                      {currentStep < totalSteps - 1 ? (
                        <Button type="button" size="lg" className="px-8 rounded-xl font-semibold" onClick={handleNext}>
                          Dalej <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      ) : (
                        <Button type="submit" size="lg" className="px-8 rounded-xl font-semibold shadow-md shadow-primary/20" disabled={submitApplication.isPending}>
                          {submitApplication.isPending
                            ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Wysyłanie...</>
                            : <>Wyślij wniosek <ChevronRight className="w-4 h-4 ml-1" /></>}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-5 max-w-lg mx-auto leading-relaxed">
            Przesyłając wniosek akceptujesz Politykę Prywatności. Analiza wstępna jest bezpłatna. Nie pobieramy zaliczek przed wydaniem decyzji.
          </p>
        </div>
      </section>

      {/* ══ FOOTER ═════════════════════════════════════════════════════ */}
      <footer className="bg-foreground text-background pt-20 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
            <div className="lg:col-span-4 space-y-5">
              <OlaMiiLogo dark size="md" />
              <p className="text-background/60 text-sm leading-relaxed max-w-xs">
                Zarejestrowana polska firma doradcza specjalizująca się w pozyskiwaniu unijnych dofinansowań na szkolenia i rozwój zawodowy.
              </p>
              <div className="text-xs text-background/40 space-y-1">
                <p>NIP: 9472011783</p>
                <p>KRS: 0001065517</p>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-5">
              <h4 className="font-bold text-primary text-xs uppercase tracking-widest">Kontakt</h4>
              <div className="space-y-3 text-sm text-background/70">
                <div className="flex items-start gap-2.5"><MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" /><span>ul. Plantowa 17/24<br/>91-104 Łódź</span></div>
                <div className="flex items-center gap-2.5"><Phone className="w-4 h-4 text-primary flex-shrink-0" /><a href="tel:+48500592850" className="hover:text-primary transition-colors">+48 500 592 850</a></div>
                <div className="flex items-center gap-2.5"><Mail className="w-4 h-4 text-primary flex-shrink-0" /><a href="mailto:balejasandra@gmail.com" className="hover:text-primary transition-colors">balejasandra@gmail.com</a></div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-5">
              <h4 className="font-bold text-primary text-xs uppercase tracking-widest">Usługi</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {["Doradztwo Zawodowe","Bilans Kompetencji","Szkolenia Zawodowe","Pozyskanie Dofinansowań","Wnioski Unijne"].map(s => (
                  <li key={s} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-primary inline-block" />{s}</li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-5">
              <h4 className="font-bold text-primary text-xs uppercase tracking-widest">Przydatne linki</h4>
              <ul className="space-y-2 text-sm text-background/70">
                {[
                  { label: "Baza Usług Rozwojowych", href: "https://uslugirozwojowe.parp.gov.pl" },
                  { label: "Rejestr KRS", href: "https://ekrs.ms.gov.pl" },
                  { label: "Fundusze Europejskie", href: "https://www.funduszeeuropejskie.gov.pl" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <ExternalLink className="w-3 h-3" />{label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-background/35 gap-3">
            <p>&copy; {new Date().getFullYear()} OLA MII Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
            <p>Strona ma charakter informacyjny. Szczegółowe warunki określone są w indywidualnych umowach.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
