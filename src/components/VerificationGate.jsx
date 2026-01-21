import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Upload, Clock, XCircle, CheckCircle, FileText, AlertCircle } from 'lucide-react';
import propertyApi from '../utils/propertyApi';
import './VerificationGate.css';

function VerificationGate({ children, onVerified }) {
    const { user, updateUser, refreshUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [documentName, setDocumentName] = useState('');

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
            return url;
        }
        // If it starts with /static, it's a legacy relative path
        if (url.startsWith('/')) {
            // Use the same base URL logic as DocumentsPage
            return `https://api.guri24.com${url}`; // or use an api utility if available
        }
        return url;
    };

    const handleUpload = async (files) => {
        if (files.length === 0) return;

        // If only one file and no name, ask for it
        if (files.length === 1 && !documentName.trim()) {
            setError('Please enter a document name for single file upload');
            return;
        }

        setUploading(true);
        setError('');
        setSuccess('');

        let successCount = 0;
        let failCount = 0;

        try {
            for (const file of files) {
                const name = (files.length === 1 && documentName)
                    ? documentName
                    : file.name.split('.').slice(0, -1).join('.') || 'Document';

                try {
                    await propertyApi.uploadVerificationDocument(name, file);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    failCount++;
                }
            }

            if (successCount > 0) {
                setSuccess(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}!`);
                setDocumentName('');
                await refreshUser();
            }

            if (failCount > 0) {
                setError(`${failCount} file(s) failed to upload.`);
            }
        } catch (err) {
            setError('Process failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    // If user is verified, render children
    if (user?.agent_status === 'verified') {
        if (onVerified) onVerified();
        return children;
    }

    // Otherwise, show verification gate
    return (
        <div className="verification-gate">
            <div className="verification-gate-container">
                <div className="verification-gate-icon">
                    <Shield size={64} />
                </div>

                {/* Unverified - Show upload form */}
                {(!user?.agent_status || user?.agent_status === 'unverified') && (
                    <>
                        <h2>Identity Verification Required</h2>
                        <p className="verification-description">
                            To list properties on Guri24, our security policy requires all agents to be verified.
                            Please upload your <strong>proof documents</strong> below to get started.
                        </p>

                        <div className="verification-upload-section">
                            <div className="upload-instructions">
                                <h3>Required Proof Documents</h3>
                                <ul>
                                    <li><CheckCircle size={16} /> Valid National ID or Passport</li>
                                    <li><CheckCircle size={16} /> Professional Real Estate License</li>
                                    <li><CheckCircle size={16} /> Business Registration (if company)</li>
                                </ul>
                                <p className="upload-tip">
                                    <AlertCircle size={16} />
                                    Clear, legible photos or scans lead to faster approval.
                                </p>
                            </div>

                            <div className="upload-form">
                                <div className="form-group">
                                    <label>Document Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Ryan Mugi - ID Card"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Upload Proof Image/PDF</label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="verification-file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) handleUpload(files);
                                            }}
                                            disabled={uploading}
                                        />
                                        <label htmlFor="verification-file" className="file-upload-label">
                                            <Upload size={32} className={uploading ? 'pulse-anim' : ''} />
                                            <span>{uploading ? 'Processing Documents...' : 'Select Document Files'}</span>
                                            <span className="file-info">JPG, PNG or PDF (Max 5MB per file)</span>
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-error">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success">
                                        <CheckCircle size={18} />
                                        {success}
                                    </div>
                                )}

                                {user?.verification_documents?.length > 0 && (
                                    <div className="uploaded-docs">
                                        <h4>Uploaded Documents</h4>
                                        {user.verification_documents.map((doc, idx) => (
                                            <div key={idx} className="doc-item">
                                                <FileText size={16} />
                                                <a href={normalizeDocUrl(doc.url)} target="_blank" rel="noreferrer" className="doc-link">
                                                    {doc.name}
                                                </a>
                                                <span className="doc-date">
                                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Pending - Show waiting message */}
                {user?.agent_status === 'pending' && (
                    <>
                        <h2>Verification Pending</h2>
                        <div className="status-message pending">
                            <Clock size={48} />
                            <p>Your documents are being reviewed by our admin team.</p>
                            <p className="status-note">This usually takes 24-48 hours. We'll notify you once approved.</p>
                        </div>

                        {user?.verification_documents?.length > 0 && (
                            <div className="uploaded-docs">
                                <h4>Submitted Documents</h4>
                                {user.verification_documents.map((doc, idx) => (
                                    <div key={idx} className="doc-item">
                                        <FileText size={16} />
                                        <a href={normalizeDocUrl(doc.url)} target="_blank" rel="noreferrer" className="doc-link">
                                            {doc.name}
                                        </a>
                                        <span className="doc-date">
                                            {new Date(doc.uploaded_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Rejected - Show rejection message */}
                {user?.agent_status === 'rejected' && (
                    <>
                        <h2>Verification Rejected</h2>
                        <div className="status-message rejected">
                            <XCircle size={48} />
                            <p>Unfortunately, your verification was not approved.</p>
                            {user?.rejection_reason && (
                                <div className="rejection-reason">
                                    <strong>Reason:</strong> {user.rejection_reason}
                                </div>
                            )}
                            <p className="status-note">Please upload new documents to try again.</p>
                        </div>

                        {/* Allow re-upload */}
                        <div className="verification-upload-section">
                            <div className="upload-form">
                                <div className="form-group">
                                    <label>Document Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., National ID, Real Estate License"
                                        value={documentName}
                                        onChange={(e) => setDocumentName(e.target.value)}
                                        disabled={uploading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Upload Document</label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="verification-file-retry"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                if (files.length > 0) handleUpload(files);
                                            }}
                                            disabled={uploading}
                                        />
                                        <label htmlFor="verification-file-retry" className="file-upload-label">
                                            <Upload size={24} className={uploading ? 'pulse-anim' : ''} />
                                            <span>{uploading ? 'Uploading...' : 'Click to upload'}</span>
                                            <span className="file-info">PDF, JPG, PNG (Max 5MB per file)</span>
                                        </label>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-error">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="alert alert-success">
                                        <CheckCircle size={18} />
                                        {success}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default VerificationGate;
