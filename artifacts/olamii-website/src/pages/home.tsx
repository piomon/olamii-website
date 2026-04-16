import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useSubmitApplication, ApplicationBodyGender, ApplicationBodyEducation, ApplicationBodyEmploymentStatus, ApplicationBodyProgramType } from "@workspace/api-client-react";
import { MapPin, Phone, Mail, Award, BookOpen, Briefcase, FileText, CheckCircle2, TrendingUp, Users, CheckSquare, LineChart, Target, Compass, ChevronRight, ChevronLeft, User, Home as HomeIcon, Briefcase as BriefcaseIcon, Star, ShieldCheck } from "lucide-react";

/* ─── LOGO COMPONENT ─────────────────────────────────────────────────────── */
function OlaMiiLogo({ dark = false }: { dark?: boolean }) {
  const textColor = dark ? "#fff" : "#1a1208";
  const subColor = dark ? "rgba(255,255,255,0.55)" : "rgba(26,18,8,0.5)";
  return (
    <div className="flex items-center gap-3 select-none">
      {/* SVG Emblem */}
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="OLA MII logo">
        <defs>
          <radialGradient id="logoGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5c842" />
            <stop offset="100%" stopColor="#b8860b" />
          </radialGradient>
          <radialGradient id="centerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff9e6" />
            <stop offset="100%" stopColor="#f5c842" />
          </radialGradient>
        </defs>
        {/* Outer petals — 8 lotus petals */}
        {[0,45,90,135,180,225,270,315].map((angle, i) => (
          <ellipse
            key={i}
            cx={22 + Math.cos((angle - 90) * Math.PI / 180) * 11}
            cy={22 + Math.sin((angle - 90) * Math.PI / 180) * 11}
            rx="5.5"
            ry="9"
            transform={`rotate(${angle}, ${22 + Math.cos((angle - 90) * Math.PI / 180) * 11}, ${22 + Math.sin((angle - 90) * Math.PI / 180) * 11})`}
            fill="url(#logoGrad)"
            opacity={i % 2 === 0 ? "0.95" : "0.65"}
          />
        ))}
        {/* Inner ring */}
        <circle cx="22" cy="22" r="9" fill="white" />
        <circle cx="22" cy="22" r="8" fill="url(#centerGrad)" />
        {/* Center star/growth symbol */}
        <path
          d="M22 15.5 L23.2 20.2 L28 22 L23.2 23.8 L22 28.5 L20.8 23.8 L16 22 L20.8 20.2 Z"
          fill="url(#logoGrad)"
        />
      </svg>
      {/* Wordmark */}
      <div className="flex flex-col leading-none">
        <span
          className="font-bold tracking-[0.18em] text-[17px]"
          style={{ color: textColor, fontFamily: "'Georgia', serif", letterSpacing: "0.18em" }}
        >
          OLA MII
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.25em] font-medium mt-0.5"
          style={{ color: subColor }}
        >
          Sp. z o.o.
        </span>
      </div>
    </div>
  );
}

