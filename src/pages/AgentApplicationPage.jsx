import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './AgentApplicationPage.css';
import { User, Shield, Info, Phone, MapPin, Calendar, FileText, CheckCircle, ArrowLeft, Upload } from 'lucide-react';
import { applyAgent } from '../utils/api';
import { useAuth } from '../context/AuthContext';
function AgentApplicationPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        national_id_number: '',
        date_of_birth: '',
        full_address: '',
        city: '',
        country: 'Kenya',
        motivation: '',
        declaration_signed: false,
        phone: user?.phone || '',
        name: user?.name || '',
        email: user?.email || ''
    });

    const [idFile, setIdFile] = useState(null);

    const steps = [
        { id: 1, title: 'Personal details' },
        { id: 2, title: 'Location details' },
        { id: 3, title: 'Professional Info' },
        { id: 4, title: 'Review' }
    ];

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setIdFile(e.target.files[0]);
        }
    };

    const validateStep = (step) => {
        // Base validation logic
        if (step === 1) {
            return formData.phone && formData.date_of_birth && formData.national_id_number;
        }
        if (step === 2) {
            return formData.full_address && formData.city && formData.country;
        }
        if (step === 3) {
            return formData.motivation && idFile;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
            setError('');
        } else {
            setError('Please fill in all mandatory fields (*)');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
        setError('');
    };

    const handleSubmit = async () => {
        if (!formData.declaration_signed) {
            setError('You must sign the declaration to proceed.');
            return;
        }

        if (!formData.signature?.trim()) {
            setError('Please sign the application by typing your full name.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = new FormData();
            data.append('national_id_number', formData.national_id_number);
            data.append('date_of_birth', formData.date_of_birth);
            data.append('full_address', `${formData.full_address}, ${formData.city}, ${formData.country}`);
            data.append('location', `${formData.city}, ${formData.country}`);
            data.append('phone', formData.phone);
            data.append('name', formData.name);
            data.append('declaration_signed', formData.declaration_signed);
            const signedMotivation = `${formData.motivation}\n\n---\nSigned by: ${formData.signature}\nDate: ${new Date().toLocaleDateString()}`;
            data.append('motivation', signedMotivation);
            if (idFile) data.append('file', idFile);
            await applyAgent(data);
            setSuccess(true);
            await refreshUser();
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err) {
            console.error('Application error:', err);
            setError(err.message || 'Failed to submit application');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="application-success">
                <div className="success-content">
                    <div className="success-icon pulse">
                        <CheckCircle size={64} />
                    </div>
                    <h1>Application Submitted!</h1>
                    <p>Your application is now being reviewed by our administration team.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/profile')}>
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="agent-application-page">
            <div className="application-container">
                <header className="application-header">
                    <h1>Application for Agent Status</h1>

                    {/* Stepper */}
                    <div className="stepper-container">
                        {steps.map((step, index) => (
                            <div key={step.id} className={`step-item ${currentStep >= step.id ? 'active' : ''}`}>
                                <div className="step-circle">{step.id}</div>
                                <span className="step-title">{step.title}</span>
                                {index < steps.length - 1 && <div className="step-line"></div>}
                            </div>
                        ))}
                    </div>
                </header>

                <div className="wizard-content">
                    {error && <div className="alert alert-error">{error}</div>}

                    {/* Step 1: Personal Details */}
                    {currentStep === 1 && (
                        <div className="wizard-step fade-in">
                            <h2>Personal details</h2>
                            <p className="step-subtitle">Mandatory fields are marked with an asterisk (*)</p>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label>First name*</label>
                                    <div className="input-wrapper disabled">
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Last name</label>
                                    <div className="input-wrapper disabled">
                                        <input
                                            type="text"
                                            value=""
                                            placeholder="From Profile"
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Date of birth*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            placeholder="DD/MM/YYYY"
                                        />
                                        <Calendar size={18} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Gender*</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input type="radio" name="gender" value="male" /> Male
                                        </label>
                                        <label className="radio-label">
                                            <input type="radio" name="gender" value="female" /> Female
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone number*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <div className="input-wrapper disabled">
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>National ID / Passport Number*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            name="national_id_number"
                                            value={formData.national_id_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Location Details */}
                    {currentStep === 2 && (
                        <div className="wizard-step fade-in">
                            <h2>Location details</h2>
                            <p className="step-subtitle">Where are you based?</p>

                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Address Line*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            name="full_address"
                                            value={formData.full_address}
                                            onChange={handleChange}
                                            placeholder="Street address, Apartment, etc."
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>City / Town*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Country*</label>
                                    <div className="input-wrapper">
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Professional Info */}
                    {currentStep === 3 && (
                        <div className="wizard-step fade-in">
                            <h2>Professional Info</h2>
                            <p className="step-subtitle">Tell us about your experience</p>

                            <div className="form-group item-full">
                                <label>Motivation*</label>
                                <textarea
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleChange}
                                    rows="5"
                                    placeholder="Why do you want to become a Guri24 agent?"
                                />
                            </div>

                            <div className="form-group item-full">
                                <label>Identity Document Upload*</label>
                                <div className="file-upload-zone" onClick={() => document.getElementById('id-upload').click()}>
                                    <Upload size={32} />
                                    <p>{idFile ? idFile.name : 'Click to upload ID/Passport'}</p>
                                    <span className="file-info">PDF, JPG, PNG (Max 5MB)</span>
                                    <input
                                        id="id-upload"
                                        type="file"
                                        onChange={handleFileChange}
                                        hidden
                                        accept="image/*,.pdf"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {currentStep === 4 && (
                        <div className="wizard-step fade-in">
                            <h2>Review Application</h2>
                            <p className="step-subtitle">Please verify your details before submitting</p>

                            <div className="review-card">
                                <h3>Personal & Location</h3>
                                <div className="review-grid">
                                    <div className="review-item"><strong>Name:</strong> {formData.name}</div>
                                    <div className="review-item"><strong>Email:</strong> {formData.email}</div>
                                    <div className="review-item"><strong>Phone:</strong> {formData.phone}</div>
                                    <div className="review-item"><strong>ID:</strong> {formData.national_id_number}</div>
                                    <div className="review-item full"><strong>Address:</strong> {formData.full_address}, {formData.city}, {formData.country}</div>
                                    <div className="review-item full"><strong>Motivation:</strong> {formData.motivation}</div>
                                </div>
                            </div>

                            <div className="declaration-section">
                                <label className="checkbox-container">
                                    <input
                                        type="checkbox"
                                        name="declaration_signed"
                                        checked={formData.declaration_signed}
                                        onChange={handleChange}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="label-text">
                                        I hereby declare that all information provided is true and accurate.
                                    </span>
                                </label>
                            </div>

                            <div className="signature-section fade-in">
                                <h3>Signature</h3>
                                <p className="step-subtitle">Type your full name to sign this application</p>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Signature (Full Name)*</label>
                                        <div className="input-wrapper">
                                            <input
                                                type="text"
                                                name="signature"
                                                value={formData.signature || ''}
                                                onChange={handleChange}
                                                placeholder="e.g. John Doe"
                                                className="signature-input"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <div className="input-wrapper disabled">
                                            <input
                                                type="text"
                                                value={new Date().toLocaleDateString()}
                                                disabled
                                            />
                                            <Calendar size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="wizard-actions">
                        {currentStep > 1 && (
                            <button className="btn-back" onClick={prevStep}>
                                Back
                            </button>
                        )}

                        <div className="spacer"></div>

                        {currentStep < 4 ? (
                            <button className="btn-next" onClick={nextStep}>
                                Next step <ArrowLeft className="rotate-180" size={18} />
                            </button>
                        ) : (
                            <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AgentApplicationPage;
