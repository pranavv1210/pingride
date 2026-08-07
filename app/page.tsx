"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Bike,
  Car,
  Check,
  ChevronRight,
  Clock,
  Download,
  Home,
  LifeBuoy,
  MapPin,
  Menu,
  MessageCircle,
  MoreVertical,
  Navigation,
  Phone,
  Plane,
  Receipt,
  RotateCcw,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Star,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { adminStats, chartData, driver, history, ride } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type Mode = "customer" | "driver" | "admin";
type Stage =
  | "splash"
  | "intro"
  | "vehicle"
  | "pickup"
  | "map"
  | "destination"
  | "fareLoading"
  | "fare"
  | "matching"
  | "driver"
  | "tracking"
  | "otp"
  | "ride"
  | "payment"
  | "upi"
  | "receipt"
  | "rate"
  | "thanks";
type Panel = "history" | "places" | "support" | "sos" | "share" | "someone" | "chat" | null;

const quickFeatures: { key: Exclude<Panel, null>; label: string; icon: React.ElementType }[] = [
  { key: "history", label: "History", icon: Receipt },
  { key: "places", label: "Saved", icon: Home },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "sos", label: "SOS", icon: Shield },
  { key: "share", label: "Share", icon: Share2 },
  { key: "someone", label: "For someone", icon: Users },
];

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function Page() {
  const [mode, setMode] = useState<Mode>("customer");

  return (
    <main className="app-screen min-h-screen premium-noise">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-3 px-0 py-0 sm:gap-6 sm:px-4 sm:py-5 md:px-8">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line/70 bg-white/92 px-3 py-2 backdrop-blur-xl sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-0">
          <div className="flex items-center gap-3">
            <div className="scale-90 sm:scale-100">
              <Logo />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-charcoal">PingRide</p>
              <p className="hidden text-xs text-graphite/70 min-[390px]:block">WhatsApp-first mobility prototype</p>
            </div>
          </div>
          <div className="flex shrink-0 rounded-full border border-line bg-white p-1 shadow-sm">
            {(["customer", "driver", "admin"] as Mode[]).map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={cn(
                  "rounded-full px-2.5 py-2 text-[11px] font-bold capitalize transition sm:px-4 sm:text-xs",
                  mode === item ? "bg-charcoal text-white" : "text-graphite hover:bg-mist",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          {mode === "customer" && <CustomerExperience key="customer" />}
          {mode === "driver" && <DriverExperience key="driver" />}
          {mode === "admin" && <AdminExperience key="admin" />}
        </AnimatePresence>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-charcoal text-white shadow-premium">
      <MessageCircle className="h-5 w-5 text-whatsapp" />
    </div>
  );
}

function CustomerExperience() {
  const [stage, setStage] = useState<Stage>("splash");
  const [typing, setTyping] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState("");
  const [rating, setRating] = useState(5);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setStage("intro"), 1900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [stage, typing, panel]);

  async function botNext(next: Stage, wait = 700) {
    setTyping(true);
    await delay(wait);
    setTyping(false);
    setStage(next);
  }

  async function chooseVehicle() {
    setStage("pickup");
    await botNext("pickup", 600);
  }

  async function shareLocation() {
    setStage("map");
    await delay(1600);
    await botNext("destination", 500);
  }

  async function chooseAirport() {
    setStage("fareLoading");
    await delay(2500);
    setStage("fare");
  }

  async function confirmRide() {
    setStage("matching");
    await delay(3600);
    setStage("driver");
  }

  function action(label: string) {
    setToast(label);
    window.setTimeout(() => setToast(""), 1900);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="grid flex-1 place-items-stretch sm:place-items-center"
    >
      <div className="relative h-[calc(100vh-58px)] w-full border-black/10 bg-charcoal shadow-none sm:h-auto sm:max-w-[410px] sm:rounded-[46px] sm:border sm:p-3 sm:shadow-phone">
        <div className="h-full overflow-hidden bg-[#efe7db] sm:rounded-[36px]">
          <div className="phone-screen relative h-full min-h-[620px] sm:h-[780px] sm:max-h-[calc(100vh-130px)] sm:min-h-[650px]">
            <PhoneTopBar />
            <div ref={scrollRef} className="hide-scrollbar h-[calc(100%-74px)] overflow-y-auto bg-[#f4eee4] px-3 pb-7">
              <AnimatePresence mode="wait">
                {stage === "splash" ? (
                  <Splash key="splash" />
                ) : (
                  <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 pt-4">
                    <FeatureRail setPanel={setPanel} />
                    <UserBubble text="Hi" />
                    <BotIntro />
                    {(stage === "intro" || stage === "vehicle") && (
                      <ChoiceGrid
                        items={[
                          { label: "Cab", icon: Car, onClick: () => botNext("pickup") },
                          { label: "Auto", icon: Zap, onClick: chooseVehicle, active: true },
                          { label: "Bike", icon: Bike, onClick: () => botNext("pickup") },
                        ]}
                      />
                    )}
                    {stageOrder(stage) >= stageOrder("pickup") && (
                      <>
                        <UserBubble text="Auto" />
                        <BotBubble>Great choice. Please share your pickup location.</BotBubble>
                        <InlineButton icon={MapPin} label="Share Live Location" onClick={shareLocation} />
                      </>
                    )}
                    {stage === "map" && <MiniMap title="Locating you" subtitle="GPS locked near Whitefield" pinPulse />}
                    {stageOrder(stage) >= stageOrder("destination") && (
                      <>
                        <BotBubble>Pickup confirmed: Whitefield, Bengaluru. Where would you like to go?</BotBubble>
                        <ChoiceGrid
                          items={[
                            { label: "Home", icon: Home, onClick: () => action("Home selected") },
                            { label: "Office", icon: User, onClick: () => action("Office selected") },
                            { label: "Airport", icon: Plane, onClick: chooseAirport, active: true },
                            { label: "Select Map", icon: MapPin, onClick: () => setPanel("places") },
                            { label: "Type", icon: Send, onClick: () => action("Typing destination simulated") },
                          ]}
                        />
                      </>
                    )}
                    {stage === "fareLoading" && <LoadingCard />}
                    {stageOrder(stage) >= stageOrder("fare") && stageOrder(stage) < stageOrder("driver") && (
                      <FareCard onConfirm={confirmRide} onCancel={() => action("Ride request cancelled")} />
                    )}
                    {stage === "matching" && <MatchingCard />}
                    {stageOrder(stage) >= stageOrder("driver") && (
                      <DriverCard
                        onTrack={() => setStage("tracking")}
                        onCall={() => action(`Calling ${driver.name}`)}
                        onChat={() => setPanel("chat")}
                        onCancel={() => action("Cancellation assistant opened")}
                      />
                    )}
                    {stage === "tracking" && <TrackingPage onOtp={() => setStage("otp")} />}
                    {stage === "otp" && <OtpCard onStart={() => setStage("ride")} />}
                    {stage === "ride" && <RideProgress onDone={() => setStage("payment")} />}
                    {stage === "payment" && <PaymentCard onUpi={() => setStage("upi")} onCash={() => setStage("receipt")} />}
                    {stage === "upi" && <UpiCard onDone={() => setStage("receipt")} />}
                    {stage === "receipt" && <ReceiptCard onRate={() => setStage("rate")} onAction={action} />}
                    {stage === "rate" && <RatingCard rating={rating} setRating={setRating} onDone={() => setStage("thanks")} />}
                    {stage === "thanks" && (
                      <BotBubble>Thank you for choosing PingRide ❤️ Hope to ride with you again.</BotBubble>
                    )}
                    {typing && <Typing />}
                    <Panel panel={panel} setPanel={setPanel} action={action} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <ChatComposer onSend={() => action("Message sent to PingRide")} />
            <AnimatePresence>{toast && <Toast text={toast} />}</AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function stageOrder(stage: Stage) {
  return [
    "splash",
    "intro",
    "vehicle",
    "pickup",
    "map",
    "destination",
    "fareLoading",
    "fare",
    "matching",
    "driver",
    "tracking",
    "otp",
    "ride",
    "payment",
    "upi",
    "receipt",
    "rate",
    "thanks",
  ].indexOf(stage);
}

function PhoneTopBar() {
  return (
    <div className="flex h-[74px] items-center gap-3 bg-[#075E54] px-3 text-white">
      <ArrowLeft className="h-5 w-5" />
      <Logo />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-bold">PingRide</p>
          <BadgeCheck className="h-4 w-4 fill-[#7ddbb0] text-[#075E54]" />
        </div>
        <p className="text-xs text-white/75">online</p>
      </div>
      <Phone className="h-5 w-5" />
      <MoreVertical className="h-5 w-5" />
    </div>
  );
}

function Splash() {
  return (
    <div className="grid h-full place-items-center bg-white px-8 text-center">
      <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-5">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} className="mx-auto">
          <Logo />
        </motion.div>
        <div>
          <h1 className="text-4xl font-black tracking-normal text-charcoal">PingRide</h1>
          <p className="mt-3 text-sm leading-6 text-graphite/70">
            Book a ride on WhatsApp. No app download. No signup. Just message and go.
          </p>
        </div>
        <div className="mx-auto h-1 w-28 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-whatsapp" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.1 }} />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureRail({ setPanel }: { setPanel: (panel: Panel) => void }) {
  return (
    <div className="mb-4 grid grid-cols-3 gap-2">
      {quickFeatures.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setPanel(key)}
          className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-white/80 text-[11px] font-bold text-charcoal shadow-sm transition hover:-translate-y-0.5"
        >
          <Icon className="h-4 w-4 text-[#128C7E]" />
          {label}
        </button>
      ))}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="ml-auto max-w-[78%] rounded-2xl rounded-tr-sm bg-[#DCF8C6] px-4 py-2 text-sm shadow-sm">
      {text}
      <span className="ml-2 text-[10px] text-black/45">8:42 ✓✓</span>
    </motion.div>
  );
}

function BotBubble({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mr-auto max-w-[88%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-6 text-charcoal shadow-sm">
      {children}
      <span className="ml-2 text-[10px] text-black/35">8:42</span>
    </motion.div>
  );
}

function BotIntro() {
  return (
    <BotBubble>
      <p className="font-bold">👋 Welcome to PingRide</p>
      <p className="mt-1">Book a ride on WhatsApp.</p>
      <p>No app download. No signup. Just message and go.</p>
      <p className="mt-2 font-semibold">How would you like to travel today?</p>
    </BotBubble>
  );
}

function ChoiceGrid({ items }: { items: { label: string; icon: React.ElementType; onClick: () => void; active?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ label, icon: Icon, onClick, active }) => (
        <motion.button
          whileTap={{ scale: 0.97 }}
          key={label}
          onClick={onClick}
          className={cn(
            "flex items-center gap-2 rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-charcoal shadow-sm transition hover:-translate-y-0.5",
            active ? "border-whatsapp bg-emeraldSoft" : "border-line",
          )}
        >
          <Icon className="h-4 w-4 text-[#128C7E]" />
          {label}
        </motion.button>
      ))}
    </div>
  );
}

function InlineButton({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} variant="green" className="w-full">
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}

function MiniMap({ title, subtitle, pinPulse = false }: { title: string; subtitle: string; pinPulse?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-[#eaf2ef] p-4 shadow-sm">
      <MapArtwork />
      <div className="relative z-10 flex h-56 flex-col justify-between">
        <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
          <p className="text-sm font-black">{title}</p>
          <p className="text-xs text-graphite/65">{subtitle}</p>
        </div>
        <motion.div
          className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-whatsapp text-charcoal shadow-premium"
          animate={pinPulse ? { scale: [1, 1.1, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          <MapPin className="h-6 w-6" />
        </motion.div>
      </div>
    </div>
  );
}

function MapArtwork() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 240" aria-hidden="true">
      <path d="M-20 52 C84 8 126 122 220 72 C294 32 324 58 386 14" fill="none" stroke="#c9ddd4" strokeWidth="18" />
      <path d="M8 210 C68 120 118 188 172 116 C220 52 276 146 364 88" fill="none" stroke="#c9ddd4" strokeWidth="16" />
      <path d="M34 36 L330 216" stroke="#dfeae5" strokeWidth="8" />
      <path d="M20 174 L340 34" stroke="#dfeae5" strokeWidth="7" />
      <path d="M66 202 C114 146 166 152 218 96 C252 58 294 72 326 44" fill="none" stroke="#25D366" strokeWidth="5" className="route-dash" />
    </svg>
  );
}

function LoadingCard() {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      {["Checking nearby drivers...", "Estimating fare...", "Calculating fastest route..."].map((item, index) => (
        <motion.div key={item} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.45 }} className="mb-3 flex items-center gap-3 last:mb-0">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-emeraldSoft">
            <Check className="h-4 w-4 text-[#128C7E]" />
          </span>
          <span className="text-sm font-semibold">{item}</span>
        </motion.div>
      ))}
    </div>
  );
}

