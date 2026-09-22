// @ts-nocheck

import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import logoMichelleImg from "../assets/logo_michelle.png";
import heroImg from "../assets/hero.jpg";
import instagram1Img from "../assets/instagram-1.jpg";
import instagram2Img from "../assets/instagram-2.jpg";
import instagram3Img from "../assets/instagram-3.jpg";
import galleryMainImg from "../assets/gallery-main.jpg";
import gallery1Img from "../assets/gallery-1.jpg";
import gallery2Img from "../assets/gallery-2.jpg";
import gallery3Img from "../assets/gallery-3.jpg";
import gallery4Img from "../assets/gallery-4.jpg";
import aboutImg from "../assets/about.jpg";

const WHATSAPP_NUMBER = "5561995583212";

const services = [
  {
    title: "Design de Sobrancelhas",
    description:
      "Um design personalizado que respeita o formato natural das suas sobrancelhas e valoriza a harmonia do seu rosto. Cada detalhe é pensado para realçar sua beleza com leveza, equilíbrio e naturalidade.",
  },
  {
    title: "Coloração de Sobrancelhas",
    description:
      "Realça a tonalidade dos fios e proporciona mais definição ao desenho das sobrancelhas. A escolha da cor é personalizada para harmonizar com os fios e o tom natural de cada cliente.",
  },
  {
    title: "Henna",
    description:
      "Uma opção para realçar e definir as sobrancelhas, proporcionando uma tonalidade uniforme e um efeito de preenchimento visual. A aplicação é personalizada de acordo com o formato e a intensidade desejada.",
  },
  {
    title: "Brow Lamination",
    description:
      "Técnica que proporciona fios mais alinhados, definidos e visualmente preenchidos, valorizando o desenho natural das sobrancelhas. Um resultado sofisticado, moderno e com aspecto natural.",
  },
  {
    title: "Lash Lifting",
    description:
      "Técnica que curva e realça os cílios naturais, proporcionando um olhar mais aberto e marcante sem a necessidade de extensões. Praticidade e beleza em um resultado delicado e elegante.",
  },
];

function formatWhatsapp(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const instagramPosts = [
  { url: "https://www.instagram.com/p/DRw-ludjnWO/", image: instagram1Img },
  { url: "https://www.instagram.com/p/DM7lKekOUQ4/", image: instagram2Img },
  { url: "https://www.instagram.com/p/DL96ar_Oywi/", image: instagram3Img },
];

const testimonials = [
  {
    quote:
      "Eu faço minhas sobrancelhas com a Michelle tem mais de 10 anos e não a troco por nada, o serviço é de qualidade e a terapia é cortesia.",
    name: "Jessica Suzuki",
    service: "Design de sobrancelhas",
  },
  {
    quote: "Atendimento acolhedor e sem pressa. Resultado impecável, parece natural!",
    name: "Camila R.",
    service: "Design com henna",
  },
  {
    quote:
      "Eu gosto de manter o meu rosto o mais natural possível e o lash lifting fica perfeito pois parece que é um rímel que dura vários dias. Eu amo!!!!",
    name: "Letícia A.",
    service: "Lash lifting",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Michelle Lima especialista em sobrancelhas",
      },
      {
        name: "description",
        content:
          "Procedimentos de sobrancelha em Brasília: design, henna e microblading com resultado natural e acolhimento em cada detalhe. Agende pelo WhatsApp.",
      },
      {
        property: "og:title",
        content: "Michelle Lima especialista em sobrancelhas",
      },
      {
        property: "og:description",
        content:
          "Procedimentos de sobrancelha em Brasília: design, henna e microblading com resultado natural e acolhimento em cada detalhe.",
      },
      { property: "og:image", content: "https://michellelima.cloud/logo_michelle.png" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Michelle Lima especialista em sobrancelhas",
      },
      {
        name: "twitter:description",
        content:
          "Procedimentos de sobrancelha em Brasília: design, henna e microblading com resultado natural.",
      },
      { name: "twitter:image", content: "https://michellelima.cloud/logo_michelle.png" },
    ],
  }),
  component: Index,
});

