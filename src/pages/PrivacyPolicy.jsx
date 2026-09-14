import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-10 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-[#4FAF9D]">
            SparkSales
          </p>

          <h1 className="mt-2 text-4xl font-bold text-[#063D35]">
            Privacy Policy
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

      {/* Policy Sections */}
      <div className="space-y-8">
        <PolicySection
          title="1. Introduction"
          text="SparkSales ('we', 'us', 'our') is a focused, event-specific financial service that helps student entrepreneurs understand their revenue, expenses, and real profit, while creating a clear and transparent 
          revenue model for the SparkSales team. We respect the privacy of our Users and are committed to protecting the personal and business information you share with us in connection with National Entrepreneurship Day (16 September 2026). 
          This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data. We process personal information in accordance with the Protection of Personal Information Act (POPIA) and other applicable South African laws."
        />

        <PolicySection
          title="2. Information We Collect"
          text="We may collect the following categories of information: (a) Account Information such as your name, email address, business name, contact details and login credentials; (b) Financial Data you input such as Sales figures, Expenses, calculated Gross Profit/Loss, and Commission owed; and (c) Technical Data such as IP address, device/browser type, log data and usage patterns on the Platform."
        />

        <PolicySection
          title="3. How We Use Your Information"
          text="We use collected information to: provide and operate the Platform's core functionality (recording sales and expenses, and calculating profit and commission); communicate with you about your account, updates, or support queries; send you service-related notifications such as account alerts; improve and maintain the Platform; comply with legal and tax obligations; and detect and prevent fraud or misuse of the Platform."
        />

        <PolicySection
          title="4. Legal Basis for Processing (POPIA)"
          text="We process your personal information based on: (a) your consent, given when you register an account; (b) the necessity of processing to perform our contract with you, namely providing the service; and (c) compliance with legal obligations, such as tax and financial record-keeping laws. Where we rely on consent, you have the right to withdraw it at any time, subject to legal limitations."
        />

        <PolicySection
          title="5. Sharing of Information"
          text="We do not sell your personal or business financial data to third parties. We may share data with: (a) cloud hosting and service providers, to store and operate the Platform; and (b) regulators or law enforcement, where required by law. Any third party we share data with is required to protect it to a standard consistent with this Policy and under written confidentiality agreements."
        />

        <PolicySection
          title="6. Data Security"
          text="We implement reasonable technical and organisational measures to protect your data against unauthorised access, loss, or misuse. These measures include encryption of data in transit and access controls on our systems. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security."
        />

        <PolicySection
          title="7. Data Retention"
          text="We retain your account and financial information for as long as your account remains active. You may request deletion of your account and data at any time via your account settings, and we will act on that request, subject to any information we are required by law to retain."
        />

        <PolicySection
          title="8. Your Rights"
          text="Under POPIA, you have the right to: (a) request access to the personal information we hold about you; (b) request correction of inaccurate or incomplete information; (c) request deletion of your information, subject to our legal retention obligations; (d) object to certain types of processing; and (e) lodge a complaint with the Information Regulator of South Africa. To exercise these rights, contact us using the details in Clause 11."
        />

        <PolicySection
          title="9. Cookies and Tracking"
          text="SparkSales does not use cookies, analytics tools, tracking pixels or any other third-party tracking technologies on the Platform. We do not track your browsing behaviour. If this changes in the future, we will update this Policy and notify you before any such technologies are introduced."
        />

        <PolicySection
          title="10. Eligibility"
          text="SparkSales is intended for use by individuals who are 18 years or older. By creating an account, you confirm that you meet this requirement."
        />

        <PolicySection
          title="11. Changes to This Policy"
          text="We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notification. Continued use of the Platform after changes take effect constitutes acceptance of the updated policy."
        />

        <PolicySection
          title="12. Contact Us"
          text="For privacy-related questions or requests, contact the SparkSales team."
        />
      </div>
    </div>
  );
};

const PolicySection = ({ title, text }) => {
  return (
    <section>
      <h2 className="text-lg font-bold text-[#063D35]">{title}</h2>
      <p className="mt-2 leading-relaxed text-gray-600">{text}</p>
    </section>
  );
};

export default PrivacyPolicy;