function FareCard({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-graphite/55">Estimated fare</p>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-4xl font-black">{ride.fare}</p>
          <p className="text-sm text-graphite/65">{ride.pickup} to Airport</p>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emeraldSoft">
          <Zap className="h-6 w-6 text-[#128C7E]" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Metric label="Distance" value={ride.distance} />
        <Metric label="ETA" value={ride.eta} />
        <Metric label="Auto" value="Prime" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={onConfirm} variant="green">Confirm Ride</Button>
        <Button onClick={onCancel} variant="outline">Cancel</Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-mist p-3">
      <p className="text-[11px] text-graphite/55">{label}</p>
      <p className="text-sm font-black">{value}</p>
    </div>
  );
}

function MatchingCard() {
  const rows = [
    ["Anil", "No response"],
    ["Meera", "Busy"],
    [driver.name, "Accepted"],
  ];
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} className="grid h-10 w-10 place-items-center rounded-full bg-emeraldSoft">
          <Search className="h-5 w-5 text-[#128C7E]" />
        </motion.div>
        <div>
          <p className="font-black">Finding your driver</p>
          <p className="text-xs text-graphite/60">Matching nearby verified partners</p>
        </div>
      </div>
      {rows.map(([name, status], index) => (
        <motion.div key={name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.9 }} className="mb-2 flex items-center justify-between rounded-2xl bg-mist p-3 last:mb-0">
          <span className="text-sm font-bold">Driver {index + 1}: {name}</span>
          <span className={cn("text-xs font-black", status === "Accepted" ? "text-[#128C7E]" : "text-graphite/55")}>{status}</span>
        </motion.div>
      ))}
    </div>
  );
}

