import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Card from '../components/ui/Card'
import { MAX_WIDTH, SECTION_PADDING } from '../design-system/tokens'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className={`${SECTION_PADDING} pt-32 ${MAX_WIDTH}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <p className="text-label-lg text-neutral-500 tracking-widest uppercase mb-6">
            GSMA AFRICA IGNITE HACKATHON
          </p>
          <h1 className="font-instrument text-display-xl text-neutral-900 max-w-3xl mx-auto">
            Mobile money fraud stops here.
          </h1>
          <p className="text-body-lg text-neutral-500 mt-6 max-w-2xl mx-auto">
            SafeSwitch intercepts high-risk transactions before they complete — using live telecom signals from Nokia's Network as Code platform, combined with an on-device reasoning engine that evaluates risk in under two seconds.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <Link to="/demo">
              <Button size="lg">Try the Live Demo</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary" size="lg">Read the Architecture</Button>
            </a>
          </div>

          {/* Stats Bar */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-10 border-t border-neutral-200 flex flex-col sm:flex-row justify-center gap-6 sm:gap-12">
            {[
              { value: '$3.4M', label: 'stolen in Rwanda, March 2026' },
              { value: '43%', label: 'of fraud via SIM swap' },
              { value: '<2s', label: 'SafeSwitch response time' },
            ].map((stat, i) => (
              <div key={i} className={`${i > 0 ? 'sm:pl-6 sm:border-l border-neutral-200 pt-6 sm:pt-0' : ''} ${i < 2 ? 'pb-6 sm:pb-0 border-b sm:border-b-0 border-neutral-200' : ''}`}>
                <div className="font-instrument text-display-lg text-neutral-900">{stat.value}</div>
                <div className="text-label-lg text-neutral-500 uppercase tracking-wider mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className={`${SECTION_PADDING} bg-neutral-50 border-y border-neutral-200`}>
        <div className={MAX_WIDTH}>
          <motion.div {...fadeIn} className="text-center mb-16">
            <p className="text-label-lg text-neutral-500 mb-4">HOW IT WORKS</p>
            <h2 className="font-instrument text-display-lg text-neutral-900">
              From transaction to decision in under two seconds.
            </h2>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-4">
            {[
              { step: 1, title: 'User initiates transaction', icon: '→' },
              { step: 2, title: 'SafeSwitch intercepts', icon: '→' },
              { step: 3, title: '4 CAMARA APIs fire in parallel', icon: '→', subItems: ['SIM Swap', 'Device Swap', 'Number Verification', 'Device Status'] },
              { step: 4, title: 'On-device reasoning engine', icon: '→' },
              { step: 5, title: 'Approve / Challenge / Block', icon: '' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                <Card className="w-full lg:w-auto lg:flex-1 lg:min-w-[180px] p-6">
                  <p className="text-label-sm text-neutral-400">STEP {item.step}</p>
                  <div className="text-neutral-700 text-2xl my-3">{item.icon || '→'}</div>
                  <h3 className="text-heading-sm text-neutral-900 mt-4">{item.title}</h3>
                  {item.subItems && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.subItems.map((sub, j) => (
                        <span key={j} className="text-body-sm text-neutral-600 bg-neutral-100 rounded-full px-3 py-1">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.step === 4 && (
                    <p className="text-body-sm text-neutral-600 mt-2">
                      SafeSwitch's built-in pattern engine evaluates all four signals simultaneously, cross-referencing known fraud combinations to produce a fraud probability score.
                    </p>
                  )}
                </Card>
                {item.icon && i < 4 && (
                  <span className="text-neutral-300 text-2xl rotate-90 lg:rotate-0 flex-shrink-0">
                    {item.icon}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rwanda Story */}
      <section className={`${SECTION_PADDING} ${MAX_WIDTH}`}>
        <motion.div {...fadeIn}>
          <p className="text-label-lg text-neutral-500 mb-4">THE PROBLEM</p>
          <h2 className="font-instrument text-display-lg text-neutral-900 mb-8">
            In March 2026, fraudsters stole $3.4 million from Equity Bank Rwanda.
          </h2>
          <div className="space-y-6 max-w-2xl">
            <p className="text-body-lg text-neutral-600">
              The mechanism was simple: fresh SIM cards, no transaction history, exploited a gap between the telecom layer and the payment layer.
            </p>
            <p className="text-body-lg text-neutral-600">
              The structural issue is that most fraud detection is reactive. By the time a flag is raised, the money is gone.
            </p>
            <p className="text-body-lg text-neutral-600">
              The fix is SafeSwitch: putting the check inside the transaction window, using data that most fraud systems never see.
            </p>
          </div>
          <hr className="my-10 border-neutral-200" />
          <a href="https://github.com/kawacukennedy/safeswitch.git" target="_blank" rel="noopener noreferrer" className="text-body-md text-neutral-600 hover:text-neutral-900">
            Read the full architecture →
          </a>
        </motion.div>
      </section>

      {/* Demo Scenarios Preview */}
      <section className={`${SECTION_PADDING} bg-white`}>
        <div className={MAX_WIDTH}>
          <motion.div {...fadeIn} className="text-center mb-16">
            <p className="text-label-lg text-neutral-500 mb-4">DEMO SCENARIOS</p>
            <h2 className="font-instrument text-display-lg text-neutral-900">Three outcomes. One system.</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                status: 'block' as const,
                badge: 'BLOCKED',
                title: 'All sandbox numbers blocked',
                desc: 'Nokia sandbox reports recent SIM+device swap for every number',
                score: 75,
                outcome: 'All numbers blocked. Reasoning engine explains why.',
              },
              {
                status: 'block' as const,
                badge: 'BLOCKED',
                title: 'Large amount amplified risk',
                desc: '200k RWF + recent SIM swap = higher score',
                score: 78,
                outcome: 'Amount-weighted scoring raises risk to 78.',
              },
              {
                status: 'block' as const,
                badge: 'BLOCKED',
                title: 'Full pipeline demo',
                desc: '4 parallel CAMARA APIs, <1ms reasoning engine',
                score: 75,
                outcome: 'Transaction blocked. Alert sent in Kinyarwanda.',
              },
            ].map((scenario, i) => (
              <Card
                key={i}
                borderColor={`border-status-${scenario.status}`}
                className="p-8"
              >
                <Badge status={scenario.status}>{scenario.badge}</Badge>
                <h3 className="text-heading-sm text-neutral-900 mt-4">{scenario.title}</h3>
                <p className="text-body-sm text-neutral-500 mt-2">{scenario.desc}</p>
                <p className="text-body-md text-neutral-600 mt-4">Risk score: {scenario.score} / 100</p>
                <p className="text-body-sm text-neutral-500 mt-2">{scenario.outcome}</p>
                <Link to="/demo" className="text-body-sm text-neutral-600 hover:text-neutral-900 mt-4 inline-block">
                  Run this scenario →
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-neutral-200">
        <div className={`${MAX_WIDTH} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-neutral-900 rounded-full" />
            <span className="text-heading-sm text-neutral-900">SafeSwitch</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-body-sm text-neutral-500 hover:text-neutral-700">Privacy</a>
            <a href="https://github.com/kawacukennedy/safeswitch.git" target="_blank" rel="noopener noreferrer" className="text-body-sm text-neutral-500 hover:text-neutral-700">GitHub</a>
            <a href="#" className="text-body-sm text-neutral-500 hover:text-neutral-700">Hackathon</a>
          </div>
          <p className="text-body-sm text-neutral-500">
            Built for GSMA Africa Ignite 2026 · Rwanda Coding Academy
          </p>
        </div>
      </footer>
    </div>
  )
}
