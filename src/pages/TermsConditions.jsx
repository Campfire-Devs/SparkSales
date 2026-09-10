const TermsConditions = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-5 py-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#4FAF9D]">
          SparkSales
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[#063D35]">
          Terms & Conditions
        </h1>

        <p className="mt-3 text-gray-500">Last updated: September 2026</p>
      </div>

      <div className="rounded-2xl border border-[#7FCFC0]/40 bg-[#E6F7F3] p-5 text-sm leading-6 text-[#063D35]">
        <strong>Important:</strong> This is a starting draft and should be
        reviewed before being published or relied upon commercially.
      </div>

      <TermsSection
        title="1. Introduction"
        text="These Terms govern the use of SparkSales by student entrepreneurs using the platform to record sales, expenses and financial results."
      />

      <TermsSection
        title="2. Description of Service"
        text="SparkSales provides tools for recording sales and expenses and calculating revenue, gross profit or loss, commission and final profit or loss. It is not a substitute for professional accounting, tax or financial advice."
      />

      <TermsSection
        title="3. Commission"
        text="The planned SparkSales commission is 5% of Gross Profit, where Gross Profit is calculated as Total Sales minus Total Expenses. The final commission collection process must be confirmed before production use."
      />

      <TermsSection
        title="4. User Obligations"
        text="Users are responsible for entering accurate financial information, protecting their login credentials and not intentionally manipulating records to avoid applicable commission."
      />

      <TermsSection
        title="5. Data and Privacy"
        text="Use of SparkSales is also subject to the SparkSales Privacy Policy."
      />

      <TermsSection
        title="6. Limitation of Liability"
        text="SparkSales calculations depend on information supplied by users. The platform is not responsible for losses caused by inaccurate information supplied by users or circumstances that cannot lawfully be excluded."
      />

      <TermsSection
        title="7. Suspension and Termination"
        text="Accounts may be suspended or terminated for serious misuse, fraudulent activity, breach of these Terms or other circumstances permitted by applicable law."
      />

      <TermsSection
        title="8. Disputes"
        text="Users should raise disputes concerning calculations or account matters through the official SparkSales support channel."
      />

      <TermsSection
        title="9. Changes"
        text="SparkSales may update these Terms from time to time and will communicate material changes through appropriate channels."
      />

      <TermsSection
        title="10. Governing Law"
        text="These Terms are intended to operate under the laws of the Republic of South Africa, subject to final legal review."
      />

      <TermsSection
        title="11. Contact"
        text="Questions regarding these Terms should be directed to the SparkSales team using the official contact details provided by the platform."
      />
    </div>
  );
};

const TermsSection = ({ title, text }) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#063D35]">{title}</h2>

      <p className="mt-3 leading-7 text-gray-600">{text}</p>
    </section>
  );
};

export default TermsConditions;