function DriverCard({ onTrack, onCall, onChat, onCancel }: { onTrack: () => void; onCall: () => void; onChat: () => void; onCancel: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex gap-4">
        <img src={driver.photo} alt={driver.name} className="h-20 w-20 rounded-3xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-black">{driver.name}</p>
            <BadgeCheck className="h-4 w-4 fill-whatsapp text-white" />
          </div>
          <p className="text-sm text-graphite/65">{driver.vehicle}</p>
          <p className="mt-1 text-sm font-bold">{driver.number}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-graphite/60">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {driver.rating} • {driver.trips} trips
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl bg-emeraldSoft p-3 text-center">
        <p className="text-xs font-bold text-[#128C7E]">Arriving in</p>
        <p className="text-2xl font-black">{ride.eta}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={onTrack} variant="green"><Navigation className="h-4 w-4" />Track Ride</Button>
        <Button onClick={onCall} variant="outline"><Phone className="h-4 w-4" />Call</Button>
        <Button onClick={onChat} variant="outline"><MessageCircle className="h-4 w-4" />Chat</Button>
        <Button onClick={onCancel} variant="outline"><X className="h-4 w-4" />Cancel</Button>
      </div>
    </div>
  );
}

function TrackingPage({ onOtp }: { onOtp: () => void }) {
  const [step, setStep] = useState(0);
  const statuses = ["Driver is 4 mins away", "Driver is 2 mins away", "Driver has arrived", "Please tell OTP"];

  useEffect(() => {
    const timer = window.setInterval(() => setStep((value) => Math.min(value + 1, statuses.length - 1)), 5000);
    return () => window.clearInterval(timer);
  }, [statuses.length]);

  return (
    <div className="space-y-3">
      <MiniMap title="Live tracking" subtitle={statuses[step]} />
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-black">{statuses[step]}</p>
          <Clock className="h-5 w-5 text-[#128C7E]" />
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-whatsapp" animate={{ width: `${30 + step * 23}%` }} />
        </div>
        <Button onClick={onOtp} variant="green" className="mt-4 w-full">Show OTP</Button>
      </div>
    </div>
  );
}

