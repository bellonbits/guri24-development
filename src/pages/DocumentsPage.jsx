import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutGrid,
    List,
    FileText,
    Upload,
    Trash2,
    Eye,
    ChevronLeft,
    Shield,
    Briefcase,
    User,
    CreditCard,
    Plus,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { propertyApi } from '../utils/propertyApi';
import api from '../utils/api';
import './DocumentsPage.css';

function DocumentsPage() {
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [uploadData, setUploadData] = useState({
        name: '',
        category: 'Identity'
    });

    const fileInputRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Debugging: Log user state
    useEffect(() => {
        console.log('DocumentsPage User State:', user);
    }, [user]);

    const categories = [
        { name: 'Identity', icon: <User size={18} /> },
        { name: 'Professional', icon: <Briefcase size={18} /> },
        { name: 'Verification', icon: <Shield size={18} /> },
        { name: 'Financial', icon: <CreditCard size={18} /> },
        { name: 'Other', icon: <FileText size={18} /> }
    ];

    const normalizeDocUrl = (url) => {
        if (!url) return '#';
        if (url.startsWith('http') || url.startsWith('https') || url.startsWith('blob:')) {
            return url;
        }
        // If it starts with /static, it's a legacy relative path that needs API base
        if (url.startsWith('/static')) {
            const apiBase = api.defaults.baseURL.split('/api/v1')[0];
            return `${apiBase}${url}`;
        }
        return url;
    };

    const getDocIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('passport') || lowerName.includes('id')) return <CreditCard size={28} />;
        if (lowerName.includes('license')) return <Shield size={28} />;
        if (lowerName.includes('deed') || lowerName.includes('agreement')) return <Briefcase size={28} />;
        return <FileText size={28} />;
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        setError('');
        try {
            await refreshUser();
            setSuccess('Synced with server!');
            setTimeout(() => setSuccess(''), 2500);
        } catch (err) {
            setError('Sync failed. Please check connection.');
        } finally {
            setRefreshing(false);
        }
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        // If only one file and no name, ask for it (optional, but good for single uploads)
        if (files.length === 1 && !uploadData.name) {
            setError('Please provide a document name for single files');
            return;
        }

        setLoading(true);
        setError('');
        setUploadProgress({ current: 0, total: files.length });
        let successCount = 0;
        let failCount = 0;

        try {
            let currentIdx = 0;
            for (const file of files) {
                currentIdx++;
                setUploadProgress({ current: currentIdx, total: files.length });

                // Determine the clean name: manual name if single, otherwise filename
                const baseName = (files.length === 1 && uploadData.name)
                    ? uploadData.name
                    : file.name.split('.').slice(0, -1).join('.') || 'Document';

                const label = `[${uploadData.category}] ${baseName}`;

                try {
                    await propertyApi.uploadVerificationDocument(label, file);
                    successCount++;
                } catch (err) {
                    console.error(`Failed to upload ${file.name}:`, err);
                    failCount++;
                }
            }

            if (successCount > 0) {
                setSuccess(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}!`);
                if (failCount > 0) {
                    setError(`${failCount} file(s) failed. Check sizes (max 5MB).`);
                }
                setUploadData({ name: '', category: 'Identity' });

                // Refresh user data to show new documents
                await refreshUser();

                setTimeout(() => {
                    setSuccess('');
                }, 4000);
            } else {
                setError('All uploads failed. Please check connection and file types.');
            }
        } catch (err) {
            setError('An error occurred during upload process.');
        } finally {
            setLoading(false);
            setUploadProgress({ current: 0, total: 0 });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteDocument = async (docId, e) => {
        if (e) e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        setLoading(true);
        setError('');
        try {
            await propertyApi.deleteVerificationDocument(docId);
            setSuccess('Document deleted successfully!');
            await refreshUser();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to delete document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="documents-page">
            <div className="documents-container">
                <div className="documents-header">
                    <div>
                        <button className="back-btn" onClick={() => navigate('/profile')}>
                            <ChevronLeft size={20} />
                            Back to Profile
                        </button>
                        <h1>Doc Center</h1>
                    </div>
                    <div className="doc-stats">
                        <button
                            className={`refresh-btn ${refreshing ? 'spinning' : ''}`}
                            onClick={handleRefresh}
                            disabled={refreshing}
                            title="Refresh documents"
                        >
                            <Plus size={18} style={{ transform: refreshing ? 'rotate(45deg)' : 'none' }} />
                        </button>
                        <span className="stat-pill">
                            {user?.verification_documents?.length || 0} Documents
                        </span>
                    </div>
                </div>

                {error && <div className="alert alert-error"><AlertCircle size={20} /> {error}</div>}
                {success && <div className="alert alert-success"><FileText size={20} /> {success}</div>}

                <div className="documents-grid">
                    {/* Left Column: Documents List */}
                    <div className="documents-section display-section">
                        <div className="section-header">
                            <div className="title-group">
                                <h2>My Documents</h2>
                                {refreshing && <span className="refresh-indicator">Syncing...</span>}
                            </div>
                            <div className="view-toggle">
                                <button
                                    className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                                <button
                                    className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List View"
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>

                        {user?.verification_documents?.length > 0 ? (
                            <div className={`doc-container ${viewMode}`}>
                                {user.verification_documents.map((doc, idx) => (
                                    <div key={idx} className="doc-card-premium">
                                        <div className="card-top">
                                            <div className="doc-visual">
                                                {getDocIcon(doc.name)}
                                            </div>
                                            <div className="card-actions">
                                                <a
                                                    href={normalizeDocUrl(doc.url)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="action-btn-glass"
                                                    title="View Full"
                                                >
                                                    <Eye size={18} />
                                                </a>
                                                <button
                                                    className="action-btn-glass delete"
                                                    onClick={() => handleDeleteDocument(doc.id)}
                                                    title="Delete Document"
                                                    disabled={loading}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="card-body">
                                            <h3>{doc.name}</h3>
                                            <div className="doc-meta-premium">
                                                <div className="meta-info">
                                                    <span className="category-badge">
                                                        {doc.name.includes('[') ? doc.name.split(']')[0].replace('[', '') : 'Document'}
                                                    </span>
                                                    <span className="upload-date">
                                                        {new Date(doc.uploaded_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className={`status-pill-minimal ${doc.status || 'pending'}`}>
                                                    {doc.status || 'pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <FileText size={64} strokeWidth={1} />
                                <p>No documents uploaded yet.</p>
                                <p className="small">Upload your IDs, Licenses, or Deeds to keep them organized.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Upload Form */}
                    <div className="documents-section upload-card">
                        <h2>Quick Upload</h2>

                        <div className="doc-input-group">
                            <label>Document Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Passport, License..."
                                value={uploadData.name}
                                onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                            />
                        </div>

                        <div className="doc-input-group">
                            <label>Category</label>
                            <select
                                value={uploadData.category}
                                onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div
                            className={`upload-zone ${loading ? 'loading' : ''}`}
                            onClick={() => !loading && fileInputRef.current.click()}
                        >
                            <Upload size={32} className={loading ? 'pulse' : ''} />
                            <p>
                                {loading
                                    ? `Uploading ${uploadProgress.current} of ${uploadProgress.total}...`
                                    : 'Drop files here or click to browse'}
                            </p>
                            <span className="file-info">
                                {loading ? 'Please do not close this page' : 'Max size 5MB per file (PDF, JPG, PNG)'}
                            </span>
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleUpload}
                            accept=".pdf,.jpg,.jpeg,.png"
                            multiple
                        />

                        <div className="upload-tips">
                            <h3><Shield size={16} /> Secure Storage</h3>
                            <p>All documents are encrypted and stored securely. Only you and authorized admins can view verification files.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Discreet Debug Footer */}
            {window.location.hostname === 'localhost' || localStorage.getItem('guri_debug') === 'true' ? (
                <div className="debug-footer">
                    <p>Debug Info: UID: {user?.id?.substring(0, 8)}... | Docs: {user?.verification_documents?.length || 0} | API: {api.defaults.baseURL}</p>
                </div>
            ) : null}
        </div>
    );
}

export default DocumentsPage;
