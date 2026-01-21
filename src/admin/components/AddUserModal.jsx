import { useState } from 'react';
import { X, Loader, Mail, User, Phone, Shield } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import './AddUserModal.css';

function AddUserModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'tenant'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await adminApi.createUser(formData);
            onSuccess?.();
            onClose();
            // Reset form
            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'tenant'
            });
        } catch (err) {
            console.error('Failed to create user:', err);
            setError(err.response?.data?.detail || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New User</h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>
                            <User size={18} />
                            Full Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            minLength="2"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Mail size={18} />
                            Email Address *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Phone size={18} />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+254 712 345 678"
                        />
                    </div>

                    <div className="form-group">
                        <label>
                            <Shield size={18} />
                            Password *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="8"
                            placeholder="Minimum 8 characters"
                        />
                        <span className="field-hint">
                            User can change this after first login
                        </span>
                    </div>

                    <div className="form-group">
                        <label>
                            <Shield size={18} />
                            Role *
                        </label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="tenant">Tenant</option>
                            <option value="agent">Agent</option>
                            <option value="admin">Admin</option>
                        </select>
                        <span className="field-hint">
                            User will receive a welcome email with login instructions
                        </span>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="animate-spin" size={18} />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddUserModal;
