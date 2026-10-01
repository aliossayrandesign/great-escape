import type { Metadata } from "next";
import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms & Conditions — great esc.",
  robots: { index: false, follow: false },
};

const UPDATED = "September 30, 2026";

export default function TermsPage() {
  return (
    <LegalLayout eyebrow="Legal" title="Terms & Conditions" updated={UPDATED}>
      <p>
        These Terms & Conditions (&quot;Terms&quot;) govern your purchase and
        use of services from Great Escape (&quot;Great Escape,&quot;
        &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) through
        greatescape.studio (the &quot;Site&quot;). By submitting payment for a
        project, you agree to these Terms. If you don&apos;t agree, please
        don&apos;t purchase a Service.
      </p>

      <LegalSection title="1. The Services">
        <p>
          We offer three fixed-scope design packages: a Website, an App
          (interface design), and a Pitch Deck (collectively, the
          &quot;Services&quot;). Pricing for each is shown on the Site at
          the time of purchase. Each package has a defined scope — if your
          project needs more than what&apos;s described, we&apos;ll let you
          know before doing additional work, and any extra work will be
          quoted and agreed separately.
        </p>
      </LegalSection>

      <LegalSection title="2. Ordering & Payment">
        <ul className="list-disc space-y-2 pl-5">
          <li>Payment is due in full, upfront, before work begins.</li>
          <li>Payments are processed securely by Stripe; we never see your full card details.</li>
          <li>Prices are listed in US dollars and do not include any taxes that may apply to you.</li>
          <li>Your project officially starts once payment has been confirmed.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Project Process & Timeline">
        <p>
          After payment, we&apos;ll review the brief, files, and links you
          submitted. You&apos;ll receive a project page with a magic link
          where you can track status, view your deliverable once ready, and
          leave feedback. We aim to deliver a first look within one week of
          payment, but timelines can vary depending on project complexity,
          how quickly you respond to questions, and our current workload —
          they are estimates, not guarantees.
        </p>
      </LegalSection>

      <LegalSection title="4. Revisions">
        <p>
          Each package includes up to three rounds of revisions, submitted
          through your project page. Revisions are for refining what was
          delivered within the original brief — not for expanding scope
          (for example, requesting an entirely different design direction,
          additional pages/screens, or features not in the original brief).
          Requests beyond the included rounds or outside the original scope
          may require an additional quote.
        </p>
      </LegalSection>

      <LegalSection title="5. What We Need From You">
        <p>
          You&apos;re responsible for the accuracy of the brief, files,
          links, and any other content you provide, and for responding to
          our questions in a timely way — delays on your end can delay
          delivery. You confirm that you own, or have the right to use, any
          logos, brand assets, images, text, or other content you upload or
          link to us, and that it doesn&apos;t infringe anyone else&apos;s
          rights.
        </p>
      </LegalSection>

      <LegalSection title="6. Intellectual Property & Ownership">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Once your project is paid in full and delivered, you own the
            final deliverable (the finished website, app design, or pitch
            deck files) for your own use.
          </li>
          <li>
            We retain the right to showcase the work we did for you in our
            own portfolio, case studies, and marketing, unless you ask us in
            writing to keep it private.
          </li>
          <li>
            We retain ownership of our own internal tools, templates,
            processes, and any reusable components or techniques developed
            along the way that aren&apos;t specific to your brand.
          </li>
          <li>
            Any brand assets, content, or files you provided remain yours.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Cancellations & Refunds">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            If you cancel within 24 hours of payment and before we&apos;ve
            started work, you&apos;ll receive a full refund.
          </li>
          <li>
            Once work has begun, payments are non-refundable — we&apos;re a
            small studio and allocate time to your project as soon as it
            starts. Our priority instead is using your included revisions to
            get the deliverable right.
          </li>
          <li>
            If we&apos;re unable to deliver your project for reasons on our
            end, we&apos;ll refund any amount paid for work not completed.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Communication & Scheduling">
        <p>
          Feedback and revision requests go through your project page.
          You&apos;re welcome to book a call with us through the Calendly
          link provided there for anything that needs more back-and-forth
          than a written note.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers & Limitation of Liability">
        <p>
          Services are provided on an &quot;as is&quot; basis. We don&apos;t
          guarantee any particular business outcome (such as sales,
          traffic, or funding) from the deliverable we create. If you choose
          to build your project on a third-party platform (for example,
          Shopify or Framer), your use of that platform is governed by its
          own terms, and we&apos;re not responsible for that platform&apos;s
          availability, pricing, or policies.
        </p>
        <p>
          To the fullest extent permitted by law, Great Escape&apos;s total
          liability for any claim arising from the Services is limited to
          the amount you paid us for the project giving rise to the claim.
          We are not liable for indirect, incidental, or consequential
          damages.
        </p>
      </LegalSection>

      <LegalSection title="10. Termination">
        <p>
          We may decline or stop work on a project if we reasonably believe
          it&apos;s unlawful, abusive, or materially different from what was
          described at purchase — in that case, we&apos;ll refund any
          amount paid for work not yet completed.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to These Terms">
        <p>
          We may update these Terms from time to time. Changes apply to
          projects purchased after the &quot;Last updated&quot; date above;
          projects already in progress are governed by the Terms in effect
          when you paid.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing Law">
        <p>
          These Terms are governed by the laws of the state in which Great
          Escape operates, without regard to conflict-of-law principles.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p>
          Questions about these Terms? Email us at{" "}
          <a href="mailto:hello@greatescape.studio" className="text-coral hover:underline">
            hello@greatescape.studio
          </a>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