function OtpCard({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-3xl bg-charcoal p-5 text-center text-white shadow-sm">
      <p className="text-sm text-white/70">Share this OTP with your driver</p>
      <p className="my-4 text-6xl font-black tracking-normal text-whatsapp">{ride.otp}</p>
      <Button onClick={onStart} variant="green" className="w-full">Ride Started</Button>
    </div>
  );
}

function RideProgress({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 4800);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="space-y-3">
      <MiniMap title="Ride in progress" subtitle="Fastest airport route active" />
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <p className="font-black">Heading to airport</p>
        <p className="text-sm text-graphite/60">Arrival in {ride.time}</p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-whatsapp" initial={{ width: "8%" }} animate={{ width: "100%" }} transition={{ duration: 4.3 }} />
        </div>
      </div>
    </div>
  );
}

function PaymentCard({ onUpi, onCash }: { onUpi: () => void; onCash: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-graphite/55">Ride completed</p>
      <p className="mt-1 text-4xl font-black">{ride.fare}</p>
      <p className="text-sm text-graphite/65">Choose payment method</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={onUpi} variant="green"><Wallet className="h-4 w-4" />UPI</Button>
        <Button onClick={onCash} variant="outline">Cash</Button>
      </div>
    </div>
  );
}

function UpiCard({ onDone }: { onDone: () => void }) {
  const apps = ["Google Pay", "PhonePe", "Paytm", "BHIM"];
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <p className="font-black">Pay securely with UPI</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {apps.map((app) => (
          <button key={app} onClick={onDone} className="rounded-2xl border border-line p-4 text-sm font-black transition hover:border-whatsapp hover:bg-emeraldSoft">
            {app}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReceiptCard({ onRate, onAction }: { onRate: () => void; onAction: (message: string) => void }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-black">Digital receipt</p>
        <span className="rounded-full bg-emeraldSoft px-3 py-1 text-xs font-black text-[#128C7E]">Paid</span>
      </div>
      {[
        ["Pickup", ride.pickup],
        ["Destination", ride.destination],
        ["Distance", ride.distance],
        ["Fare", ride.fare],
        ["Driver", driver.name],
        ["Vehicle", driver.number],
        ["Payment", ride.payment],
      ].map(([label, value]) => (
        <div key={label} className="flex justify-between border-b border-line py-2 text-sm last:border-0">
          <span className="text-graphite/55">{label}</span>
          <span className="max-w-[58%] text-right font-bold">{value}</span>
        </div>
      ))}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button onClick={() => onAction("Receipt downloaded")} variant="outline"><Download className="h-4 w-4" />Download</Button>
        <Button onClick={() => onAction("Receipt shared")} variant="outline"><Share2 className="h-4 w-4" />Share</Button>
      </div>
      <Button onClick={onRate} variant="green" className="mt-2 w-full">Rate Driver</Button>
    </div>
  );
}

function RatingCard({ rating, setRating, onDone }: { rating: number; setRating: (rating: number) => void; onDone: () => void }) {
  return (
    <div className="rounded-3xl bg-white p-4 text-center shadow-sm">
      <p className="font-black">How was your ride?</p>
      <div className="my-4 flex justify-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} onClick={() => setRating(value)} aria-label={`${value} stars`}>
            <Star className={cn("h-9 w-9", value <= rating ? "fill-yellow-400 text-yellow-400" : "text-line")} />
          </button>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        {["Clean auto", "Polite driver", "On time", "Smooth route"].map((item) => (
          <span key={item} className="rounded-full bg-mist px-3 py-2 text-xs font-bold">{item}</span>
        ))}
      </div>
      <Button onClick={onDone} variant="green" className="w-full">Submit feedback</Button>
    </div>
  );
}

function Panel({ panel, setPanel, action }: { panel: Panel; setPanel: (panel: Panel) => void; action: (message: string) => void }) {
  if (!panel) return null;
  const titles: Record<Exclude<Panel, null>, string> = {
    history: "Ride history",
    places: "Saved places",
    support: "PingRide support",
    sos: "Emergency SOS",
    share: "Share trip",
    someone: "Book for someone",
    chat: "Chat driver",
  };
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white p-4 shadow-premium">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-black">{titles[panel]}</p>
        <button onClick={() => setPanel(null)} className="grid h-8 w-8 place-items-center rounded-full bg-mist"><X className="h-4 w-4" /></button>
      </div>
      {panel === "history" && history.map((item) => <HistoryRow key={item.route} {...item} action={action} />)}
      {panel === "places" && ["Home - Prestige Lakeside", "Office - Manyata Tech Park", "Airport - Terminal 2"].map((place) => <PanelRow key={place} icon={MapPin} title={place} button="Select" onClick={() => action(`${place} selected`)} />)}
      {panel === "support" && ["Report issue", "Lost item", "Fare question", "Call support"].map((item) => <PanelRow key={item} icon={LifeBuoy} title={item} button="Open" onClick={() => action(`${item} opened`)} />)}
      {panel === "sos" && ["Call Police", "Call Family", "Share Live Location", "Emergency Helpline"].map((item) => <PanelRow key={item} icon={AlertTriangle} title={item} button="Start" urgent onClick={() => action(`${item} simulated`)} />)}
      {panel === "share" && <ShareTrip action={action} />}
      {panel === "someone" && <BookSomeone action={action} />}
      {panel === "chat" && <DriverChat action={action} />}
    </motion.div>
  );
}

function PanelRow({ icon: Icon, title, button, onClick, urgent }: { icon: React.ElementType; title: string; button: string; onClick: () => void; urgent?: boolean }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-2xl bg-mist p-3 last:mb-0">
      <div className="flex items-center gap-3">
        <Icon className={cn("h-5 w-5", urgent ? "text-red-600" : "text-[#128C7E]")} />
        <span className="text-sm font-bold">{title}</span>
      </div>
      <Button onClick={onClick} size="sm" variant={urgent ? "default" : "soft"}>{button}</Button>
    </div>
  );
}

function HistoryRow({ route, fare, date, rating, method, action }: { route: string; fare: string; date: string; rating: number; method: string; action: (message: string) => void }) {
  return (
    <div className="mb-2 rounded-2xl bg-mist p-3 last:mb-0">
      <div className="flex justify-between gap-3">
        <div>
          <p className="text-sm font-black">{route}</p>
          <p className="text-xs text-graphite/55">{date} • {method} • {rating} stars</p>
        </div>
        <p className="font-black">{fare}</p>
      </div>
      <Button onClick={() => action("Repeat ride prepared")} size="sm" variant="soft" className="mt-3">Repeat Ride</Button>
    </div>
  );
}

function ShareTrip({ action }: { action: (message: string) => void }) {
  return (
    <div className="rounded-2xl bg-emeraldSoft p-4">
      <p className="text-sm font-black">Live link ready for family</p>
      <p className="mt-1 text-xs text-graphite/65">pingride.in/t/ravi-4821</p>
      <Button onClick={() => action("Trip link sent to family")} className="mt-4 w-full" variant="green"><Share2 className="h-4 w-4" />Send on WhatsApp</Button>
    </div>
  );
}

function BookSomeone({ action }: { action: (message: string) => void }) {
  return (
    <div className="space-y-2">
      {["Mother - +91 99887 77665", "Nishchal - +91 90080 07006"].map((person) => (
        <PanelRow key={person} icon={User} title={person} button="Book" onClick={() => action(`Booking prepared for ${person.split(" - ")[0]}`)} />
      ))}
    </div>
  );
}

function DriverChat({ action }: { action: (message: string) => void }) {
  return (
    <div className="space-y-2">
      <BotBubble>I am at the pickup gate. Please come near the security cabin.</BotBubble>
      <Button onClick={() => action("Reply sent to driver")} variant="green" className="w-full">Send: Coming now</Button>
    </div>
  );
}

function Typing() {
  return (
    <div className="mr-auto flex w-20 gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm">
      {[0, 1, 2].map((dot) => (
        <motion.span key={dot} className="h-2 w-2 rounded-full bg-graphite/40" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, delay: dot * 0.15 }} />
      ))}
    </div>
  );
}

