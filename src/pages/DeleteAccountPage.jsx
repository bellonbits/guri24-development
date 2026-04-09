import { useState } from 'react';
import { Mail, Trash2, ShieldCheck, Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import './DeleteAccountPage.css';

function DeleteAccountPage() {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: 'How long does the deletion process take?',
            a: 'Account deletion is processed within 30 days of receiving your request. You will receive a confirmation email once deletion is complete.',
        },
        {
            q: 'Can I cancel my deletion request?',
            a: 'Yes. If you contact us within 14 days of submitting your request and your data has not yet been deleted, we can cancel the process.',
        },
        {
            q: 'What happens to my active bookings?',
            a: 'Any active or pending bookings must be resolved (completed or cancelled) before your account can be fully deleted. We will notify you of any open items.',
        },
        {
            q: 'Will my reviews and ratings be removed?',
            a: 'Yes, all reviews and ratings you submitted will be permanently deleted along with your account.',
        },
    ];

    return (
        <div className="dap-page">
            {/* Hero */}
            <div className="dap-hero">
                <div className="dap-hero-inner">
                    <span className="dap-badge">
                        <ShieldCheck size={14} /> Data &amp; Privacy
                    </span>
                    <h1>Delete Your Guri24 Account</h1>
                    <p>
                        You have the right to request permanent deletion of your Guri24 account
                        and all associated personal data. Please read the information below
                        before submitting your request.
                    </p>
                </div>
            </div>

            <div className="dap-container">

                {/* Steps */}
                <section className="dap-section">
                    <h2>How to Request Account Deletion</h2>
                    <div className="dap-steps">
                        <div className="dap-step">
                            <div className="dap-step-num">1</div>
                            <div className="dap-step-body">
                                <h3>Send a deletion request email</h3>
                                <p>
                                    Send an email to{' '}
                                    <a href="mailto:privacy@guri24.com">privacy@guri24.com</a>{' '}
                                    from the email address registered to your Guri24 account.
                                </p>
                            </div>
                        </div>
                        <div className="dap-step">
                            <div className="dap-step-num">2</div>
                            <div className="dap-step-body">
                                <h3>Include required information</h3>
                                <p>Your email must include:</p>
                                <ul>
                                    <li>Subject line: <strong>Account Deletion Request – [Your Full Name]</strong></li>
                                    <li>Your registered email address</li>
                                    <li>Your full name as registered on Guri24</li>
                                    <li>Reason for deletion (optional)</li>
                                </ul>
                            </div>
                        </div>
                        <div className="dap-step">
                            <div className="dap-step-num">3</div>
                            <div className="dap-step-body">
                                <h3>Verify your identity</h3>
                                <p>
                                    We may send a verification code to your registered email to confirm
                                    your identity before processing the request.
                                </p>
                            </div>
                        </div>
                        <div className="dap-step">
                            <div className="dap-step-num">4</div>
                            <div className="dap-step-body">
                                <h3>Confirmation &amp; processing</h3>
                                <p>
                                    You will receive a confirmation email. Your account and data will
                                    be permanently deleted within <strong>30 days</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <a href="mailto:privacy@guri24.com?subject=Account%20Deletion%20Request" className="dap-cta-btn">
                        <Mail size={18} />
                        Send Deletion Request Email
                    </a>
                </section>

                {/* What gets deleted */}
                <section className="dap-section">
                    <h2>What Data Is Deleted vs. Retained</h2>
                    <div className="dap-data-grid">
                        <div className="dap-data-card deleted">
                            <div className="dap-data-card-header">
                                <Trash2 size={20} />
                                <h3>Permanently Deleted</h3>
                            </div>
                            <ul>
                                <li>Your name, email address, phone number</li>
                                <li>Profile photo and bio</li>
                                <li>Saved properties and favourites</li>
                                <li>Booking history and records</li>
                                <li>Submitted reviews and ratings</li>
                                <li>Uploaded documents and files</li>
                                <li>Chat and messaging history</li>
                                <li>Agent application and verification data</li>
                                <li>Property listings (if agent)</li>
                                <li>Login credentials and session tokens</li>
                            </ul>
                        </div>
                        <div className="dap-data-card retained">
                            <div className="dap-data-card-header">
                                <Clock size={20} />
                                <h3>Retained for Legal / Financial Reasons</h3>
                            </div>
                            <ul>
                                <li>
                                    <strong>Transaction records</strong> — retained for
                                    <span className="dap-retention-period">7 years</span> as required
                                    by tax and financial regulations
                                </li>
                                <li>
                                    <strong>Fraud prevention logs</strong> — retained for
                                    <span className="dap-retention-period">2 years</span> to comply
                                    with security obligations
                                </li>
                                <li>
                                    <strong>Anonymised analytics</strong> — aggregated, non-identifiable
                                    usage statistics with no retention limit
                                </li>
                            </ul>
                            <p className="dap-note">
                                Retained data cannot be linked back to you once your account is deleted.
                                It is used solely for legal compliance and security purposes.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Warning */}
                <section className="dap-warning-box">
                    <AlertTriangle size={20} />
                    <div>
                        <strong>This action is irreversible.</strong> Once your account is deleted,
                        your data cannot be recovered. If you simply want to take a break, you may
                        contact us to temporarily deactivate your account instead.
                    </div>
                </section>

                {/* FAQ */}
                <section className="dap-section">
                    <h2>Frequently Asked Questions</h2>
                    <div className="dap-faqs">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`dap-faq ${openFaq === i ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            >
                                <div className="dap-faq-q">
                                    {faq.q}
                                    {openFaq === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                                {openFaq === i && <div className="dap-faq-a">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact */}
                <section className="dap-contact-strip">
                    <CheckCircle size={20} />
                    <span>Questions? Contact our Privacy Team at{' '}
                        <a href="mailto:privacy@guri24.com">privacy@guri24.com</a>
                        {' '}or visit our{' '}
                        <a href="/privacy">Privacy Policy</a>.
                    </span>
                </section>

            </div>
        </div>
    );
}

export default DeleteAccountPage;
