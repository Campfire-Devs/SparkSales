import { Link } from "react-router-dom";

const TermsConditions = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#4FAF9D]">
            SparkSales
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#063D35]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-3 text-gray-500">Last updated: September 2026</p>
        </div>

        {/* Return Button */}
        <Link
          to="/dashboard"
          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-[#063D35] rounded-md hover:bg-[#045247] focus:ring-1 focus:ring-[#063D35] focus:outline-none transition"
        >
          ← Dashboard
        </Link>
      </div>

      {/* Terms Sections */}
      <div className="space-y-8">
        <TermsSection
          title="1. Introduction"
          text="SparkSales is an event-specific financial tracking service that helps student entrepreneurs understand their revenue, expenses and real profit. These Terms govern your use of the SparkSales platform, website and related services (collectively, 'the Platform'). By creating an account or using the Platform, you agree to be bound by these Terms. If you do not agree, you may not use the Platform."
        />

        <TermsSection
          title="2. Description of Service"
          text="The Platform allows registered users to record sales and expenses and to calculate gross profit or loss, commission and final profit or loss. SparkSales is a record-keeping and calculation tool only. It is not a substitute for professional accounting, tax or financial advice, and we do not guarantee the accuracy of any figures beyond the calculations performed on the data you input."
        />

        <TermsSection
          title="3. Commission"
          text="SparkSales applies a commission based on Gross Profit, currently starting at 5% (five percent), as shown in your account settings. Gross Profit is calculated as Total Sales minus Total Expenses. Users agree to enter accurate and complete data; we reserve the right to investigate and adjust commission where there is reasonable suspicion of inaccurate or manipulated records. The process for collecting commission will be confirmed and communicated before these Terms apply to any real payment obligation."
        />

        <TermsSection
          title="4. User Obligations"
          text="You are responsible for entering accurate financial information, protecting your login credentials and not intentionally manipulating records to avoid applicable commission. By creating an account, you confirm that you are 18 years of age or older."
        />

        <TermsSection
          title="5. Data and Privacy"
          text="Your use of SparkSales is also subject to the SparkSales Privacy Policy, which explains how we collect, store and use your data in compliance with the Protection of Personal Information Act (POPIA). Financial data you enter belongs to you. We do not sell your business data to third parties. You can request deletion of your account and data at any time via your account settings, and we will process that request."
        />

        <TermsSection
          title="6. Limitation of Liability"
          text="SparkSales calculations depend on information supplied by users. We are not liable for losses caused by inaccurate information supplied by users, technical errors, downtime or circumstances that cannot lawfully be excluded. To the maximum extent permitted by law, our total liability to you is limited to the total commission fees paid by you in the three (3) months preceding the claim. Nothing in these Terms limits liability for gross negligence or fraud."
        />

        <TermsSection
          title="7. Suspension and Termination"
          text="Accounts may be suspended or terminated for serious misuse, fraudulent activity, breach of these Terms or other circumstances permitted by applicable law. You may close your account at any time via your account settings or by contacting us."
        />

        <TermsSection
          title="8. Disputes"
          text="If you have concerns about a commission calculation, you should raise this with the SparkSales team as soon as possible, with supporting details of the issue. We will investigate disputes in good faith. Unresolved disputes will be handled in accordance with Clause 10 (Governing Law)."
        />

        <TermsSection
          title="9. Changes"
          text="SparkSales may update these Terms from time to time and will communicate material changes through appropriate channels, such as email or in-app notification. Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms."
        />

        <TermsSection
          title="10. Governing Law"
          text="These Terms are intended to operate under the laws of the Republic of South Africa, subject to final legal review."
        />

        <TermsSection
          title="11. Contact"
          text="Questions regarding these Terms should be directed to the SparkSales team."
        />
      </div>
    </div>
  );
};

const TermsSection = ({ title, text }) => {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#063D35]">{title}</h2>
      <p className="mt-2 leading-relaxed text-gray-600">{text}</p>
    </section>
  );
};

export default TermsConditions;