/* ─── FORM SCHEMA ─────────────────────────────────────────────────────────── */
const formSchema = z.object({
  firstName: z.string().min(2, "Imię jest wymagane"),
  lastName: z.string().min(2, "Nazwisko jest wymagane"),
  pesel: z.string().regex(/^\d{11}$/, "PESEL musi składać się z 11 cyfr"),
  birthDate: z.string().min(1, "Data urodzenia jest wymagana"),
  gender: z.nativeEnum(ApplicationBodyGender),
  education: z.nativeEnum(ApplicationBodyEducation),
  email: z.string().email("Niepoprawny adres e-mail"),
  phone: z.string().min(9, "Numer telefonu jest wymagany"),
  street: z.string().min(2, "Ulica i numer są wymagane"),
  city: z.string().min(2, "Miasto jest wymagane"),
  postalCode: z.string().min(5, "Kod pocztowy jest wymagany"),
  voivodeship: z.string().min(2, "Województwo jest wymagane"),
  employmentStatus: z.nativeEnum(ApplicationBodyEmploymentStatus),
  employer: z.string().optional(),
  programType: z.nativeEnum(ApplicationBodyProgramType),
  courseDescription: z.string().optional(),
  fundingAmount: z.coerce.number().optional(),
  nip: z.string().optional(),
  disabilityStatus: z.boolean().default(false),
  consent: z.boolean().refine((val) => val === true, {
    message: "Zgoda na przetwarzanie danych jest wymagana",
  }),
  consentMarketing: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

/* Fields per step for validation */
const STEP_FIELDS: (keyof FormValues)[][] = [
  ["firstName", "lastName", "pesel", "birthDate", "gender"],
  ["education", "email", "phone"],
  ["street", "postalCode", "city", "voivodeship"],
  ["employmentStatus", "programType"],
  ["consent"],
];

const STEPS = [
  { label: "Dane osobowe", icon: User },
  { label: "Kontakt", icon: Mail },
  { label: "Adres", icon: HomeIcon },
  { label: "Zatrudnienie", icon: BriefcaseIcon },
  { label: "Zgody", icon: ShieldCheck },
];

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
export default function Home() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const submitApplication = useSubmitApplication();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      pesel: "",
      birthDate: "",
      gender: "kobieta" as ApplicationBodyGender,
      education: "srednie" as ApplicationBodyEducation,
      email: "",
      phone: "",
      street: "",
      city: "",
      postalCode: "",
      voivodeship: "",
      employmentStatus: "pracujacy" as ApplicationBodyEmploymentStatus,
      employer: "",
      programType: "rozwijanie_kompetencji" as ApplicationBodyProgramType,
      courseDescription: "",
      fundingAmount: undefined,
      nip: "",
      disabilityStatus: false,
      consent: false,
      consentMarketing: false,
    },
  });

  const watchEmployment = form.watch("employmentStatus");
  const totalSteps = STEPS.length;

  const handleNext = async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid = await form.trigger(fields as (keyof FormValues)[]);
    if (valid) setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const handleBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const onSubmit = (values: FormValues) => {
    submitApplication.mutate(
      { data: values },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">

      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/50 transition-all duration-300">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <OlaMiiLogo />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#o-mnie" className="hover:text-primary transition-colors">O mnie</a>
            <a href="#uslugi" className="hover:text-primary transition-colors">Nasze Usługi</a>
            <a href="#programy" className="hover:text-primary transition-colors">Programy Dofinansowań</a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end text-sm">
              <span className="font-semibold text-foreground flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-primary"/> +48 500 592 850</span>
              <span className="text-muted-foreground text-xs">Sandra Baleja</span>
            </div>
            <a href="#wniosek">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium tracking-wide shadow-md shadow-primary/20 transition-all hover:shadow-primary/30">
                Złóż Wniosek
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-24 md:pt-44 md:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/4 w-[600px] h-[600px] bg-secondary rounded-full blur-[80px] pointer-events-none" />
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-primary/20 text-foreground text-sm font-medium shadow-sm">
              <Award className="w-4 h-4 text-primary" />
              <span>Certyfikowany doradca zawodowy</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] text-foreground tracking-tight">
              Zdobądź środki na <span className="text-primary italic font-serif pr-2">rozwój</span><br/>swojej kariery.
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
              Profesjonalne doradztwo, bilans kompetencji i kompleksowa pomoc w pozyskaniu unijnych dofinansowań na kursy i szkolenia zawodowe. Przeprowadzę Cię przez cały proces — od wniosku aż po certyfikat.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <a href="#wniosek" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5">
                  Wypełnij wniosek
                </Button>
              </a>
              <a href="#uslugi" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-base px-8 h-14 rounded-full border-border hover:bg-secondary/80 bg-background transition-all hover:-translate-y-0.5">
                  Poznaj nasze usługi
                </Button>
              </a>
            </div>
            <div className="pt-8 border-t border-border/50 flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /><span>Kompleksowa obsługa</span></div>
              <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /><span>Wysoka skuteczność</span></div>
            </div>
          </div>
          <div className="relative lg:h-[700px] rounded-3xl animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl -rotate-3 scale-105 transition-transform duration-700 blur-xl" />
            <img src="/hero.png" alt="Sandra Baleja doradzająca klientowi" className="relative z-10 rounded-3xl shadow-2xl w-full h-full object-cover object-center border border-white/20" />
            <div className="absolute bottom-10 -left-8 z-20 bg-background/95 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-border/50 animate-in fade-in zoom-in duration-700 delay-500">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Dofinansowania do</p>
                  <p className="text-2xl font-bold text-foreground">100% wartości</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="o-mnie" className="py-24 bg-secondary/30 relative">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-border/50 relative">
                <img src="/career.png" alt="Rozwój kariery" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-primary rounded-full blur-[60px] opacity-20 pointer-events-none" />
            </div>
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider">O mnie</div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Przewodniczka po unijnych<br/>programach wsparcia</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">Nazywam się <strong className="text-foreground">Sandra Baleja</strong> i jestem założycielką OLA MII Sp. z o.o. Moim celem jest pomaganie ludziom w podnoszeniu kwalifikacji i realizacji zawodowych marzeń z wykorzystaniem funduszy europejskich.</p>
              <p className="text-lg text-muted-foreground leading-relaxed">Biurokracja związana z wnioskami potrafi przytłoczyć. W OLA MII zajmuję się wszystkim — od diagnozy Twoich potrzeb, przez wybór odpowiedniego kursu, aż po rozliczenie projektu.</p>
              <div className="grid sm:grid-cols-2 gap-6 pt-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border/50 flex flex-shrink-0 items-center justify-center"><Target className="w-6 h-6 text-primary" /></div>
                  <div><h4 className="font-semibold text-foreground mb-1">Indywidualne podejście</h4><p className="text-sm text-muted-foreground">Analizujemy Twoją sytuację i dobieramy optymalne rozwiązanie.</p></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-background shadow-sm border border-border/50 flex flex-shrink-0 items-center justify-center"><Compass className="w-6 h-6 text-primary" /></div>
                  <div><h4 className="font-semibold text-foreground mb-1">Prowadzenie za rękę</h4><p className="text-sm text-muted-foreground">Krok po kroku wspieramy na każdym etapie ubiegania się o środki.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="uslugi" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 mb-16">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mx-auto">Nasze Usługi</div>
            <h2 className="text-4xl md:text-5xl font-bold">Jak możemy Ci pomóc?</h2>
            <p className="text-lg text-muted-foreground">Kompleksowe wsparcie w rozwoju zawodowym. Od zbadania predyspozycji, po sfinansowanie zdobywania nowych umiejętności.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Briefcase, title: "Doradztwo Zawodowe", desc: "Profesjonalne wsparcie w planowaniu ścieżki kariery. Pomagamy określić Twoje cele zawodowe i zaplanować kolejne kroki, aby zwiększyć Twoją wartość na rynku pracy." },
              { icon: LineChart, title: "Bilans Kompetencji", desc: "Szczegółowa diagnoza Twoich umiejętności, wiedzy i predyspozycji. Niezbędny krok przed wyborem szkolenia, gwarantujący realne korzyści." },
              { icon: BookOpen, title: "Szkolenia Zawodowe", desc: "Dobór i organizacja wysokiej jakości kursów. Współpracujemy z zaufanymi jednostkami szkoleniowymi, zapewniając aktualną wiedzę poszukiwaną przez pracodawców." },
              { icon: FileText, title: "Pomoc w Dofinansowaniu", desc: "Kompleksowa obsługa biurokratyczna. Wypełniamy wnioski, przygotowujemy dokumentację i czuwamy nad procesem ubiegania się o środki unijne." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card hover:bg-secondary/30 transition-colors p-8 rounded-2xl border border-border/60 shadow-sm group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROGRAMS ── */}
      <section id="programy" className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/20 text-primary text-sm font-semibold uppercase tracking-wider">Dostępne programy</div>
              <h2 className="text-4xl md:text-5xl font-bold text-white">Programy Dofinansowań</h2>
              <p className="text-lg text-background/70 leading-relaxed max-w-lg">Oferujemy wsparcie w ramach różnorodnych naborów i programów unijnych. Pomożemy Ci dopasować odpowiedni program do Twojego statusu i potrzeb.</p>
              <div className="space-y-6 pt-4">
                {[
                  { n: "1", title: "Bilans kompetencji z doradztwem", desc: "Dla osób, które chcą zmienić ścieżkę kariery. Program obejmuje testy predyspozycji i sesje z doradcą." },
                  { n: "2", title: "Wsparcie doradcy zawodowego", desc: "Konsultacje przygotowujące do rynku pracy, pomoc w tworzeniu CV i przygotowanie do rozmów kwalifikacyjnych." },
                  { n: "3", title: "Wybór usług rozwojowych", desc: "Uzyskanie bonów szkoleniowych na wybrane kursy zawodowe, szkolenia specjalistyczne lub studia podyplomowe z Bazy Usług Rozwojowych." },
                ].map(({ n, title, desc }) => (
                  <div key={n} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">{n}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{title}</h4>
                      <p className="text-sm text-background/70">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl relative">
                <img src="/funding.png" alt="Dokumenty dofinansowania" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -left-12 top-1/4 bg-white p-6 rounded-2xl shadow-xl border border-border/10 max-w-xs animate-in fade-in slide-in-from-left duration-1000 delay-300">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-primary" />
                  <h5 className="font-bold text-foreground">Dla kogo?</h5>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {["Pracujących", "Bezrobotnych", "Przedsiębiorców", "Osób powracających na rynek pracy"].map((item) => (
                    <li key={item} className="flex items-start gap-2"><CheckSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="py-0 relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/training.png" alt="Szkolenie profesjonalne" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-foreground/50" />
        </div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Zainwestuj w swoją przyszłość już dziś</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 font-medium">Fundusze europejskie dają możliwości. My pomagamy po nie sięgnąć.</p>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section id="wniosek" className="py-24 relative bg-secondary/20">
        <div className="container mx-auto px-4 max-w-3xl relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-semibold uppercase tracking-wider mx-auto mb-6">Aplikacja</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Złóż Formularz Zgłoszeniowy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Wypełnij poniższy wniosek, aby rozpocząć proces ubiegania się o wsparcie. Analiza Twojego zgłoszenia jest całkowicie bezpłatna i niezobowiązująca.</p>
          </div>

          <div className="bg-card rounded-[2rem] shadow-xl border border-border/80 relative overflow-hidden">
            {/* Gold top bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-yellow-400 to-primary/50" />

            {isSuccess ? (
              <div className="p-8 md:p-12 text-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold">Wniosek przyjęty pomyślnie!</h3>
                <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
                  Dziękujemy za przesłanie zgłoszenia. Nasz doradca przeanalizuje Twoje dane i skontaktuje się z Tobą w ciągu 2 dni roboczych.
                </p>
                <Button variant="outline" size="lg" className="rounded-full px-8 h-12" onClick={() => { setIsSuccess(false); setCurrentStep(0); form.reset(); }}>
                  Wyślij kolejne zgłoszenie
                </Button>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="px-8 pt-10 pb-6">
                  {/* Progress bar */}
                  <div className="relative mb-8">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/60" />
                    <div
                      className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                      style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                      {STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const done = i < currentStep;
                        const active = i === currentStep;
                        return (
                          <div key={i} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${done ? "bg-primary border-primary text-white" : active ? "bg-background border-primary text-primary shadow-md shadow-primary/20" : "bg-background border-border text-muted-foreground"}`}>
                              {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                            </div>
                            <span className={`text-[11px] font-semibold text-center hidden sm:block transition-colors ${active ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground"}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step counter */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-foreground">{STEPS[currentStep].label}</h3>
                    <span className="text-sm text-muted-foreground font-medium">Krok {currentStep + 1} z {totalSteps}</span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="px-8 pb-8 space-y-6">

                      {/* ── STEP 1: Dane osobowe ── */}
                      {currentStep === 0 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField control={form.control} name="firstName" render={({ field }) => (
                              <FormItem><FormLabel>Imię <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="np. Anna" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lastName" render={({ field }) => (
                              <FormItem><FormLabel>Nazwisko <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="np. Kowalska" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="pesel" render={({ field }) => (
                            <FormItem><FormLabel>PESEL <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="11 cyfr" maxLength={11} {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField control={form.control} name="birthDate" render={({ field }) => (
                              <FormItem><FormLabel>Data urodzenia <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="gender" render={({ field }) => (
                              <FormItem><FormLabel>Płeć <span className="text-primary">*</span></FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Wybierz" /></SelectTrigger></FormControl>
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

                      {/* ── STEP 2: Wykształcenie i kontakt ── */}
                      {currentStep === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                          <FormField control={form.control} name="education" render={({ field }) => (
                            <FormItem><FormLabel>Wykształcenie <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Wybierz wykształcenie" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="podstawowe">Podstawowe</SelectItem>
                                  <SelectItem value="gimnazjalne">Gimnazjalne</SelectItem>
                                  <SelectItem value="zasadnicze_zawodowe">Zasadnicze zawodowe</SelectItem>
                                  <SelectItem value="srednie">Średnie</SelectItem>
                                  <SelectItem value="wyzsze_licencjat">Wyższe (Licencjat)</SelectItem>
                                  <SelectItem value="wyzsze_magister">Wyższe (Magister)</SelectItem>
                                  <SelectItem value="doktorat">Doktorat</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField control={form.control} name="email" render={({ field }) => (
                              <FormItem><FormLabel>Adres e-mail <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" type="email" placeholder="adres@email.pl" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="phone" render={({ field }) => (
                              <FormItem><FormLabel>Numer telefonu <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="+48 000 000 000" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                        </div>
                      )}

                      {/* ── STEP 3: Adres ── */}
                      {currentStep === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                          <FormField control={form.control} name="street" render={({ field }) => (
                            <FormItem><FormLabel>Ulica i numer <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="ul. Przykładowa 1/2" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                              <FormItem><FormLabel>Kod pocztowy <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="00-000" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                              <FormItem><FormLabel>Miasto <span className="text-primary">*</span></FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="np. Łódź" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </div>
                          <FormField control={form.control} name="voivodeship" render={({ field }) => (
                            <FormItem><FormLabel>Województwo <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Wybierz województwo" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {["Dolnośląskie","Kujawsko-pomorskie","Lubelskie","Lubuskie","Łódzkie","Małopolskie","Mazowieckie","Opolskie","Podkarpackie","Podlaskie","Pomorskie","Śląskie","Świętokrzyskie","Warmińsko-mazurskie","Wielkopolskie","Zachodniopomorskie"].map((w) => (
                                    <SelectItem key={w} value={w.toLowerCase()}>{w}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* ── STEP 4: Zatrudnienie + wsparcie ── */}
                      {currentStep === 3 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                          <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                            <FormItem><FormLabel>Status zatrudnienia <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Wybierz status" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="pracujacy">Pracujący</SelectItem>
                                  <SelectItem value="bezrobotny">Bezrobotny</SelectItem>
                                  <SelectItem value="nieaktywny">Nieaktywny zawodowo</SelectItem>
                                  <SelectItem value="samozatrudniony">Samozatrudniony</SelectItem>
                                  <SelectItem value="uczen_student">Uczeń / Student</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          {(watchEmployment === "pracujacy" || watchEmployment === "samozatrudniony") && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
                              <FormField control={form.control} name="employer" render={({ field }) => (
                                <FormItem><FormLabel>Nazwa pracodawcy</FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="Firma Sp. z o.o." {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                              <FormField control={form.control} name="nip" render={({ field }) => (
                                <FormItem><FormLabel>NIP pracodawcy (opcjonalnie)</FormLabel><FormControl><Input className="h-12 rounded-xl" placeholder="0000000000" {...field} /></FormControl><FormMessage /></FormItem>
                              )} />
                            </div>
                          )}
                          <FormField control={form.control} name="programType" render={({ field }) => (
                            <FormItem><FormLabel>Rodzaj wsparcia <span className="text-primary">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Wybierz rodzaj wsparcia" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="nabycie_kwalifikacji">Nabycie kwalifikacji zawodowych</SelectItem>
                                  <SelectItem value="rozwijanie_kompetencji">Rozwijanie obecnych kompetencji</SelectItem>
                                  <SelectItem value="bilans_kompetencji">Bilans kompetencji</SelectItem>
                                  <SelectItem value="doradztwo_zawodowe">Doradztwo zawodowe</SelectItem>
                                  <SelectItem value="inne">Inne / nie wiem</SelectItem>
                                </SelectContent>
                              </Select><FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="courseDescription" render={({ field }) => (
                            <FormItem><FormLabel>Opis planowanego kursu (opcjonalnie)</FormLabel>
                              <FormControl><Textarea placeholder="Np. kurs obsługi programów graficznych, kurs językowy..." className="min-h-[100px] rounded-xl resize-y" {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="fundingAmount" render={({ field }) => (
                            <FormItem><FormLabel>Wnioskowana kwota (opcjonalnie)</FormLabel>
                              <div className="relative">
                                <FormControl><Input className="h-12 rounded-xl pr-14" type="number" placeholder="np. 5000" {...field} /></FormControl>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">PLN</div>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* ── STEP 5: Oświadczenia ── */}
                      {currentStep === 4 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                          <FormField control={form.control} name="disabilityStatus" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-border/60 bg-background/30 p-5">
                              <div className="space-y-1 pr-6">
                                <FormLabel className="text-base font-semibold">Osoba z niepełnosprawnością</FormLabel>
                                <FormDescription className="text-sm">Niektóre programy oferują dodatkowe preferencje dla osób z orzeczeniem.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-primary" />
                              </FormControl>
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="consent" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-5 rounded-2xl border border-primary/20 bg-primary/5">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-medium text-sm leading-relaxed cursor-pointer">
                                  Wyrażam zgodę na przetwarzanie moich danych osobowych zawartych w niniejszym formularzu przez OLA MII Sp. z o.o. w celu obsługi procesu rekrutacji na szkolenia oraz ubiegania się o dofinansowanie. <span className="text-primary font-bold">*</span>
                                </FormLabel>
                                <FormMessage className="text-destructive font-medium" />
                              </div>
                            </FormItem>
                          )} />

                          <FormField control={form.control} name="consentMarketing" render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-4 space-y-0 p-5 rounded-2xl border border-border/40 bg-background/20">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="font-normal text-sm leading-relaxed text-muted-foreground cursor-pointer">
                                  Wyrażam zgodę na otrzymywanie informacji marketingowych dotyczących przyszłych programów szkoleniowych, dofinansowań oraz ofert specjalnych od OLA MII Sp. z o.o. (zgoda opcjonalna).
                                </FormLabel>
                              </div>
                            </FormItem>
                          )} />
                        </div>
                      )}

                    </div>

                    {/* ── NAVIGATION BUTTONS ── */}
                    <div className="px-8 pb-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 pt-6">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex items-center gap-2 text-muted-foreground"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                      >
                        <ChevronLeft className="w-4 h-4" /> Wróć
                      </Button>

                      {currentStep < totalSteps - 1 ? (
                        <Button
                          type="button"
                          size="lg"
                          className="flex items-center gap-2 px-10 h-13 rounded-full shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all"
                          onClick={handleNext}
                        >
                          Dalej <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          size="lg"
                          className="flex items-center gap-2 px-10 h-13 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                          disabled={submitApplication.isPending}
                        >
                          {submitApplication.isPending ? (
                            <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />Przetwarzanie...</>
                          ) : (
                            <><Star className="w-4 h-4" /> Wyślij Wniosek</>
                          )}
                        </Button>
                      )}
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Wysyłając wniosek akceptujesz naszą Politykę Prywatności. Twoje dane są bezpieczne i chronione zgodnie z RODO.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-foreground text-background py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-12 gap-12 relative z-10">
          <div className="lg:col-span-4 space-y-6">
            <OlaMiiLogo dark />
            <p className="text-sm text-background/70 leading-relaxed pr-8">
              Profesjonalne doradztwo zawodowe i kompleksowa pomoc w pozyskiwaniu dofinansowań unijnych na rozwój i szkolenia. Twój sukces to nasz priorytet.
            </p>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-primary tracking-wide uppercase text-sm">Szybki Kontakt</h4>
            <div className="space-y-4 text-sm text-background/80">
              <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary shrink-0" /><span className="leading-tight">ul. Plantowa 17/24<br/>91-104 Łódź</span></div>
              <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-primary shrink-0" /><span>+48 500 592 850</span></div>
              <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-primary shrink-0" /><span>balejasandra@gmail.com</span></div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-primary tracking-wide uppercase text-sm">Nasze Usługi</h4>
            <ul className="space-y-2 text-sm text-background/80">
              {["Doradztwo Zawodowe","Bilans Kompetencji","Szkolenia Zawodowe","Pomoc w Dofinansowaniu","Wnioski Unijne"].map((s) => (
                <li key={s} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />{s}</li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-primary tracking-wide uppercase text-sm">Dane firmy</h4>
            <div className="text-sm text-background/70 space-y-1">
              <p className="font-semibold text-background/90">OLA MII Sp. z o.o.</p>
              <p>NIP: 9472011783</p>
              <p>KRS: 0001065517</p>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 pt-12 mt-12 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-xs text-background/40 gap-4 relative z-10">
          <p>&copy; {new Date().getFullYear()} OLA MII Sp. z o.o. Wszelkie prawa zastrzeżone.</p>
          <p>Projekt i realizacja: OLA MII</p>
        </div>
      </footer>

    </div>
  );
}