export function Index() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "Design de Sobrancelhas",
    message: "",
  });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; phone?: string } = {};
    if (!formData.name.trim()) nextErrors.name = "Campo obrigatório";
    if (!formData.phone.trim()) nextErrors.phone = "Campo obrigatório";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const text = `Olá! Meu nome é ${formData.name}. Tenho interesse em ${formData.service}. ${formData.message}`.trim();
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-cream font-body text-ink antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/5 bg-cream/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <img
            src={logoMichelleImg}
            alt="Studio Michelle Lima"
            className="h-12 w-auto"
          />
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink/70 md:flex">
            <a href="#servicos" className="transition-colors hover:text-brand">
              Serviços
            </a>
            <a href="#galeria" className="transition-colors hover:text-brand">
              Galeria
            </a>
            <a href="#depoimentos" className="transition-colors hover:text-brand">
              Depoimentos
            </a>
            <a href="#contato" className="transition-colors hover:text-brand">
              Contato
            </a>
          </nav>
          <a
            href="#contato"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-cream ring-1 ring-brand-deep/30 transition-colors hover:bg-brand-deep"
          >
            Agendar
          </a>
        </div>
      </header>

      <main>
        <section className="pb-20 pt-32 md:pb-28 md:pt-40">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-12">
            <div className="fade-up md:col-span-6">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Estúdio de sobrancelhas
              </p>
              <h1 className="max-w-[40ch] text-balance font-display text-5xl font-medium leading-tight md:text-6xl">
                Seu olhar, desenhado com a leveza de um único fio.
              </h1>
              <p className="mt-6 max-w-[46ch] text-pretty text-base leading-relaxed text-ink/70 md:text-lg">
                Procedimentos de sobrancelha pensados para realçar o que você já
                é. Acolhimento, precisão e resultados naturais — sem exageros.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href="#contato"
                  className="rounded-full bg-brand px-7 py-3.5 font-semibold text-cream ring-1 ring-brand-deep/30 transition-colors hover:bg-brand-deep"
                >
                  Agendar horário
                </a>
                <a
                  href="#servicos"
                  className="text-sm font-semibold text-ink/70 transition-colors hover:text-brand"
                >
                  Ver serviços →
                </a>
              </div>
            </div>
            <div className="fade-up md:col-span-6" style={{ animationDelay: "0.15s" }}>
              <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-blush">
                <img
                  src={heroImg}
                  alt="Michelle Lima sorrindo"
                  width={3120}
                  height={4160}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="servicos" className="bg-blush/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-[46ch]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                O que fazemos
              </p>
              <h2 className="text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                Serviços em torno do seu olhar
              </h2>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {services.map((service) => (
                <div
                  key={service.title}
                  className="w-full rounded-3xl bg-cream p-7 ring-1 ring-ink/5 transition-transform hover:-translate-y-1 hover:ring-brand/30 sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                >
                  <h3 className="mb-2 font-display text-xl font-medium">
                    {service.title}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-ink/65">
                    {service.description}
                  </p>
                  <div className="border-t border-ink/10 pt-4 text-right">
                    <a
                      href="#contato"
                      className="text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
                    >
                      Agendar →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="galeria" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-[46ch]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Antes & depois
              </p>
              <h2 className="text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                Transformações reais, no seu ritmo
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="aspect-[4/5] col-span-2 row-span-2 md:col-span-2 md:row-span-2">
                <div className="h-full w-full overflow-hidden rounded-3xl bg-petal/70">
                  <img
                    src={galleryMainImg}
                    alt="Antes e depois de brow lamination"
                    width={1080}
                    height={1350}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-blush">
                <img
                  src={gallery1Img}
                  alt="Antes e depois de design de sobrancelhas"
                  width={1080}
                  height={1350}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-cream">
                <img
                  src={gallery2Img}
                  alt="Antes e depois de lash lifting"
                  width={1080}
                  height={1350}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-petal/70">
                <img
                  src={gallery3Img}
                  alt="Antes e depois de design de sobrancelhas com henna"
                  width={1080}
                  height={1350}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-blush">
                <img
                  src={gallery4Img}
                  alt="Antes e depois de design de sobrancelhas com coloração"
                  width={1080}
                  height={1350}
                  loading="lazy"
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="depoimentos" className="bg-blush/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-[46ch]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Depoimentos
              </p>
              <h2 className="text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                Quem já passou por aqui
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((item) => (
                <figure
                  key={item.name}
                  className="rounded-3xl bg-cream p-7 ring-1 ring-ink/5"
                >
                  <p className="mb-6 text-balance font-display text-lg leading-snug">
                    “{item.quote}”
                  </p>
                  <figcaption>
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-xs text-ink/50">{item.service}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="sobre" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl bg-petal/70">
              <img
                src={aboutImg}
                alt="Michelle Lima, especialista em sobrancelhas, sorrindo"
                width={3120}
                height={4160}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Sobre a profissional
              </p>
              <h2 className="mb-6 text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                Tudo começa com uma escuta atenta
              </h2>
              <p className="mb-4 text-pretty text-base leading-relaxed text-ink/70 md:text-lg">
                Sou Michelle Lima, atuo como design de sobrancelhas a mais de
                9 anos.
              </p>
              <p className="mb-4 text-pretty text-base leading-relaxed text-ink/70 md:text-lg">
                Acredito que cada sobrancelha possuíam formato único e que um
                bom resultado vai muito além da estética, busco estar sempre
                me aperfeiçoando, estudando novas técnicas e aprimorando meu
                trabalho.
              </p>
              <p className="text-pretty text-base leading-relaxed text-ink/70 md:text-lg">
                Mais que oferecer um serviço de beleza, quero proporcionar uma
                experiência de cuidado, acolhimento e autoestima
              </p>
            </div>
          </div>
        </section>

        <section id="contato" className="bg-blush/40 py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-6">
            <div className="rounded-[2rem] bg-cream p-8 ring-1 ring-ink/5 md:p-12">
              <div className="mb-8 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                  Vamos conversar
                </p>
                <h2 className="text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                  Agende seu horário pelo WhatsApp
                </h2>
              </div>
              <form onSubmit={handleSubmit} noValidate className="grid gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value })
                      if (errors.name) setErrors({ ...errors, name: undefined })
                    }}
                    className={`w-full rounded-2xl border bg-cream px-5 py-3.5 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                      errors.name ? "border-red-400" : "border-ink/10"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1.5 px-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Seu WhatsApp"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: formatWhatsapp(e.target.value) })
                      if (errors.phone) setErrors({ ...errors, phone: undefined })
                    }}
                    className={`w-full rounded-2xl border bg-cream px-5 py-3.5 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                      errors.phone ? "border-red-400" : "border-ink/10"
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 px-1 text-xs text-red-500">{errors.phone}</p>
                  )}
                </div>
                <select
                  value={formData.service}
                  onChange={(e) =>
                    setFormData({ ...formData, service: e.target.value })
                  }
                  className="w-full rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm text-ink/70 focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  {services.map((service) => (
                    <option key={service.title}>{service.title}</option>
                  ))}
                </select>
                <textarea
                  rows={3}
                  placeholder="Como posso te ajudar?"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full resize-none rounded-2xl border border-ink/10 bg-cream px-5 py-3.5 text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand px-7 py-3.5 text-center font-semibold text-cream ring-1 ring-brand-deep/30 transition-colors hover:bg-brand-deep"
                >
                  Enviar pelo WhatsApp
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="acompanhe" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-[46ch]">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-brand">
                Instagram
              </p>
              <h2 className="text-balance font-display text-3xl font-medium leading-tight md:text-4xl">
                Me acompanhe no{" "}
                <a
                  href="https://www.instagram.com/michellemacieel"
                  target="_blank"
                  rel="noreferrer"
                  className="italic text-brand transition-colors hover:text-brand-deep"
                >
                  @michellemacieel
                </a>
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              {instagramPosts.map((post) => (
                <a
                  key={post.url}
                  href={post.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block aspect-square overflow-hidden rounded-2xl bg-petal/70 sm:rounded-3xl"
                >
                  <img
                    src={post.image}
                    alt="Publicação do Instagram de Michelle Lima"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </a>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href="https://www.instagram.com/michellemacieel"
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-brand transition-colors hover:text-brand-deep"
              >
                Ver todos os posts no Instagram →
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-ink py-14 text-cream/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-3">
          <div>
            <span className="font-display text-xl font-semibold text-cream">
              Michelle Lima
            </span>
            <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-cream/60">
              Especialista em sobrancelhas.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
              Endereço & horário
            </h4>
            <p className="text-sm leading-relaxed text-cream/70">
              Avenida Central blocos 575, sala 210
              <br />
              Núcleo Bandeirante, Brasília - DF, 71710-520
            </p>
            <p className="mt-3 text-sm text-cream/70">
              Seg a Sex · 8h30 às 18h
              <br />
              Sáb · 8h30 às 16h
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-cream/50">
              Acompanhe
            </h4>
            <div className="flex flex-col gap-2 text-sm text-cream/70">
              <a
                href="https://www.instagram.com/michellemacieel"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-cream"
              >
                Instagram
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-cream"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-12 max-w-6xl px-6 text-xs text-cream/40">
          © {new Date().getFullYear()} Michelle Lima Especialista em
          Sobrancelhas. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
