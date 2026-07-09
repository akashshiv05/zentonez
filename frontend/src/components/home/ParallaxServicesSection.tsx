import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";

import skinImage from "../../assets/facialwebpimages/facial6.png";
import facialImage from "../../assets/facialwebpimages/facial2.webp";
import manicureImage from "../../assets/pedicurewebpimages/manicure1.webp";
import hairSpaImage from "../../assets/hairspawebpimages/hairspa3.webp";
import bridalImage from "../../assets/bridalwebpimages/bridal1.webp";
import nailImage from "../../assets/nailwebpimages/nail.jpeg";
import liceImage from "../../assets/licewebpimages/lice1.webp";
import hairStyleImage from "../../assets/hairwebp images/curlyhairstyle.webp";
import wartRemovalImage from "../../assets/wartremovalwebpimages/wartdarkimg1.webp";
import earPiercingImage from "../../assets/earpiercingimages/earpiercing.webp";
import { ParallaxArrow } from "../ScrollParallaxCard/ParallaxArrow";
import { ScrollParallaxCard } from "../ScrollParallaxCard/ScrollParallaxCard";
import { ScrollReveal } from "./ScrollReveal";
import { Lightbox } from "../ui/Lightbox";
import React from "react";

interface ParallaxService {
  title: string;
  description: string;
  image: string;
  price: string;
  benefits: string[];
  color: string;
  backgroundPosition?: string;
}

const parallaxServicesFallback: ParallaxService[] = [
  {
    title: "Skin Care",
    description: "Maintain radiant and healthy skin with our personalized skincare solutions.",
    image: skinImage,
    price: "₹400",
    benefits: ["Deep Pore Cleansing", "Fruit & Glow Facials", "D-Tan Treatment", "Skin Type Analysis"],
    color: "#FB7185",
  },
  {
    title: "Facial Treatment",
    description: "Refresh and rejuvenate your skin with our advanced facial therapies.",
    image: facialImage,
    price: "₹1,150",
    benefits: ["Photo-ready Finish", "Deep Hydration", "Anti-Aging Therapy"],
    color: "#38BDF8",
  },
  {
    title: "Manicure & Pedicure",
    description: "Pamper your hands and feet with our relaxing therapies.",
    image: manicureImage,
    price: "₹519",
    benefits: ["Organic Scrub", "Deep Exfoliation", "Premium Polish"],
    color: "#FB923C",
  },
  {
    title: "Hair Care",
    description: "Revitalize your hair with nourishing spa treatments designed to repair damage.",
    image: hairSpaImage,
    price: "₹1,049",
    benefits: ["Keratin Repair", "Scalp Detox", "Hair Fall Control"],
    color: "#A78BFA",
  },
  {
    title: "Hair Styling",
    description: "Expert hair styling for every occasion, from elegant updos to modern trends.",
    image: hairStyleImage,
    price: "₹399",
    backgroundPosition: "top center",
    benefits: ["Custom Updos", "Blowout", "Event Styling"],
    color: "#F472B6",
  },
  {
    title: "Bridal Makeup",
    description: "Look stunning on your special day with our professional bridal makeup services.",
    image: bridalImage,
    price: "₹15,000",
    backgroundPosition: "top center",
    benefits: ["HD & Airbrush Makeup", "Pre-bridal Packages", "Hair Styling", "Saree Draping"],
    color: "#F43F5E",
  },
  {
    title: "Nails",
    description: "Exquisite nail art and extensions to express your unique style.",
    image: nailImage,
    price: "₹999",
    benefits: ["Gel Extensions", "Acrylic Overlays", "3D Nail Art", "Classic French Polish"],
    color: "#34D399",
  },
  {
    title: "Lice Treatment",
    description: "Gentle and effective treatments to ensure a healthy, lice-free scalp.",
    image: liceImage,
    price: "₹4,999",
    benefits: ["100% Natural Treatment", "Discreet Service", "Scalp Health Restoration"],
    color: "#FBBF24",
  },
  {
    title: "Wart Removal",
    description: "Safe and effective removal of warts using advanced dermatological techniques.",
    image: wartRemovalImage,
    price: "₹119",
    benefits: ["Painless Procedure", "Quick Recovery", "No Scarring", "Expert Care"],
    color: "#60A5FA",
  },
  {
    title: "Ear Piercing",
    description: "Safe and precise ear piercing using professional, sterilized equipment.",
    image: earPiercingImage,
    price: "₹299",
    benefits: ["Safe & Hygienic", "Expert Piercer", "Aftercare Support", "Painless Experience"],
    color: "#A78BFA",
  },
];

