import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { MessageSquare, User, Settings, LogOut } from "lucide-react";

const HomePage: React.FC = () => {
    const { t } = useTranslation();
    const { user, settings, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await logout();
        setLoading(false);
    };

    const navCards = [
        {
            icon: User,
            title: t('home.actions.goToProfile'),
            description: t('home.profileDescription') || 'View and edit your profile information',
            path: '/profile',
            color: 'var(--primary-color)',
            bg: 'var(--primary-light)',
        },
        {
            icon: Settings,
            title: t('home.actions.goToSettings'),
            description: t('home.settingsDescription') || 'Configure your preferences',
            path: '/settings',
            color: 'var(--secondary-color)',
            bg: 'var(--secondary-light)',
        },
        {
            icon: MessageSquare,
            title: t('home.actions.goToChat'),
            description: t('home.chatDescription') || 'Start or continue conversations',
            path: '/chat',
            color: 'var(--accent-color)',
            bg: 'var(--accent-light)',
        },
    ];

    return (
        <div className="dashboard-container animate-fade-in">
            {/* Header */}
            <header className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">{t('home.title')}</h1>
                    <p className="text-muted">{t('home.welcome') || 'Welcome back!'}</p>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="danger-btn flex items-center gap-2"
                    style={{ width: 'auto' }}
                >
                    {loading ? (
                        <span className="spinner" />
                    ) : (
                        <LogOut size={18} />
                    )}
                    {loading ? t('home.actions.loggingOut') : t('home.actions.logout')}
                </button>
            </header>

            {/* User Info Section */}
            <section className="user-info-section animate-fade-in-up">
                <h2 className="user-info-title">{t('home.userInfo.title') || 'Your Account'}</h2>
                <div className="user-info-grid">
                    <div className="user-info-item">
                        <span className="user-info-label">{t('home.userInfo.email')}</span>
                        <span className="user-info-value">{user?.email || '-'}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">{t('home.userInfo.jobTitle')}</span>
                        <span className="user-info-value">{user?.jobTitle || t('home.userInfo.notAvailable')}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">{t('home.userInfo.language')}</span>
                        <span className="user-info-value">{settings?.language === 'vi' ? 'Tiếng Việt' : settings?.language === 'jp' ? '日本語' : settings?.language || t('home.userInfo.notAvailable')}</span>
                    </div>
                    <div className="user-info-item">
                        <span className="user-info-label">{t('home.userInfo.theme')}</span>
                        <span className="user-info-value" style={{ textTransform: 'capitalize' }}>{settings?.theme || t('home.userInfo.notAvailable')}</span>
                    </div>
                </div>
            </section>

            {/* Navigation Cards */}
            <section className="dashboard-grid">
                {navCards.map((card, index) => (
                    <div
                        key={card.path}
                        className="nav-card animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                        onClick={() => navigate(card.path)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && navigate(card.path)}
                    >
                        <div
                            className="nav-card-icon"
                            style={{ background: card.bg, color: card.color }}
                        >
                            <card.icon size={24} />
                        </div>
                        <div className="nav-card-content">
                            <h3>{card.title}</h3>
                            <p>{card.description}</p>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default HomePage;
