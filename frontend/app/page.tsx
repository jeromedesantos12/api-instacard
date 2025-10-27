"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  LinkIcon,
  LineChart,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Heart,
  Sun,
  Moon,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaXTwitter,
} from "react-icons/fa6";

type SocialPlatform =
  | "instagram"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "github";

const DUMMY_PROFILE = {
  name: "Instacard",
  handle: "@instacard",
  location: "Jakarta",
  bio: "A link-in-bio built for conversion—not just a list of links.",
  avatarUrl: "",
};

const DUMMY_SOCIALS: {
  id: string;
  platform: SocialPlatform;
  username: string;
  url: string;
  is_active: boolean;
}[] = [
  {
    id: "1",
    platform: "instagram",
    username: "instacard.app",
    url: "#",
    is_active: true,
  },
  { id: "2", platform: "x", username: "instacard", url: "#", is_active: true },
  {
    id: "3",
    platform: "linkedin",
    username: "instacard",
    url: "#",
    is_active: true,
  },
  {
    id: "4",
    platform: "youtube",
    username: "instacard",
    url: "#",
    is_active: false,
  },
  {
    id: "5",
    platform: "github",
    username: "instacard",
    url: "#",
    is_active: true,
  },
  {
    id: "6",
    platform: "tiktok",
    username: "instacard",
    url: "#",
    is_active: false,
  },
];

const DUMMY_LINKS = [
  { id: "l1", title: "Start Your Instacard", url: "#" },
  { id: "l2", title: "Browse Templates", url: "#" },
  { id: "l3", title: "Pricing & Plans", url: "#" },
];

const platformIcon: Record<
  SocialPlatform,
  React.ComponentType<{ className?: string }>
> = {
  instagram: FaInstagram,
  tiktok: FaTiktok,
  linkedin: FaLinkedin,
  youtube: FaYoutube,
  github: FaGithub,
  x: FaXTwitter,
};

