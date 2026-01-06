import React from 'react';
import { User } from 'lucide-react';

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    src,
    name = "User",
    size = 40,
    className = "",
    style = {}
}) => {
    // Helper to get initials
    const getInitials = (userName: string) => {
        return userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const containerStyle: React.CSSProperties = {
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#e5e7eb', // default gray-200
        ...style
    };

    if (src) {
        return (
            <div className={`user-avatar ${className}`} style={containerStyle}>
                <img
                    src={src}
                    alt={name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                    onError={(e) => {
                        // Fallback to placeholder if image fails
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.classList.add('avatar-fallback-active');
                    }}
                />
                {/* Fallback element (hidden unless img fails and logic handles it, but typically simpler to just render icon if src invalid) */}
            </div>
        );
    }

    return (
        <div className={`user-avatar placeholder ${className}`} style={{ ...containerStyle, backgroundColor: '#f3f4f6' }}>
            <span style={{ fontSize: size * 0.4, fontWeight: 600, color: '#4b5563' }}>
                {getInitials(name)}
            </span>
        </div>
    );
};

export default UserAvatar;
