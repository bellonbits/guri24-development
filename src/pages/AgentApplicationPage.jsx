import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentApplicationPage.css';
import {
    User, Shield, Phone, MapPin, Calendar, FileText, CheckCircle,
    ArrowLeft, ArrowRight, Upload, Clock, CheckCircle2, ChevronRight, Info
} from 'lucide-react';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import { applyAgent } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function AgentApplicationPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [applicationResult, setApplicationResult] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    // Split user's full name into first and last name
    const nameParts = (user?.name || '').trim().split(' ');
    const initialFirstName = nameParts[0] || '';
    const initialLastName = nameParts.slice(1).join(' ') || '';

    const [formData, setFormData] = useState({
        first_name: initialFirstName,
        last_name: initialLastName,
        email: user?.email || '',
        phone: user?.phone || '',
        national_id_number: '',
        date_of_birth: '',
        gender: 'male',
        full_address: '',
        city: 'Nairobi',
        country: 'Kenya',
        constituency: '',
        agency_name: '',
        motivation: '',
        declaration_signed: false,
        signature: ''
    });

    const [idFile, setIdFile] = useState(null);

    const steps = [
        { id: 1, title: 'Personal Details' },
        { id: 2, title: 'Location & Agency' },
        { id: 3, title: 'Identity & Motivation' },
        { id: 4, title: 'Review & Submit' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDateChange = (date, dateString) => {
        setFormData(prev => ({
            ...prev,
            date_of_birth: dateString || ''
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdFile(e.target.files[0]);
        }
    };

    const validateStep = (step) => {
        if (step === 1) {
            return (
                formData.first_name?.trim() &&
                formData.phone?.trim() &&
                formData.date_of_birth &&
                formData.gender &&
                formData.national_id_number?.trim()
            );
        }
        if (step === 2) {
            return formData.full_address?.trim() && formData.city?.trim();
        }
        if (step === 3) {
            return formData.motivation?.trim() && idFile;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setError('');
        } else {
            setError('Please fill in all mandatory fields marked with an asterisk (*)');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.declaration_signed) {
            setError('You must sign the legal declaration to proceed.');
            return;
        }

        if (!formData.signature?.trim()) {
            setError('Please sign the application by typing your full legal name.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            const fullName = `${formData.first_name} ${formData.last_name}`.trim();
            data.append('name', fullName);
            data.append('national_id_number', formData.national_id_number);
            data.append('date_of_birth', formData.date_of_birth);
            data.append('gender', formData.gender);
            data.append('full_address', `${formData.full_address}, ${formData.city}, ${formData.country}`);
            data.append('location', `${formData.city}, ${formData.country}`);
            data.append('phone', formData.phone);
            data.append('declaration_signed', formData.declaration_signed);
            
            const detailedMotivation = [
                `Agency / Business: ${formData.agency_name || 'Independent Agent'}`,
                `Constituency: ${formData.constituency || 'N/A'}`,
                `Motivation & Background:\n${formData.motivation}`,
                `\n---\nElectronically Signed by: ${formData.signature}`,
                `Date: ${new Date().toLocaleDateString()}`
            ].join('\n');
            data.append('motivation', detailedMotivation);

            if (idFile) {
                data.append('file', idFile);
            }

            const res = await applyAgent(data);
            
            setApplicationResult({
                sr_number: res?.sr_number || `233${Math.floor(Math.random() * 89999 + 10000)}`,
                submitted_date: res?.submitted_date || dayjs().format('DD-MMM-YYYY')
            });
            setSuccess(true);
            await refreshUser();
        } catch (err) {
            console.error('Application error:', err);
            setError(err.message || 'Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // SUCCESS SCREEN (Matching Image 5: media_1794971622163_713a5f4c.jpg)
    // =========================================================================
    if (success) {
        return (
            <div className="application-success-wrapper">
                <div className="success-mobile-card">
                    {/* Header Title */}
                    <h1 className="success-title">Success!</h1>

                    {/* Verification Graphic (Illustration from Image 5) */}
                    <div className="success-illustration-box">
                        <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Background ambient bubble */}
                            <ellipse cx="110" cy="85" rx="85" ry="55" fill="#f1f5f9" />
                            
                            {/* Angled ID Badge Card */}
                            <g transform="rotate(-6 110 75)">
                                <rect x="35" y="25" width="135" height="85" rx="14" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2.5" />
                                <rect x="35" y="25" width="135" height="85" rx="14" fill="#fbfaf7" />
                                
                                {/* Photo placeholder with avatar */}
                                <rect x="47" y="38" width="34" height="42" rx="6" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
                                <circle cx="64" cy="52" r="7" fill="#1e293b" />
                                <path d="M 52 74 C 52 64, 76 64, 76 74 Z" fill="#2563eb" />
                                
                                {/* Card detail stripes */}
                                <circle cx="94" cy="42" r="3" fill="#10b981" />
                                <circle cx="104" cy="42" r="3" fill="#ef4444" />
                                <circle cx="114" cy="42" r="3" fill="#f59e0b" />
                                <rect x="94" y="50" width="56" height="8" rx="4" fill="#d97706" />
                                <rect x="94" y="64" width="42" height="6" rx="3" fill="#cbd5e1" />
                            </g>

                            {/* Verification Green Badge Checkmark */}
                            <circle cx="160" cy="40" r="18" fill="#22c55e" />
                            <path d="M 152 40 L 157 45 L 169 33" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Small accent floating dots */}
                            <circle cx="35" cy="50" r="3" fill="#f59e0b" />
                            <circle cx="28" cy="85" r="4" fill="#0c6759" />
                            <circle cx="185" cy="80" r="4" fill="#e05638" />
                            <circle cx="160" cy="110" r="2.5" fill="#f59e0b" />
                        </svg>
                    </div>

                    {/* Explanatory Message */}
                    <p className="success-explainer">
                        Your request has been submitted successfully. We are currently working on your request, and it may take up to 2 days to process your request (subject to submission of required documents).
                    </p>

                    {/* Inset Information Box (Matching Image 5 layout) */}
                    <div className="success-details-card">
                        <div className="success-status-pill">
                            <span className="status-dot-amber">L</span>
                            <span>Submitted</span>
                        </div>

                        <div className="success-details-grid">
                            <div className="detail-col">
                                <span className="detail-meta-label">SR NUMBER</span>
                                <span className="detail-meta-val monospace">{applicationResult?.sr_number || '23378397'}</span>
                            </div>
                            <div className="detail-col">
                                <span className="detail-meta-label">SUBMITTED DATE</span>
                                <span className="detail-meta-val">{applicationResult?.submitted_date || dayjs().format('DD-MMM-YYYY')}</span>
                            </div>
                        </div>

                        <div className="detail-col full">
                            <span className="detail-meta-label">SERVICE REQ TYPE</span>
                            <span className="detail-meta-val primary">Agent Verification Application</span>
                        </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="success-actions-col">
                        <button
                            type="button"
                            className="btn-success-primary"
                            onClick={() => navigate('/profile')}
                        >
                            View details
                        </button>

                        <button
                            type="button"
                            className="btn-success-secondary"
                            onClick={() => navigate('/')}
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // STEPPED APPLICATION FLOW (Matching Images 6 & 7)
    // =========================================================================
    return (
        <div className="agent-application-page">
            <div className="application-container">
                {/* Stepper Header */}
                <header className="application-header">
                    <h1>Agent Verification Application</h1>
                    <div className="stepper-container">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`step-item ${currentStep === step.id ? 'current' : ''} ${currentStep > step.id ? 'completed' : ''}`}
                            >
                                <div className="step-circle">
                                    {currentStep > step.id ? <CheckCircle size={18} /> : step.id}
                                </div>
                                <span className="step-title">{step.title}</span>
                                {index < steps.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>
                </header>

                <div className="wizard-content-card">
                    {error && (
                        <div className="alert-error-banner" role="alert">
                            <Info size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Step 1: Personal Details (Matching Image 6) */}
                    {currentStep === 1 && (
                        <div className="wizard-step fade-in">
                            <h2 className="step-heading">Personal details</h2>
                            <p className="step-subtitle">Mandatory fields are marked with an asterisk (*)</p>

                            <div className="form-grid-modern">
                                <div className="form-group-modern">
                                    <label>First name*</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        placeholder="e.g. Peter"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>Last name</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        placeholder="e.g. Gatitu"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>Date of birth*</label>
                                    <DatePicker
                                        size="large"
                                        format="DD/MM/YYYY"
                                        placeholder="DD/MM/YYYY"
                                        value={formData.date_of_birth ? dayjs(formData.date_of_birth, 'YYYY-MM-DD') : null}
                                        onChange={(d) => handleDateChange(d, d ? d.format('YYYY-MM-DD') : '')}
                                        className="modern-datepicker-field"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>Gender*</label>
                                    <div className="gender-radio-group">
                                        <label className={`radio-pill ${formData.gender === 'male' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={formData.gender === 'male'}
                                                onChange={handleChange}
                                            />
                                            <span>Male</span>
                                        </label>
                                        <label className={`radio-pill ${formData.gender === 'female' ? 'active' : ''}`}>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={formData.gender === 'female'}
                                                onChange={handleChange}
                                            />
                                            <span>Female</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="form-group-modern">
                                    <label>Phone number*</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="+254 7XX XXX XXX"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="modern-input disabled"
                                    />
                                </div>

                                <div className="form-group-modern span-2">
                                    <label>National ID / Passport Number*</label>
                                    <input
                                        type="text"
                                        name="national_id_number"
                                        placeholder="Enter National ID or Passport Number"
                                        value={formData.national_id_number}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location & Agency */}
                    {currentStep === 2 && (
                        <div className="wizard-step fade-in">
                            <h2 className="step-heading">Location details</h2>
                            <p className="step-subtitle">Where is your primary real estate operations base?</p>

                            <div className="form-grid-modern">
                                <div className="form-group-modern span-2">
                                    <label>Office / Residential Address*</label>
                                    <input
                                        type="text"
                                        name="full_address"
                                        placeholder="e.g. Suite 4B, Parklands Road, Nairobi"
                                        value={formData.full_address}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>City / County*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        placeholder="e.g. Nairobi, Mombasa, Kisumu"
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern">
                                    <label>Constituency / Area</label>
                                    <input
                                        type="text"
                                        name="constituency"
                                        placeholder="e.g. Westlands, Kilimani, Nyali"
                                        value={formData.constituency}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>

                                <div className="form-group-modern span-2">
                                    <label>Real Estate Agency / Business Name (Optional)</label>
                                    <input
                                        type="text"
                                        name="agency_name"
                                        placeholder="e.g. Nairobi Prime Properties Ltd / Independent Agent"
                                        value={formData.agency_name}
                                        onChange={handleChange}
                                        className="modern-input"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Identity Document & Motivation */}
                    {currentStep === 3 && (
                        <div className="wizard-step fade-in">
                            <h2 className="step-heading">Verification &amp; Experience</h2>
                            <p className="step-subtitle">Upload your government-issued ID and tell us about your background</p>

                            <div className="form-group-modern span-2">
                                <label>Identity Document Upload (National ID or Passport)*</label>
                                <div
                                    className={`file-drop-card ${idFile ? 'has-file' : ''}`}
                                    onClick={() => document.getElementById('agent-id-upload').click()}
                                >
                                    <Upload size={32} className="upload-icon" />
                                    <div className="upload-text">
                                        <h4>{idFile ? idFile.name : 'Click to select or drag & drop ID document'}</h4>
                                        <p>Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                                    </div>
                                    <input
                                        id="agent-id-upload"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        hidden
                                    />
                                </div>
                            </div>

                            <div className="form-group-modern span-2">
                                <label>Professional Summary &amp; Experience*</label>
                                <textarea
                                    name="motivation"
                                    rows="5"
                                    placeholder="Describe your real estate background, specialized neighborhoods, properties managed, or why you want to list on Guri24..."
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    className="modern-textarea"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review & Legal Declaration */}
                    {currentStep === 4 && (
                        <div className="wizard-step fade-in">
                            <h2 className="step-heading">Review &amp; Submit Application</h2>
                            <p className="step-subtitle">Please verify your details before submitting</p>

                            <div className="review-card">
                                <div className="review-grid">
                                    <div><span className="rev-label">Full Name:</span> <strong>{formData.first_name} {formData.last_name}</strong></div>
                                    <div><span className="rev-label">Phone:</span> <strong>{formData.phone}</strong></div>
                                    <div><span className="rev-label">National ID:</span> <strong>{formData.national_id_number}</strong></div>
                                    <div><span className="rev-label">Date of Birth:</span> <strong>{formData.date_of_birth}</strong></div>
                                    <div><span className="rev-label">Gender:</span> <strong>{formData.gender}</strong></div>
                                    <div><span className="rev-label">Location:</span> <strong>{formData.full_address}, {formData.city}</strong></div>
                                    <div><span className="rev-label">Document:</span> <strong>{idFile?.name || 'Attached'}</strong></div>
                                    <div><span className="rev-label">Agency:</span> <strong>{formData.agency_name || 'Independent Agent'}</strong></div>
                                </div>
                            </div>

                            <div className="declaration-box">
                                <label className="declaration-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="declaration_signed"
                                        checked={formData.declaration_signed}
                                        onChange={handleChange}
                                    />
                                    <span>
                                        I hereby certify that all information and identity documents provided in this application are accurate, valid, and authentic. I agree to Guri24 Agent Terms &amp; Verified Standards.
                                    </span>
                                </label>

                                <div className="signature-input-group">
                                    <label>Electronic Signature (Type your Full Legal Name)*</label>
                                    <input
                                        type="text"
                                        name="signature"
                                        placeholder="Type your full legal name as signature"
                                        value={formData.signature}
                                        onChange={handleChange}
                                        className="modern-input signature"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="wizard-nav-footer">
                        {currentStep > 1 && (
                            <button type="button" className="btn-wizard-back" onClick={prevStep} disabled={loading}>
                                <ArrowLeft size={16} /> Back
                            </button>
                        )}

                        <div className="spacer"></div>

                        {currentStep < 4 ? (
                            <button type="button" className="btn-wizard-next" onClick={nextStep}>
                                Next step <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="btn-wizard-submit"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? 'Submitting Application...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgentApplicationPage;
