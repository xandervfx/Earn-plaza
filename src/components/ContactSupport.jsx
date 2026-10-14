import React, { useState } from 'react';
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  CircleHelp,
  Send,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { API_BASE } from './config';

const SUPPORT_EMAIL = 'earnplazza@gmail.com';

const WHATSAPP_LINK =
  'https://chat.whatsapp.com/Eyg1AzJH84PJvPjpG457pp?s=cl&p=a&mlu=4&ilr=4';

const faqs = [
  {
    question: 'Why has my deposit not appeared?',
    answer:
      'Your deposit may still be awaiting verification. Keep your payment reference and proof available. A submitted deposit request does not mean your account has already been credited. Contact support if the delay continues.'
  },
  {
    question: 'How do I check my withdrawal?',
    answer:
      'Check your withdrawal status on Earn Plaza, if available. Requests may require eligibility checks and review. Include your withdrawal reference when contacting support.'
  },
  {
    question: 'Why was my task submission not approved?',
    answer:
      'Review the task instructions and make sure your submitted proof clearly demonstrates completion. If you believe a decision was incorrect, contact support and include the task details.'
  },
  {
    question: 'I cannot log in to my account. What should I do?',
    answer:
      'Check your login details and use the password recovery option if necessary. Never share your password or authentication token with anyone claiming to be a support representative.'
  },
  {
    question: 'How can I update my profile?',
    answer:
      'Open your dashboard menu and select Profile. Keep your account information accurate and check your payout details before requesting a withdrawal.'
  },
  {
    question: 'How do I contact Earn Plaza support?',
    answer:
      'You can email earnplazza@gmail.com, join our WhatsApp community using the link on this page, or submit the support request form. Include relevant references when describing a problem.'
  }
];

const topics = [
  { value: 'deposit', label: 'Deposit problem' },
  { value: 'withdrawal', label: 'Withdrawal problem' },
  { value: 'task', label: 'Task or reward' },
  { value: 'account', label: 'Login or account' },
  { value: 'referral', label: 'Referral problem' },
  { value: 'other', label: 'Other enquiry' }
];

