import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Search,
    Filter,
    Copy,
    Trash2,
    Calendar,
    User,
    MessageCircle,
    Lightbulb,
    FileText,
    CheckCircle2,
    XCircle,
    CopyCheck
} from 'lucide-react';
import { historyService, type SuggestionHistoryItem } from '../services/history.service';
import '../styles/HistoryPage.css';

const HistoryPage: React.FC = () => {
    const { t } = useTranslation();
    const [history, setHistory] = useState<SuggestionHistoryItem[]>([]);
    const [receivers, setReceivers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedReceiver, setSelectedReceiver] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [historyData, receiversData] = await Promise.all([
                historyService.getHistory(1, 100),
                historyService.getReceivers()
            ]);
            setHistory(historyData.items);
            setReceivers(receiversData);
        } catch (error) {
            console.error('Failed to load history data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm(t('chat.history.deleteConfirm'))) {
            try {
                await historyService.deleteHistory(id);
                setHistory(prev => prev.filter(item => item.historyId !== id));
            } catch (error) {
                console.error('Failed to delete history item:', error);
            }
        }
    };

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.selectedSuggestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.receiverName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesReceiver = !selectedReceiver || item.receiverName === selectedReceiver;
            return matchesSearch && matchesReceiver;
        });
    }, [history, searchQuery, selectedReceiver]);

    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: SuggestionHistoryItem[] } = {};

        filteredHistory.forEach(item => {
            const date = new Date(item.createdAt);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            let dateLabel = '';
            if (date.toDateString() === today.toDateString()) {
                dateLabel = t('chat.history.dateToday');
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateLabel = t('chat.history.dateYesterday');
            } else {
                dateLabel = date.toLocaleDateString();
            }

            if (!groups[dateLabel]) {
                groups[dateLabel] = [];
            }
            groups[dateLabel].push(item);
        });

        return groups;
    }, [filteredHistory, t]);

    return (
        <div className="history-page">
            <header className="history-header">
                <div className="history-title-group">
                    <h1>{t('chat.history.title')}</h1>
                    <p>{t('chat.history.subtitle')}</p>
                </div>

                <div className="history-controls">
                    <div className="history-search-container">
                        <Search size={18} className="history-search-icon" />
                        <input
                            type="text"
                            className="history-search-input"
                            placeholder={t('chat.history.searchByReceiver')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <select
                        className="history-select"
                        value={selectedReceiver}
                        onChange={(e) => setSelectedReceiver(e.target.value)}
                    >
                        <option value="">{t('chat.history.filterAll')}</option>
                        {receivers.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            </header>

            {isLoading ? (
                <div className="history-empty">
                    <div className="animate-spin history-empty-icon">
                        <MessageCircle size={48} />
                    </div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="history-empty">
                    <div className="history-empty-icon text-muted">
                        <FileText size={48} />
                    </div>
                    <p>{t('chat.history.empty')}</p>
                </div>
            ) : (
                Object.entries(groupedHistory).map(([date, items]) => (
                    <div key={date} className="history-date-group">
                        <div className="history-date-label">
                            <Calendar size={16} />
                            {date}
                        </div>

                        <div className="history-grid">
                            {items.map(item => (
                                <div key={item.historyId} className="history-card animate-fade-in-up">
                                    <div className="history-card-header">
                                        <div className="history-receiver">
                                            <User size={16} className="text-secondary" />
                                            {item.receiverName}
                                        </div>
                                        <span className={`history-level-badge ${item.suggestionLevel}`}>
                                            {item.suggestionLevel}
                                        </span>
                                    </div>

                                    <div className="history-card-body">
                                        <div className="history-item-section">
                                            <span className="history-item-label">
                                                <Filter size={12} style={{ marginRight: '4px' }} />
                                                {t('chat.history.usedContext')}
                                            </span>
                                            <div className="history-context-box">
                                                <span className="history-item-value">
                                                    {item.contextDescription || t('chat.history.noContext')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="history-item-section">
                                            <span className="history-item-label">{t('chat.history.original')}</span>
                                            <span className="history-item-value history-original-text">
                                                「{item.originalText}」
                                            </span>
                                        </div>

                                        <div className="history-item-section">
                                            <span className="history-item-label">
                                                <CheckCircle2 size={12} style={{ marginRight: '4px', color: 'var(--primary-color)' }} />
                                                {t('chat.history.suggestion')}
                                            </span>
                                            <span className="history-item-value history-suggestion-text">
                                                {item.selectedSuggestion}
                                            </span>
                                        </div>

                                        {item.culturalNotes && (
                                            <div className="history-item-section">
                                                <div className="history-cultural-note">
                                                    <Lightbulb size={16} className="text-warning" />
                                                    <span>{item.culturalNotes}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="history-card-footer">
                                        <button
                                            className="history-action-btn copy"
                                            onClick={() => handleCopy(item.historyId, item.selectedSuggestion)}
                                        >
                                            {copiedId === item.historyId ? (
                                                <><CopyCheck size={14} /> {t('chat.history.copied')}</>
                                            ) : (
                                                <><Copy size={14} /> {t('chat.history.copy')}</>
                                            )}
                                        </button>
                                        <button
                                            className="history-action-btn delete"
                                            onClick={() => handleDelete(item.historyId)}
                                        >
                                            <Trash2 size={14} />
                                            {t('chat.history.delete')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default HistoryPage;
