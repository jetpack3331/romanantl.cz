export const site = {
  name: "Roman Antl",
  title: "Senior Frontend Developer & Full Stack Developer",
  tagline: "14+ let zkušeností · SatoshiLabs · Freelance",
} as const;

export const hero = {
  headline: "Řeším problémy napříč stackem — s AI jsem výrazně efektivnější.",
  intro:
    "Jsem Senior Frontend Developer v SatoshiLabs a zároveň 14+ let na volné noze. Vše dělám s pomocí AI: Claude, Gemini, ChatGPT a nástroje pro tvorbu obsahu. Díky tomu pracuji rychle a spolehlivě.",
  body: [
    "Mám za sebou projekty od e-commerce a směnáren kryptoměn přes velké e-commerce weby až po web3 a agregátory zájezdů — například svetdovolene.cz. Umím pokrýt celý proces od návrhu po nasazení.",
    "S ComfyUI generuji obrázky (osoby, produkty, scény) a krátká produktová videa. Rád propojuji vývoj s vizuální tvorbou.",
  ],
} as const;

export const navHint = {
  title: "Co zde najdete",
  items: [
    { label: "Projekty", id: "projekty" },
    { label: "O mně", id: "o-mne" },
    { label: "Kontakt", id: "kontakt" },
  ],
} as const;

const placehold = (w: number, h: number, text: string) =>
  `https://placehold.co/${w}x${h}/EEEAE3/C4A77D?text=${encodeURIComponent(text)}`;

export const projects = [
  {
    id: "svetdovolene",
    title: "Světdovolené.cz",
    period: "2011 – dosud",
    description:
      "Cestovní agentura. Přehledný výběr dovolené za nejlepší ceny — Bulharsko, Egypt, Chorvatsko, Itálie, Řecko, Španělsko, Turecko a další.",
    link: "https://svetdovolene.cz",
    imageUrl: placehold(800, 450, "Svět dovolené"),
  },
  {
    id: "futsalky",
    title: "Holky Futsalky",
    period: "2015 – 2017",
    description:
      "Banda holek, které se našly na Twitteru. Učíme se kopat do míče pod taktovkou trenéra Romana Antla. Výtěžek ze vstupného a turnajů jde na charitu.",
    link: "https://futsalky.cz",
    imageUrl: placehold(800, 450, "Holky Futsalky"),
  },
] as const;

export const about = {
  experience: [
    { role: "Senior Frontend Developer", company: "SatoshiLabs", period: "2021 – dosud" },
    { role: "Full Stack Developer", company: "Freelancer", period: "2011 – dosud" },
    { role: "Frontend Developer", company: "StreamBee", period: "2020 – 2021" },
    { role: "JavaScript Front-End Developer", company: "Apollo Soft", period: "2016 – 2017" },
    { role: "Frontend Developer", company: "Bileto Technologies", period: "2014 – 2016" },
    { role: "Programátor", company: "NAR marketing s.r.o.", period: "2010 – 2011" },
  ],
  education: {
    title: "Výuční list, Elektrotechnika – Silnoproud",
    school: "SŠE na jízdárně 30",
    period: "2005 – 2008",
  },
  skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Vue.js",
    "PHP",
    "PostgreSQL",
    "AWS",
    "Linux",
    "Blockchain",
    "Ethereum",
    "Solidity",
  ],
  recommendations: [
    {
      author: "František Polášek",
      text: "Roman is a good thinker with senior TypeScript and JavaScript knowledge. He has proven his skills while we were architecting a complex intranet system from the ground up. It was a pleasure to work with him.",
    },
    {
      author: "David Slavík",
      text: "Roman came to our company as the first real senior ReactJS developer and showed us how to do it correctly. I saw many years of experience with development and very nice personal attitude. Cooperation with Roman is very nice and I can say he is real hard worker.",
    },
  ],
} as const;

export const contact = {
  formTitle: "Napište mi",
  formFields: {
    name: "Jméno",
    email: "E-mail",
    message: "Zpráva",
  },
  submitLabel: "Odeslat",
  successMessage: "Zpráva byla odeslána. Ozvu se co nejdřív.",
  errorMessage: "Něco se pokazilo. Zkuste to prosím znovu nebo napište přímo na e-mail.",
} as const;

export const socialLinks = [
  { href: "https://www.linkedin.com/in/romanantl/", label: "LinkedIn", icon: "fa-brands fa-linkedin-in", color: "#0A66C2" },
  { href: "https://github.com/jetpack3331", label: "GitHub", icon: "fa-brands fa-github", color: "#181717" },
  { href: "mailto:romcaantl@gmail.com", label: "E-mail", icon: "fa-solid fa-envelope", color: "#555" },
  { href: "https://www.facebook.com/romca.antl", label: "Facebook", icon: "fa-brands fa-facebook-f", color: "#1877F2" },
  { href: "https://twitter.com/rom_an_33", label: "Twitter", icon: "fa-brands fa-twitter", color: "#1DA1F2" },
] as const;
