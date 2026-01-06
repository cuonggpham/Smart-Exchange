import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { userService } from '../../services/user.service';
import { useAuth } from '../../contexts/AuthContext';
import './TutorialPage.css';

const TutorialPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const stepsConfig = [
    {
      id: "01",
      titleKey: "tutorial.steps.step1.title",
      descKey: "tutorial.steps.step1.desc",
      imageUrl: "https://i.ibb.co/TMpLwhw3/image.png"
    },
    {
      id: "02",
      titleKey: "tutorial.steps.step2.title",
      descKey: "tutorial.steps.step2.desc",
      imageUrl: "https://i.ibb.co/QjDjg07s/image.png"
    },
    {
      id: "03",
      titleKey: "tutorial.steps.step3.title",
      descKey: "tutorial.steps.step3.desc",
      imageUrl: "https://i.ibb.co/TqckgYcZ/image.png"
    },
    {
      id: "04",
      titleKey: "tutorial.steps.step4.title",
      descKey: "tutorial.steps.step4.desc",
      imageUrl: "https://i.ibb.co/7dL4SQTc/image.png"
    },
    {
      id: "05",
      titleKey: "tutorial.steps.step5.title",
      descKey: "tutorial.steps.step5.desc",
      imageUrl: "https://i.ibb.co/GQgM7kc3/image.png"
    },
    {
      id: "06",
      titleKey: "tutorial.steps.step6.title",
      descKey: "tutorial.steps.step6.desc",
      imageUrl: "https://i.ibb.co/hxZrpWMf/image.png"
    }
  ];

  // Hàm xử lý khi bấm nút "Bắt đầu chat" hoặc nút "Đã hiểu"
  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // 1. Gọi API báo cho server biết user đã học xong (để lần sau không hiện lại)
      const updatedUser = await userService.completeTutorial();

      // 2. Cập nhật user context - map từ UserProfile sang User interface
      setUser({
        id: updatedUser.id,
        email: updatedUser.email,
        jobTitle: updatedUser.jobTitle,
        isTutorialCompleted: updatedUser.isTutorialCompleted,
      });

      // 3. QUAN TRỌNG: Chuyển hướng sang trang Chat thay vì trang chủ
      navigate('/chat', { replace: true });

    } catch (error) {
      console.error("Lỗi khi hoàn thành tutorial:", error);
      // Nếu lỗi API, vẫn cho sang chat tạm thời (tùy bạn chọn logic này hay không)
      // navigate('/chat'); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tutorial-page">
      {/* 1. HEADER */}
      <header className="tutorial-header">
        <div className="app-name">Smart EXchange</div>
        <LanguageSwitcher />
      </header>

      {/* 2. TOP BANNER */}
      <div className="top-banner">
        {/* Đã thêm onClick={handleComplete} vào nút này để bấm là chuyển trang luôn */}
        <button
          className="info-btn"
          onClick={handleComplete}
          disabled={isLoading}
        >
          {t('tutorial.topBannerBtn')}
        </button>
      </div>

      <main className="tutorial-main">
        {/* TITLE */}
        <h1 className="page-title">{t('tutorial.pageTitle')}</h1>

        {/* 3. ZIGZAG CONTENT */}
        <div className="steps-container">
          {stepsConfig.map((item, index) => (
            <div key={index} className={`feature-row ${index % 2 !== 0 ? 'reverse' : ''}`}>
              <div className="feature-text">
                <div className="step-badge">
                  {t('tutorial.stepBadge')} {item.id}
                </div>
                <h3 className="feature-title">{t(item.titleKey)}</h3>
                <p className="feature-desc">{t(item.descKey)}</p>
              </div>
              <div className="feature-image-box">
                <img src={item.imageUrl} alt={`Step ${item.id}`} className="feature-image" />
              </div>
            </div>
          ))}
        </div>

        {/* 4. BOTTOM CTA */}
        <div className="bottom-cta-container">
          <div className="bottom-cta-box">
            <h3 className="cta-title">{t('tutorial.cta.title')}</h3>
            <p className="cta-desc">{t('tutorial.cta.desc')}</p>

            {/* Nút này đã có sẵn hàm handleComplete */}
            <button
              onClick={handleComplete}
              className="start-btn"
              disabled={isLoading}
            >
              {isLoading ? t('tutorial.cta.loading') : t('tutorial.cta.btn')}
            </button>

            <p className="note-text">{t('tutorial.cta.note')}</p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default TutorialPage;