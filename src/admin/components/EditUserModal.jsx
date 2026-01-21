import { useState, useEffect } from 'react';
import { X, Loader, Mail, User, Phone, Shield } from 'lucide-react';
import adminApi from '../../utils/adminApi';
import '../components/AddUserModal.css'; // Reuse same styles

function EditUserModal({ isOpen, onClose, onSuccess, user }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'tenant'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                password: '', // Don't pre-fill password
                role: user.role || 'tenant'
            });
        }
    }, [user]);

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
            // Only send fields that have values
            const updateData = {};
            if (formData.name) updateData.name = formData.name;
            if (formData.email) updateData.email = formData.email;
            if (formData.phone) updateData.phone = formData.phone;
            if (formData.password) updateData.password = formData.password;
            if (formData.role) updateData.role = formData.role;

            await adminApi.updateUser(user.id, updateData);
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Failed to update user:', err);
            setError(err.response?.data?.detail || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Edit User</h2>
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
                            New Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength="8"
                            placeholder="Leave blank to keep current password"
                        />
                        <span className="field-hint">
                            Only fill this if you want to change the password
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
                                    Updating...
                                </>
                            ) : (
                                'Update User'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditUserModal;