function ChatComposer({ onSend }: { onSend: () => void }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex h-[62px] items-center gap-2 bg-[#f4eee4] px-3">
      <div className="flex flex-1 items-center rounded-full bg-white px-4 py-3 text-sm text-graphite/50 shadow-sm">Message PingRide</div>
      <button onClick={onSend} className="grid h-11 w-11 place-items-center rounded-full bg-[#128C7E] text-white shadow-sm"><Send className="h-5 w-5" /></button>
    </div>
  );
}

function Toast({ text }: { text: string }) {
  return (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-charcoal px-4 py-2 text-xs font-bold text-white shadow-premium">
      {text}
    </motion.div>
  );
}

function DriverExperience() {
  const [online, setOnline] = useState(true);
  const [rideState, setRideState] = useState<"incoming" | "accepted" | "otp" | "active" | "complete">("incoming");
  const [count, setCount] = useState(10);

  useEffect(() => {
    if (rideState !== "incoming") return;
    const timer = window.setInterval(() => setCount((value) => (value > 0 ? value - 1 : 10)), 1000);
    return () => window.clearInterval(timer);
  }, [rideState]);

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid flex-1 gap-4 px-3 pb-4 sm:px-0 lg:grid-cols-[420px_1fr]">
      <div className="rounded-[28px] bg-charcoal p-2 shadow-phone sm:rounded-[36px] sm:p-4">
        <div className="min-h-[calc(100vh-116px)] rounded-[24px] bg-[#FBFCFB] p-4 sm:min-h-[720px] sm:rounded-[28px] sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black">Driver App</p>
              <p className="text-sm text-graphite/60">Material partner console</p>
            </div>
            <button onClick={() => setOnline(!online)} className={cn("rounded-full px-4 py-2 text-sm font-black", online ? "bg-whatsapp" : "bg-line")}>{online ? "Online" : "Offline"}</button>
          </div>
          <MiniMap title="Bengaluru duty area" subtitle="Whitefield demand is high" />
          <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-black">{rideState === "incoming" ? "Incoming ride" : "Active ride"}</p>
              {rideState === "incoming" && <span className="grid h-10 w-10 place-items-center rounded-full bg-charcoal text-sm font-black text-white">{count}</span>}
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <PanelLine label="Customer" value="Aarav Sharma" />
              <PanelLine label="Pickup" value={ride.pickup} />
              <PanelLine label="Drop" value="Airport T2" />
              <PanelLine label="Fare" value={ride.fare} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {rideState === "incoming" && <Button onClick={() => setRideState("accepted")} variant="green">Accept</Button>}
              {rideState === "incoming" && <Button onClick={() => setRideState("incoming")} variant="outline">Reject</Button>}
              {rideState === "accepted" && <Button onClick={() => setRideState("otp")} variant="green" className="col-span-2">Reached pickup</Button>}
              {rideState === "otp" && <Button onClick={() => setRideState("active")} variant="green" className="col-span-2">Verify OTP 4821</Button>}
              {rideState === "active" && <Button onClick={() => setRideState("complete")} variant="green" className="col-span-2">Complete Ride</Button>}
              {rideState === "complete" && <Button onClick={() => setRideState("incoming")} variant="soft" className="col-span-2"><RotateCcw className="h-4 w-4" />Next demo ride</Button>}
            </div>
          </div>
        </div>
      </div>
      <DriverStats />
    </motion.section>
  );
}

function PanelLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-line py-2 last:border-0">
      <span className="text-graphite/55">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function DriverStats() {
  return (
    <div className="grid content-start gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat title="Today earnings" value="₹3,840" icon={Wallet} />
        <Stat title="Weekly earnings" value="₹24,180" icon={Sparkles} />
        <Stat title="Rating" value="4.92" icon={Star} />
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-premium">
        <p className="text-xl font-black">Ride history</p>
        <div className="mt-4 grid gap-3">
          {history.map((item) => <HistoryRow key={item.route} {...item} action={() => {}} />)}
        </div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-premium">
        <p className="text-xl font-black">Profile</p>
        <p className="mt-2 text-graphite/65">{driver.name} • KYC verified • Settlement clears every Monday.</p>
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-premium">
      <Icon className="h-5 w-5 text-[#128C7E]" />
      <p className="mt-4 text-sm text-graphite/60">{title}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}

function AdminExperience() {
  const [section, setSection] = useState("Dashboard");
  const nav = ["Dashboard", "Drivers", "Customers", "Live Rides", "Revenue", "Analytics", "Payments", "Support", "KYC", "Settings"];
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="grid flex-1 gap-4 bg-white p-3 shadow-none sm:rounded-[34px] sm:p-4 sm:shadow-phone lg:grid-cols-[240px_1fr]">
      <aside className="rounded-[24px] bg-charcoal p-4 text-white lg:rounded-[26px]">
        <Logo />
        <p className="mt-5 text-xl font-black">PingRide Ops</p>
        <div className="mt-6 grid max-h-64 grid-cols-2 gap-1 overflow-y-auto lg:max-h-none lg:grid-cols-1">
          {nav.map((item) => (
            <button key={item} onClick={() => setSection(item)} className={cn("flex items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-bold transition", section === item ? "bg-whatsapp text-charcoal" : "text-white/70 hover:bg-white/10")}>
              {item}
              <ChevronRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      </aside>
      <div className="min-w-0 p-2 md:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-3xl font-black">{section}</p>
            <p className="text-sm text-graphite/60">Live operating overview for Bengaluru</p>
          </div>
          <Button variant="green"><Download className="h-4 w-4" />Export report</Button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {adminStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-line bg-mist p-4">
              <p className="text-sm text-graphite/60">{stat.label}</p>
              <p className="mt-2 text-3xl font-black">{stat.value}</p>
              <p className="mt-2 text-xs font-black text-[#128C7E]">{stat.trend} vs last week</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-3xl border border-line p-5">
            <p className="font-black">Rides and revenue</p>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="rides" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#25D366" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E7ECE9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="rides" stroke="#128C7E" strokeWidth={3} fill="url(#rides)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-3xl border border-line p-5">
            <p className="font-black">Live ride map</p>
            <div className="mt-4"><MiniMap title="128 live rides" subtitle="24 airport, 42 office, 62 city" /></div>
            {["Driver approvals", "Open support tickets", "KYC pending"].map((item, index) => (
              <PanelRow key={item} icon={index === 0 ? BadgeCheck : LifeBuoy} title={item} button="Review" onClick={() => setSection(item)} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
