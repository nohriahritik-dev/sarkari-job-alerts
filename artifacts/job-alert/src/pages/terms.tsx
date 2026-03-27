import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle } from "lucide-react";

const sections = [
  {
    title: "Important Disclaimer",
    content: `This application is privately developed and operated by Netra Lata. We are not affiliated with, endorsed by, or connected to any official government body. All job information is sourced from publicly available official government websites.`,
  },
  {
    title: "Data Sources",
    content: `Job information displayed in this app is sourced from publicly available official government websites. We are not affiliated with, endorsed by, or connected to any government body. These sources may include official government recruitment portals, gazettes, and other publicly available official publications. The information provided should be treated as reference information only and must be independently verified before being relied upon.`,
  },
  {
    title: "Data Refresh & Sync Policy",
    content: `The database refreshes every 4 hours. During refresh cycles, application data may change — jobs may be added or removed. Users are strongly advised to download, bookmark, or screenshot any listed recruitment notification to save for later reference.`,
  },
  {
    title: "Accuracy & Limitations",
    content: `Despite our best efforts to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or timeliness of any information displayed. Information provided should be treated as reference only and must be independently verified before being relied upon.`,
  },
  {
    title: "User Responsibility",
    content: null,
    list: [
      "Reading all details on the official notification before applying",
      "Verifying all eligibility criteria before beginning any application",
      "Confirming eligibility, criteria, important dates, and all other details on the official government website before commencing any application",
      "Downloading and reading the official PDF notification",
      "Checking if any date has changed before applying",
    ],
  },
  {
    title: "Limitation of Liability",
    content: "The app and its owners are NOT responsible for:",
    list: [
      "Application submission errors",
      "Missed deadlines due to outdated information",
      "Financial losses resulting from incorrect information",
      "Incomplete or inaccurate information",
    ],
  },
  {
    title: "Purpose",
    content: `This app is for informational purposes only. It aims to help users discover government job opportunities in India. We do not endorse or guarantee the accuracy, security, or legitimacy of any third-party sites you access using links within it. You access such links at your own risk.`,
  },
  {
    title: "External Links & Third-Party Websites",
    content: `This app may contain links to external government websites and portals. We do not guarantee the accuracy, security, or legitimacy of any third-party websites you access via such links. You access such links entirely at your own risk.`,
  },
  {
    title: "Government Changes & Updates",
    content: `Government job vacancies and information — including eligibility criteria, application deadlines, and vacancy counts — can be changed or withdrawn by authorities at any time without prior notice. While we strive to keep information current, we are not responsible for any changes or modifications made by the concerned government authorities.`,
  },
  {
    title: "Push Notifications Disclaimer",
    content: `The app may offer push notifications as a convenience feature. Delivery of notifications may be affected by device settings, operating system notification blocking, user preferences, network restrictions, or other technical factors outside our control.`,
  },
  {
    title: "Technical Errors & App Limitations",
    content: `While we work continuously to provide an error-free experience, technical errors or inaccuracies may occur from time to time. We may update or improve this app without prior notification. We are not responsible for any losses arising from such technical limitations or third-party dependencies.`,
  },
  {
    title: "Advertisements & Third-Party Services",
    content: `The app and website may display advertisements powered by Google AdSense, Google AdMob, or similar platforms. We are not responsible for the content of these advertisements. Users interact with such ads entirely at their own risk.`,
  },
  {
    title: "Internet Dependency",
    content: `The app requires an active internet connection to function correctly. We are not responsible for incomplete, delayed, or outdated information caused by poor connectivity, server downtime, or third-party service restrictions.`,
  },
  {
    title: "Modifications",
    content: `We reserve the right to modify these Terms & Conditions at any time without prior notice. Continued use of the app or website following any changes constitutes your acceptance of the updated terms.`,
  },
  {
    title: "No Government Affiliation or Endorsement",
    content: `Use of government department names, recruitment body names, or references to official logos is strictly for informational purposes only. This does not imply any official affiliation with, endorsement by, or approval from any government authority or body.`,
  },
  {
    title: "Final Liability Statement",
    content: `By using this app or website, you acknowledge and agree that the services and content are provided "as is" and "as available" without any warranties, expressed or implied. You understand and accept the risks of using this service. All job data, descriptions, and other information are sourced from official government websites and must be independently verified by the user through the official links provided.`,
  },
];

export default function TermsPage() {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-[#0A1628] pt-32 pb-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-5">
              <ShieldCheck className="w-4 h-4" />
              Legal
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-white/60 text-sm max-w-xl mx-auto">
              Last updated: March 2026 &nbsp;·&nbsp; Developed and operated by Netra Lata
            </p>
          </motion.div>
        </div>
      </section>

      {/* Disclaimer banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground/80">
            This application is privately developed and operated by <strong>Netra Lata</strong>. We are
            not affiliated with, endorsed by, or connected to any official government body. All job
            information is sourced from publicly available official government websites.
          </p>
        </div>
      </div>

      {/* Content */}
      <section className="py-14 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="border border-border rounded-2xl bg-card p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <h2 className="text-lg font-display font-bold text-foreground">{section.title}</h2>
              </div>

              {section.content && (
                <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
              )}

              {section.list && (
                <ul className="mt-3 space-y-2">
                  {section.list.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}

          <p className="text-center text-xs text-muted-foreground pt-4">
            For any questions regarding these terms, please contact us through the app.
          </p>
        </div>
      </section>
    </Layout>
  );
}
