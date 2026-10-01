import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  robots: { index: false, follow: false },
};

const UPDATED = "September 30, 2026";

export default function PrivacyPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Privacy Policy" updated={UPDATED}>
      <p>
        Great Escape (&quot;Great Escape,&quot; &quot;we,&quot; &quot;us,&quot;
        or &quot;our&quot;) operates greatescape.studio (the &quot;Site&quot;)
        and the design services we sell through it (the
        &quot;Services&quot;). This Privacy Policy explains what information
        we collect, how we use it, and the choices you have.
      </p>
      <p>
        By using the Site or purchasing a Service, you agree to the
        collection and use of information in accordance with this policy.
      </p>

      <LegalSection title="1. Information We Collect">
        <p>We collect information you give us directly, including:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="text-paper">Contact details</span> — your name,
            email address, and company name, submitted when you start a
            project with us.
          </li>
          <li>
            <span className="text-paper">Project content</span> — brand
            guidelines, existing product files, inspiration links, and any
            notes or briefs you upload or write to describe your project.
          </li>
          <li>
            <span className="text-paper">Payment information</span> — when
            you pay for a Service, payment is processed entirely by Stripe.
            We never see or store your full card number, and we don&apos;t
            touch your payment details directly — see &quot;Payment
            Processing&quot; below.
          </li>
          <li>
            <span className="text-paper">Feedback and communications</span> —
            messages, revision requests, and any video links you submit
            through your project page, or emails you send us.
          </li>
        </ul>
        <p>
          We also automatically receive standard technical information when
          you visit the Site (such as IP address and browser type) through
          our hosting provider&apos;s server logs, for security and abuse
          prevention. We do not currently use any analytics or advertising
          trackers on the Site.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To deliver the Service you purchased — designing and building your website, app, or pitch deck.</li>
          <li>To communicate with you about your project&apos;s status, request clarification, and respond to your feedback.</li>
          <li>To process payment and send order confirmations and receipts.</li>
          <li>To schedule calls when you request one.</li>
          <li>To maintain records of completed work for our own business and portfolio purposes.</li>
          <li>To detect and prevent fraud, abuse, or security issues.</li>
        </ul>
        <p>We do not sell your personal information, and we do not use it for advertising.</p>
      </LegalSection>

      <LegalSection title="3. Payment Processing">
        <p>
          All payments are handled by Stripe, Inc. When you pay for a
          Service, your card details go directly to Stripe — they never pass
          through our servers. Stripe&apos;s use of your information is
          governed by{" "}
          <a
            href="https://stripe.com/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-coral hover:underline"
          >
            Stripe&apos;s own privacy policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="4. Who We Share Information With">
        <p>
          We don&apos;t sell or rent your information. We share it only with
          the service providers that help us run Great Escape, each acting
          on our behalf:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li><span className="text-paper">Stripe</span> — payment processing.</li>
          <li><span className="text-paper">Resend</span> — sending transactional emails (confirmations, updates, delivery notices).</li>
          <li><span className="text-paper">Vercel</span> — website hosting, and storage for files you upload (brand guidelines, product files).</li>
          <li><span className="text-paper">Neon</span> — database hosting for your project records.</li>
          <li><span className="text-paper">Calendly</span> — if you choose to book a call, scheduling is handled by Calendly under its own terms.</li>
        </ul>
        <p>
          We may also disclose information if required by law, or to protect
          the rights, property, or safety of Great Escape, our clients, or
          others.
        </p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>
          The public Site and your project page do not set tracking or
          advertising cookies. Our internal studio dashboard uses a single,
          strictly necessary session cookie to keep our team logged in — it
          is not used to track clients or visitors, and clients never
          receive it.
        </p>
      </LegalSection>

      <LegalSection title="6. Data Retention">
        <p>
          We keep project records (your contact details, brief, files, and
          communications) for as long as reasonably necessary to deliver the
          Service, support any revisions, maintain our business records, and
          comply with legal or tax obligations. You can request deletion at
          any time — see &quot;Your Rights&quot; below.
        </p>
      </LegalSection>

      <LegalSection title="7. Your Rights">
        <p>
          Depending on where you live, you may have the right to access,
          correct, or request deletion of your personal information, or to
          object to or restrict certain processing. To exercise any of
          these rights, email us at{" "}
          <a href="mailto:hello@greatescape.studio" className="text-coral hover:underline">
            hello@greatescape.studio
          </a>
          . We&apos;ll respond within a reasonable time.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's Privacy">
        <p>
          The Site and Services are intended for businesses and individuals
          over the age of 18. We do not knowingly collect information from
          children.
        </p>
      </LegalSection>

      <LegalSection title="9. Data Security">
        <p>
          We take reasonable technical measures to protect your information,
          including encrypted connections (HTTPS), access-controlled admin
          tools, and reputable third-party infrastructure providers. No
          method of transmission or storage is 100% secure, and we can&apos;t
          guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we&apos;ll update the &quot;Last updated&quot;
          date above. Continued use of the Site after changes means you
          accept the revised policy.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact Us">
        <p>
          Questions about this policy or your information? Email us at{" "}
          <a href="mailto:hello@greatescape.studio" className="text-coral hover:underline">
            hello@greatescape.studio
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
