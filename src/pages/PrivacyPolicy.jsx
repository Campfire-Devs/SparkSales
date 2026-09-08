const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-5 py-2">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-[#4FAF9D]">
          SparkSales
        </p>

        <h1 className="mt-2 text-4xl font-bold text-[#063D35]">
          Privacy Policy
        </h1>

        <p className="mt-3 text-gray-500">Last updated: September 2026</p>
      </div>

      <div className="rounded-2xl border border-[#7FCFC0]/40 bg-[#E6F7F3] p-5 text-sm leading-6 text-[#063D35]">
        <strong>Important:</strong> This document is a starting draft and is not
        legal advice. It should be reviewed before SparkSales is used
        commercially.
      </div>

      <PolicySection
        title="1. Introduction"
        text={`SparkSales ("we", "us", "our") is an event-focused financial service
        designed to help student entrepreneurs understand their revenue,
        expenses and profit while participating in Entrepreneurship Day.`}
      />

      <PolicySection
        title="2. Information We Collect"
        text="We may collect account information, business information, financial data entered into the platform, payment information required for commission collection, and technical information required to operate and secure the platform."
      />

      <PolicySection
        title="3. How We Use Your Information"
        text="Information is used to provide the platform, record sales and expenses, calculate profit and commission, communicate with users, improve the platform, comply with legal obligations, and prevent fraud or misuse."
      />

      <PolicySection
        title="4. Legal Basis for Processing"
        text="Personal information may be processed based on consent, the performance of our service relationship, and applicable legal obligations."
      />

      <PolicySection
        title="5. Sharing of Information"
        text="SparkSales does not sell user business or financial data. Information may be shared with service providers, payment processors, or authorities where legally required."
      />

      <PolicySection
        title="6. Data Security"
        text="Reasonable technical and organisational measures will be used to protect information from unauthorised access, loss or misuse."
      />

      <PolicySection
        title="7. Data Retention"
        text="Account and financial information will be retained according to the operational, legal and dispute-resolution requirements applicable to SparkSales."
      />

      <PolicySection
        title="8. Your Rights"
        text="Users may have rights to request access to, correction of, or deletion of their personal information, subject to applicable legal requirements."
      />

      <PolicySection
        title="9. Cookies and Tracking"
        text="Any cookies, analytics or tracking technologies used by SparkSales will be disclosed here before production launch."
      />

      <PolicySection
        title="10. Changes to This Policy"
        text="SparkSales may update this policy from time to time. Material changes will be communicated through appropriate channels."
      />

      <PolicySection
        title="11. Contact Us"
        text="Privacy-related questions or requests should be directed to the SparkSales team using the official contact details provided by the platform."
      />
    </div>
  );
};

const PolicySection = ({ title, text }) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#063D35]">{title}</h2>

      <p className="mt-3 leading-7 text-gray-600">{text}</p>
    </section>
  );
};

export default PrivacyPolicy;