export function ParallaxServicesSection() {
  const [selectedImage, setSelectedImage] = React.useState<{ url: string; title: string } | null>(null);
  const [dynamicServices, setDynamicServices] = React.useState(parallaxServicesFallback);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/services`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const merged = data.map((s: any) => {
            const fallback = parallaxServicesFallback.find(f => {
              const fTitle = f.title.trim().toLowerCase();
              const sTitle = s.title?.trim().toLowerCase() || '';
              const sCat = s.category?.trim().toLowerCase() || '';
              return fTitle === sTitle || fTitle === sCat;
            }) || parallaxServicesFallback[0];
            const imageName = s.image_name || s.imageName;
            return {
              title: s.title,
              description: s.description,
              image: imageName ? `${API_BASE_URL}/api/gallery/images/${imageName}` : fallback.image,
              price: s.price,
              benefits: s.highlights ? s.highlights.split(',').map((h: string) => h.trim()) : fallback.benefits,
              color: fallback.color,
              backgroundPosition: fallback.backgroundPosition
            };
          });
          setDynamicServices(merged);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-6 tb:py-8 dt:py-10 relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 tb:px-6 dt:px-8 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-4 tb:mb-6">
            <div className="inline-flex items-center gap-2 px-4 tb:px-6 py-2 rounded-full bg-secondary/10 text-primary border border-secondary/20 shadow-sm mb-4">
              <Sparkles size={14} />
              <span className="font-bold uppercase tracking-widest text-[9px] tb:text-[10px]">
                Our Full Portfolio
              </span>
            </div>
            <h2 className="text-section-title font-black text-on-surface mb-4 tb:mb-6 uppercase tracking-tighter font-serif leading-tight">
              Everything You Need to <br className="hidden tb:block" />
              <span className="text-primary">Shine Brighter</span>
            </h2>
            <p className="text-base tb:text-lg text-on-surface/80 max-w-xl tb:max-w-2xl mx-auto font-medium leading-relaxed px-4 mb:px-0">
              Explore our comprehensive collection of beauty therapies. From
              bridal masterpieces to routine pampering.
            </p>
          </div>
        </ScrollReveal>

        <div className="scroll-parallax-section">
          <h1 className="parallax-page__title"></h1>
          <ParallaxArrow />
          <div className="parallax-content parallax-content--alternate parallax-content--padded">
            {dynamicServices.map((service, index) => (
              <ScrollParallaxCard
                key={service.title}
                index={index}
                title={service.title}
                description={service.description}
                image={service.image}
                price={service.price}
                benefits={service.benefits}
                color={service.color}
                backgroundPosition={service.backgroundPosition}
                onImageClick={() => setSelectedImage({ url: service.image, title: service.title })}
              />
            ))}
          </div>
        </div>

        <ScrollReveal delay={0.2}>
          <div className="mt-8 tb:mt-12 dt:mt-16 text-center px-4 mb:px-0">
            <Link to="/services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-premium-gold w-full mb:w-auto px-8 py-3.5"
              >
                View Detailed Service Menu
              </motion.button>
            </Link>
          </div>
        </ScrollReveal>
      </div>

      <Lightbox
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage?.url || ""}
        title={selectedImage?.title || ""}
      />
    </section>
  );
}