export default function ContactSupport({
  onBack = () => {
    window.location.hash = '';
  }
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('deposit');
  const [reference, setReference] = useState('');
  const [message, setMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(0);
  const [loading, setLoading] = useState(false);

  const [feedback, setFeedback] = useState({
    type: '',
    message: ''
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFeedback({
      type: '',
      message: ''
    });

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFeedback({
        type: 'error',
        message: 'Please complete your name, email, and message.'
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFeedback({
        type: 'error',
        message: 'Please enter a valid email address.'
      });
      return;
    }

    if (message.trim().length < 10) {
      setFeedback({
        type: 'error',
        message: 'Please provide more details about your issue.'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/api/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          topic,
          reference: reference.trim(),
          message: message.trim()
        })
      });

      const responseText = await response.text();
      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          'The server returned an unexpected response.'
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
          data.message ||
          'Your request could not be submitted. Please contact us by email or WhatsApp.'
        );
      }

      setFeedback({
        type: 'success',
        message:
          data.message ||
          'Your support request was submitted successfully.'
      });

      setName('');
      setEmail('');
      setTopic('deposit');
      setReference('');
      setMessage('');
    } catch (error) {
      console.error('Support request failed:', error);

      setFeedback({
        type: 'error',
        message:
          `${error.message} You can also contact us directly using the details above.`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to dashboard"
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <MessageCircle className="h-5 w-5" />
          </div>

          <div>
            <h1 className="font-black text-white">
              Contact & Support
            </h1>
            <p className="text-xs text-slate-500">
              Earn Plaza Help Centre
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Welcome Banner */}
        <section className="mb-8 rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-emerald-950/60 to-slate-900 p-6 sm:p-9">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-800 bg-emerald-950/60 px-3 py-1.5 text-xs font-bold text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Official Support Centre
            </span>

            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              How can we help you?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
              Need help with a deposit, withdrawal, task, or account?
              Contact us by email, join our WhatsApp community, or
              submit a support request below.
            </p>
          </div>
        </section>

        {/* Contact Options */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-black text-white">
              Get in Touch
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Choose the contact option that works best for you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Email Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Mail className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-black text-white">
                Email Support
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Send us your questions or explain an issue with your
                account, transactions, or tasks.
              </p>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
              >
                {SUPPORT_EMAIL}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>

              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Earn Plaza Support Request')}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                <Mail className="h-4 w-4" />
                Email Us
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-700">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <MessageCircle className="h-6 w-6" />
              </div>

              <h3 className="text-lg font-black text-white">
                WhatsApp Community
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Join the Earn Plaza WhatsApp community to connect
                with the community and receive information shared there.
              </p>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Community membership does not guarantee a private
                support response. Do not share passwords or sensitive
                financial information in the group.
              </p>

              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
              >
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* FAQ and Support Form */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-emerald-400">
                <CircleHelp className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs text-slate-500">
                  Quick answers to common problems
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedFaq(
                        expandedFaq === index ? -1 : index
                      )
                    }
                    aria-expanded={expandedFaq === index}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-slate-800/70"
                  >
                    <span className="text-sm font-bold text-white">
                      {faq.question}
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                        expandedFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {expandedFaq === index && (
                    <div className="border-t border-slate-800 px-4 py-4">
                      <p className="text-sm leading-7 text-slate-400">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Support Form */}
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-emerald-400">
                <Send className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black text-white">
                  Support Request
                </h2>
                <p className="text-xs text-slate-500">
                  Tell us what happened
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
            >
              {feedback.message && (
                <div
                  role="status"
                  className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
                    feedback.type === 'success'
                      ? 'border-emerald-800 bg-emerald-950/40 text-emerald-300'
                      : 'border-rose-800 bg-rose-950/40 text-rose-300'
                  }`}
                >
                  {feedback.type === 'success' ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}

                  <span>{feedback.message}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="support-name"
                  className="mb-2 block text-xs font-bold text-slate-300"
                >
                  Your name
                </label>

                <input
                  id="support-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  autoComplete="name"
                  required
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="support-email"
                  className="mb-2 block text-xs font-bold text-slate-300"
                >
                  Your email
                </label>

                <input
                  id="support-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="support-topic"
                  className="mb-2 block text-xs font-bold text-slate-300"
                >
                  Support topic
                </label>

                <select
                  id="support-topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                >
                  {topics.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="support-reference"
                  className="mb-2 block text-xs font-bold text-slate-300"
                >
                  Transaction or task reference (optional)
                </label>

                <input
                  id="support-reference"
                  value={reference}
                  onChange={(event) => setReference(event.target.value)}
                  maxLength={150}
                  placeholder="Enter a reference if available"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />
              </div>

              <div>
                <label
                  htmlFor="support-message"
                  className="mb-2 block text-xs font-bold text-slate-300"
                >
                  Describe your issue
                </label>

                <textarea
                  id="support-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={3000}
                  minLength={10}
                  required
                  rows={5}
                  placeholder="Explain what happened and how we can help..."
                  className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500"
                />

                <p className="mt-1 text-right text-xs text-slate-600">
                  {message.length}/3000
                </p>
              </div>

              <div className="rounded-xl border border-amber-900/50 bg-amber-950/20 p-3">
                <p className="text-xs leading-5 text-amber-200/80">
                  Never include your password, banking PIN, card security
                  code, or login verification codes in a support message.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />

                {loading
                  ? 'Submitting request...'
                  : 'Submit Support Request'}
              </button>

              <p className="text-xs leading-5 text-slate-500">
                If the support form is unavailable, email us directly
                at {SUPPORT_EMAIL}.
              </p>
            </form>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">
          <p className="text-xs leading-6 text-slate-500">
            Earn Plaza Support · We're here to help.
          </p>

          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-emerald-700 hover:text-emerald-400"
            >
              <Mail className="h-4 w-4" />
              Email Support
            </a>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-emerald-700 hover:text-emerald-400"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Community
            </a>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </footer>
      </main>
    </div>
  );
}