import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import BottomNav from '@/components/BottomNav';

const Section = ({ number, title, children }) => (
  <div className="mb-8">
    <h2 className="text-lg font-semibold text-foreground mb-3">{number}. {title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </div>
);

const Bullet = ({ children }) => (
  <div className="flex items-start gap-2">
    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
    <span>{children}</span>
  </div>
);

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-600" />
          <h1 className="text-lg font-semibold">Privacy Policy & Terms</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Visa Disclaimer Banner */}
        <div className="mb-8 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            ⚠️ Visa information is provided for guidance only.
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            Always verify requirements with official government sources, embassies, or immigration authorities before making travel plans.
          </p>
        </div>

        {/* Privacy Policy */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-xs text-muted-foreground mb-6">Effective Date: March 10, 2026 · Skyline · Jamaica · <a href="mailto:customersupport@Skyline-flights.com" className="text-amber-600 hover:underline">customersupport@Skyline-flights.com</a></p>

          <Section number="1" title="Introduction">
            <p>Skyline operates the Skyline mobile application, designed to help travelers understand visa requirements and travel opportunities based on their passport and visa status.</p>
            <p>We are committed to protecting your privacy and ensuring transparency regarding how your information is handled. By using Skyline, you agree to this Privacy Policy.</p>
          </Section>

          <Section number="2" title="Information We Collect">
            <p className="font-medium text-foreground">Account Information (Stored on Our Servers)</p>
            <p>When you create an account we collect:</p>
            <Bullet>Email address</Bullet>
            <Bullet>Encrypted password</Bullet>
            <Bullet>Account ID</Bullet>

            <p className="font-medium text-foreground mt-4">Passport & Visa Information (Stored Locally)</p>
            <p>Users may enter passport country and countries where they hold valid visas. This information is stored <strong>only on the user's device</strong>.</p>
            <p>Skyline does NOT collect, transmit, or store:</p>
            <Bullet>Passport numbers</Bullet>
            <Bullet>Passport photos or scans</Bullet>
            <Bullet>Government ID numbers</Bullet>
            <Bullet>Biometric data</Bullet>

            <p className="font-medium text-foreground mt-4">Device & Technical Information</p>
            <p>We may automatically collect device type, operating system, app version, crash reports, and anonymous analytics to improve reliability and performance.</p>
          </Section>

          <Section number="3" title="How We Use Your Information">
            <p>We use collected information to:</p>
            <Bullet>Provide visa eligibility results</Bullet>
            <Bullet>Show travel opportunities based on passport strength</Bullet>
            <Bullet>Improve app performance</Bullet>
            <Bullet>Provide support and maintain account security</Bullet>
            <p className="mt-2 font-medium text-foreground">Skyline does not sell or rent user data.</p>
          </Section>

          <Section number="4" title="Data Storage & Security">
            <p>We implement industry-standard safeguards including encrypted data transmission (HTTPS), secure authentication systems, and restricted access to server data. Passport and visa information remains locally stored on your device, reducing exposure risk.</p>
            <p>However, no system is completely secure.</p>
          </Section>

          <Section number="5" title="Data Retention">
            <p>We retain account data while your account is active or until you request deletion. To request deletion contact: <a href="mailto:customersupport@Skyline-flights.com" className="text-amber-600 hover:underline">customersupport@Skyline-flights.com</a></p>
            <p>Local passport and visa data can be deleted anytime by uninstalling the app.</p>
          </Section>

          <Section number="6" title="Third-Party Services">
            <p>Skyline may use trusted providers for cloud hosting, authentication, and analytics. These providers only process data necessary to provide their services.</p>
          </Section>

          <Section number="7" title="International Users">
            <p>Skyline is operated from Jamaica. If you access the app from outside Jamaica, your information may be processed in other jurisdictions where our infrastructure operates.</p>
          </Section>

          <Section number="8" title="Children's Privacy">
            <p>Skyline is not intended for individuals under 13 years old. We do not knowingly collect personal information from children.</p>
          </Section>

          <Section number="9" title="Policy Updates">
            <p>We may update this Privacy Policy periodically. Users will be notified of significant changes within the app.</p>
          </Section>

          <Section number="10" title="Contact">
            <p>Skyline · Jamaica</p>
            <p>Email: <a href="mailto:customersupport@Skyline-flights.com" className="text-amber-600 hover:underline">customersupport@Skyline-flights.com</a></p>
          </Section>
        </div>

        <div className="border-t border-border my-10" />

        {/* Terms & Conditions */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Terms & Conditions</h1>
          <p className="text-xs text-muted-foreground mb-6">Effective Date: March 10, 2026</p>
          <p className="text-sm text-muted-foreground mb-6">By accessing or using the Skyline application you agree to the following terms.</p>

          <Section number="1" title="Description of Service">
            <p>Skyline provides travel information regarding visa requirements, visa-free destinations, and travel eligibility insights based on passport and visa information. The service is <strong>informational only</strong>.</p>
          </Section>

          <Section number="2" title="User Accounts">
            <p>Users must create an account using a valid email address. Users are responsible for maintaining password security and all activity under their account. Skyline may suspend accounts for misuse or fraud.</p>
          </Section>

          <Section number="3" title="Acceptable Use">
            <p>You agree not to:</p>
            <Bullet>Reverse engineer the application</Bullet>
            <Bullet>Use the service for unlawful purposes</Bullet>
            <Bullet>Attempt to access restricted systems</Bullet>
            <Bullet>Misrepresent passport or visa status</Bullet>
          </Section>

          <Section number="4" title="Intellectual Property">
            <p>All content including software, design, branding, and algorithms are the property of Skyline and protected by intellectual property laws.</p>
          </Section>

          <Section number="5" title="Travel & Visa Disclaimer">
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 mb-3">
              <p className="text-red-800 dark:text-red-300 font-medium text-xs">Important Notice</p>
              <p className="text-red-700 dark:text-red-400 text-xs mt-1">Skyline provides informational guidance only. Visa policies change frequently and may vary depending on travel purpose, length of stay, airline requirements, and immigration discretion. Users must verify visa requirements with official government websites, embassies, or immigration authorities before making travel plans.</p>
            </div>
          </Section>

          <Section number="6" title="Limitation of Liability">
            <p>To the maximum extent permitted by law, Skyline shall not be liable for denied boarding, visa rejection, immigration refusal, travel losses, or financial damages resulting from reliance on app information. All travel decisions remain the responsibility of the user.</p>
          </Section>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}