function useThemeToggle() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      localStorage.getItem("theme")) as "light" | "dark" | null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = stored ?? (prefersDark ? "dark" : "light");
    setTheme(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggle = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

export default function LandingPage() {
  const { theme, toggle } = useThemeToggle();

  const features = [
    {
      icon: <LinkIcon className="h-5 w-5" />,
      title: "Beautiful link blocks",
      desc: "Modern cards for links, social icons, CTAs, products, and more.",
    },
    {
      icon: <QrCode className="h-5 w-5" />,
      title: "Smart QR sharing",
      desc: "Generate a QR for your page so people can open your links with one scan.",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Privacy-first",
      desc: "Your data is yours. We eill never sell your profile.",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "High Compability",
      desc: "Built for all devices . SEO-friendly Lighthouse scores.",
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Themes & branding",
      desc: "Tune typography and accent colors. to make your links more interesting.",
    },
    {
      icon: <CheckCircle2 className="h-5 w-5" />,
      title: "One-minute setup",
      desc: "Sign in, add links, publish. Perfect for your social bios.",
    },
  ];

  const steps = [
    {
      step: 1,
      title: "Create your profile",
      desc: "Add an avatar, name, bio, and pick a theme that fits.",
    },
    {
      step: 2,
      title: "Add links & socials",
      desc: "Paste URLs or usernames. Reorder with drag & drop.",
    },
    {
      step: 3,
      title: "Share everywhere",
      desc: "Use it in your Instagram, TikTok, YouTube, and X bios—or via QR.",
    },
  ];

  const profile = DUMMY_PROFILE;
  const socials = DUMMY_SOCIALS.filter((s) => s.is_active);
  const links = DUMMY_LINKS;

  return (
    <main className="bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10 lg:px-16">
          <Link href="#" className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              Insta<span className="text-primary">Card</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              href="#features"
              className="text-muted-foreground transition hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#how"
              className="text-muted-foreground transition hover:text-foreground"
            >
              How it works
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={toggle}
              className="rounded-full"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-xl">
              <Link href="/register" className="inline-flex items-center gap-2">
                Try free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="px-6 py-16 md:px-10 md:py-2 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-balance pt-16 text-4xl font-extrabold tracking-tight md:text-6xl">
              A link-in-bio that actually{" "}
              <span className="text-primary md:mb-12">converts</span>.
            </h1>
            <p className="mt-4 max-w-xl md:mb-20 text-pretty text-muted-foreground md:text-lg">
              Build a clean, fast profile hub that’s easy to maintain. Highlight
              your key links, socials, and clear CTAs so visitors become
              customers.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2"
                >
                  Create your Instacard <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl"
              >
                <Link href="#features">See features</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> Privacy-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-4 w-4" /> Lightning-quick setup
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-4 w-4" /> Thoughtful, elegant UI
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="relative mx-auto mt-20 h-[35rem] w-[20.625rem] overflow-hidden rounded-[28px] bg-card dark:bg-background text-card-foreground ring-1 ring-border">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/80 p-4 backdrop-blur">
                <div className="inline-flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-1 ring-border bg-muted">
                    <AvatarImage
                      src={profile.avatarUrl || ""}
                      alt={profile.name}
                    />
                    <AvatarFallback className="text-[10px]">IC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{profile.handle}</p>
                    <p className="text-xs text-muted-foreground">
                      Creator • {profile.location}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="rounded-full">
                  Follow
                </Button>
              </div>

              <div className="h-full overflow-y-auto px-4 pb-6 pt-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-16 w-16 ring-2 ring-border bg-muted">
                    <AvatarImage
                      src={profile.avatarUrl || ""}
                      alt={profile.name}
                    />
                    <AvatarFallback>IC</AvatarFallback>
                  </Avatar>
                  <div className="mt-2">
                    <p className="text-sm font-semibold">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {socials.map((s) => {
                    const Icon = platformIcon[s.platform];
                    return (
                      <Button
                        key={s.id}
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        asChild
                      >
                        <a href={s.url}>
                          <Icon className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-4" />

                <div className="space-y-3">
                  {links.map((l) => (
                    <Button
                      key={l.id}
                      variant="outline"
                      className="w-full rounded-xl py-6"
                      asChild
                    >
                      <a href={l.url} className="inline-flex items-center">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        {l.title}
                      </a>
                    </Button>
                  ))}
                </div>

                <div className="pt-3 text-center text-[10px] text-muted-foreground">
                  Powered by{" "}
                  <span className="text-secondary text-md">
                    Insta<span className="text-primary">Card</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to grow
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Mature defaults, elegant UI, and the essentials to turn clicks
              into meaningful action.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc }) => (
              <Card key={title} className="rounded-2xl">
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {icon}
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="px-6 py-6 md:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Set up in three steps
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              No fuss. No fluff. Just ship.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ step, title, desc }) => (
              <Card key={step} className="rounded-2xl">
                <CardHeader>
                  <Badge variant="secondary" className="w-fit rounded-full">
                    Step {step}
                  </Badge>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:px-10 md:py-24 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
                “After using InstaCard, our CTR jumped 28% in two weeks.”
              </h3>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Clean design, clear hierarchy, and fast performance. that is the
                small things that make a real impact on sales.
              </p>
              <div className="mt-6 inline-flex items-center gap-3">
                <Avatar className="h-16 w-16 ring-2 ring-border bg-muted">
                  <AvatarImage src="/ricat.jpg" alt={profile.name} />
                  <AvatarFallback className="text-muted-foreground font-medium">
                    IC
                  </AvatarFallback>
                </Avatar>
                <div className="pl-2">
                  <p className="text-md font-medium">Alvin Rikardo</p>
                  <p className="text-sm text-muted-foreground">
                    Content Lead, WGN Studio
                  </p>
                </div>
              </div>
            </div>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Why creators love it</CardTitle>
                <CardDescription>Highlights from real users</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Looks
                  premium by default
                </div>
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Easy to
                  maintain and update
                </div>
                <div className="inline-flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Performance
                  gains you can feel
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full rounded-xl">
                  <Link href="/register">Start free</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-10 lg:px-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 rounded-2xl border bg-gradient-to-b from-primary/5 to-transparent p-10 text-center">
          <h3 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Ready to turn visitors into customers?
          </h3>
          <p className="max-w-2xl text-muted-foreground">
            Sign up in seconds, and publish a world-class link-in-bio today.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="rounded-xl">
              <Link href="/register">Create your Instacard</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link href="#features">Explore features</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-10 lg:px-16">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} InstaCard. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
