// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

const Section = ({ number, title, children }) => (
  <div className="mb-6">
    <h2 className="text-sm font-semibold text-foreground mb-2">{number}. {title}</h2>
    <div className="text-xs text-muted-foreground leading-relaxed space-y-1">{children}</div>
  </div>
);

const Bullet = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export default function AcceptTerms() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = React.useRef(null);

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = async () => {
    setIsLoading(true);
    const now = new Date().toISOString();
    navigate(createPageUrl('Home'));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-sky-400 via-sky-500 to-teal-500 px-4 py-6 flex-shrink-0">
        <div className="flex items-center justify-center mb-4">
          <img
            src="/src/assets/icon.svg"
            alt="SkyLine Logo"
            className="h-16 w-auto object-contain"
          />
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-white/90" />
            <h2 className="text-lg font-semibold text-white">Terms & Privacy</h2>
          </div>
          <p className="text-white/80 text-sm">Please read and accept before continuing</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full"
      >
        {/* Visa Disclaimer */}
        <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            ⚠️ Visa information is provided for guidance only.
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Always verify requirements with official government sources, embassies, or immigration authorities before making travel plans.
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-1">Privacy Policy</h2>
          <p className="text-xs text-muted-foreground mb-4">Effective Date: March 10, 2026 · SkyLine · <a href="mailto:support@skyline.com" className="text-sky-600 hover:underline">support@skyline.com</a></p>

          <Section number="1" title="Introduction">
            <p>SkyLine ("we", "our", or "us") operates the SkyLine mobile application, designed to help travelers understand visa requirements and travel opportunities based on their passport and visa status.</p>
            <p>We are committed to protecting your privacy. By using SkyLine, you agree to this Privacy Policy.</p>
          </Section>

          <Section number="2" title="Information We Collect">
            <p className="font-medium text-foreground">Account Information (Stored on Our Servers)</p>
            <Bullet>Email address</Bullet>
            <Bullet>Encrypted password</Bullet>
            <Bullet>Account ID</Bullet>
            <p className="font-medium text-foreground mt-3">Passport & Visa Information (Stored Locally)</p>
            <p>Stored only on your device. We do NOT collect passport numbers, scans, government IDs, or biometric data.</p>
          </Section>

          <Section number="3" title="How We Use Your Information">
            <Bullet>Provide visa eligibility results</Bullet>
            <Bullet>Show travel opportunities based on passport strength</Bullet>
            <Bullet>Improve app performance</Bullet>
            <p className="mt-2 font-medium text-foreground">SkyLine does not sell or rent user data.</p>
          </Section>

          <Section number="4" title="Data Storage & Security">
            <p>We implement industry-standard safeguards including encrypted data transmission (HTTPS) and secure authentication. Passport and visa information remains locally stored on your device.</p>
          </Section>

          <Section number="5" title="Data Retention">
            <p>We retain account data while your account is active or until you request deletion. Contact: <a href="mailto:support@Skylineflights.com" className="text-sky-600 hover:underline">support@Skylineflights.com</a></p>
          </Section>
        </div>

        <div className="border-t border-border my-6" />

        {/* Terms */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-1">Terms & Conditions</h2>
          <p className="text-xs text-muted-foreground mb-4">Effective Date: March 10, 2026</p>

          <Section number="1" title="Description of Service">
            <p>Skyline provides travel information regarding visa requirements and eligibility insights. The service is <strong>informational only</strong>.</p>
          </Section>

          <Section number="2" title="Acceptable Use">
            <Bullet>Do not reverse engineer the application</Bullet>
            <Bullet>Do not use the service for unlawful purposes</Bullet>
            <Bullet>Do not misrepresent passport or visa status</Bullet>
          </Section>

          <Section number="3" title="Travel & Visa Disclaimer">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-300 font-medium">Important Notice</p>
              <p className="text-red-700 dark:text-red-400 mt-1">Skyline provides informational guidance only. Visa policies change frequently. Users must verify requirements with official government websites or embassies before travel.</p>
            </div>
          </Section>

          <Section number="4" title="Limitation of Liability">
            <p>Skyline shall not be liable for denied boarding, visa rejection, immigration refusal, or travel losses resulting from reliance on app information. All travel decisions remain the user's responsibility.</p>
          </Section>
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="flex flex-col items-center gap-1 mt-4 text-muted-foreground"
          >
            <ChevronDown className="w-5 h-5" />
            <span className="text-xs">Scroll to read all</span>
          </motion.div>
        )}
      </div>

      {/* Accept footer */}
      <div className="flex-shrink-0 border-t border-border bg-background px-4 py-4 space-y-3" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAccepted(!accepted)}
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              accepted ? 'bg-sky-500 border-sky-500' : 'border-border bg-background'
            }`}
          >
            {accepted && <CheckCircle className="w-4 h-4 text-white" />}
          </div>
          <span className="text-sm text-foreground leading-snug">
            I have read and agree to the <strong>Privacy Policy</strong> and <strong>Terms & Conditions</strong> of Skyline.
          </span>
        </label>

        <Button
          onClick={handleAccept}
          disabled={!accepted || isLoading}
          className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-semibold h-12 text-base disabled:opacity-50"
        >
          {isLoading ? 'Please wait…' : 'Accept & Continue'}
        </Button>
      </div>
    </div>
  );
}