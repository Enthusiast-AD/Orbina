import React, { useState } from 'react';
import { 
    Settings, Save, RefreshCw, Shield, Globe, Bell, 
    Database, Users, Lock, Eye, EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: 'Orbina',
        siteDescription: 'A platform for writers and readers',
        allowRegistration: true,
        requireEmailVerification: true,
        enableComments: true,
        enableLikes: true,
        enableBookmarks: true,
        enableMessages: true,
        moderationMode: 'auto',
        maxPostsPerUser: 100,
        maxFileSize: 5, // MB
        allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx',
        emailNotifications: true,
        maintenanceMode: false,
        maintenanceMessage: 'Site is under maintenance. Please check back later.',
    });

    const [saving, setSaving] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real implementation, you would save to your backend
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Settings className="w-8 h-8 text-purple-400" />
                        Platform Settings
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Configure platform behavior and features
                    </p>
                </div>
                
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>

            {/* Site Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Site Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleInputChange('siteName', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Site Description</label>
                        <textarea
                            value={settings.siteDescription}
                            onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* User Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    User Management
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Allow New Registrations</div>
                            <div className="text-slate-400 text-sm">Users can create new accounts</div>
                        </div>
                        <button
                            onClick={() => handleInputChange('allowRegistration', !settings.allowRegistration)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.allowRegistration ? 'bg-purple-600' : 'bg-slate-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-white font-medium">Email Verification Required</div>
                            <div className="text-slate-400 text-sm">Users must verify email to access features</div>
                        </div>
                        <button
                            onClick={() => handleInputChange('requireEmailVerification', !settings.requireEmailVerification)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.requireEmailVerification ? 'bg-purple-600' : 'bg-slate-600'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.requireEmailVerification ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Platform Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-medium">Enable Likes</div>
                                <div className="text-slate-400 text-sm">Users can like posts</div>
                            </div>
                            <button
                                onClick={() => handleInputChange('enableLikes', !settings.enableLikes)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.enableLikes ? 'bg-purple-600' : 'bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.enableLikes ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-medium">Enable Bookmarks</div>
                                <div className="text-slate-400 text-sm">Users can bookmark posts</div>
                            </div>
                            <button
                                onClick={() => handleInputChange('enableBookmarks', !settings.enableBookmarks)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.enableBookmarks ? 'bg-purple-600' : 'bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.enableBookmarks ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-medium">Enable Messages</div>
                                <div className="text-slate-400 text-sm">Users can send direct messages</div>
                            </div>
                            <button
                                onClick={() => handleInputChange('enableMessages', !settings.enableMessages)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.enableMessages ? 'bg-purple-600' : 'bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.enableMessages ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-white font-medium">Email Notifications</div>
                                <div className="text-slate-400 text-sm">Send email notifications to users</div>
                            </div>
                            <button
                                onClick={() => handleInputChange('emailNotifications', !settings.emailNotifications)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    settings.emailNotifications ? 'bg-purple-600' : 'bg-slate-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-700/30 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl font-semibold text-white">Advanced Settings</span>
                    </div>
                    {showAdvanced ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                </button>
                
                {showAdvanced && (
                    <div className="px-6 pb-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Max Posts Per User</label>
                                <input
                                    type="number"
                                    value={settings.maxPostsPerUser}
                                    onChange={(e) => handleInputChange('maxPostsPerUser', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Max File Size (MB)</label>
                                <input
                                    type="number"
                                    value={settings.maxFileSize}
                                    onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Allowed File Types</label>
                            <input
                                type="text"
                                value={settings.allowedFileTypes}
                                onChange={(e) => handleInputChange('allowedFileTypes', e.target.value)}
                                placeholder="jpg,jpeg,png,gif,pdf,doc,docx"
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <p className="text-slate-400 text-sm mt-1">Comma-separated list of allowed file extensions</p>
                        </div>

                        {/* Maintenance Mode */}
                        <div className="border-t border-slate-700 pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-white font-medium">Maintenance Mode</div>
                                    <div className="text-slate-400 text-sm">Temporarily disable site access for maintenance</div>
                                </div>
                                <button
                                    onClick={() => handleInputChange('maintenanceMode', !settings.maintenanceMode)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            
                            {settings.maintenanceMode && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Maintenance Message</label>
                                    <textarea
                                        value={settings.maintenanceMessage}
                                        onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSettings;