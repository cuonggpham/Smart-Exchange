import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import "./landing.css";
import {
  Bot,
  Send,
  PenTool,
  FileText,
  Clock,
  Shield,
  Laptop,
  Briefcase,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Users,
  MessageCircle,
} from "lucide-react";
import UserAvatar from "../../components/UserAvatar";

// Phone mockup image - using placeholder
const phoneHeroImg = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=600&fit=crop";
const phoneAboutImg = "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=500&fit=crop";
const phoneBottomImg = "https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?w=350&h=700&fit=crop";

// Testimonial avatars
const avatar1 = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face";
const avatar2 = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face";
const avatar3 = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face";

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const langCtx = useLanguage();
  if (!langCtx) return null;

  const { lang, setLang } = langCtx;
  const isJP = lang === "jp";

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      question: isJP ? "Smart EXchangeとは何ですか？" : "Smart EXchange là gì?",
      answer: isJP
        ? "Smart EXchangeは、日越間のビジネスコミュニケーションを支援するAIチャットアプリです。文法・文脈・文化を分析し、最適な表現を提案することで、プロフェッショナルなコミュニケーションを実現します。"
        : "Smart EXchange là ứng dụng chat AI hỗ trợ giao tiếp Nhật-Việt chuyên nghiệp. Ứng dụng phân tích ngữ pháp, ngữ cảnh và văn hóa để đề xuất cách diễn đạt phù hợp nhất.",
    },
    {
      question: isJP ? "AIはどのように翻訳を改善しますか？" : "AI cải thiện bản dịch như thế nào?",
      answer: isJP
        ? "AIは単なる翻訳ではなく、ビジネス文脈と文化的背景を理解した上で、最も適切な表現を提案します。敬語レベル、業界用語、文化的ニュアンスを考慮します。"
        : "AI không chỉ dịch thuần túy mà còn hiểu bối cảnh kinh doanh và văn hóa để đề xuất cách diễn đạt phù hợp nhất. AI xem xét mức độ kính ngữ, thuật ngữ ngành và sắc thái văn hóa.",
    },
    {
      question: isJP ? "文化チェック機能とは何ですか？" : "Tính năng kiểm tra văn hóa là gì?",
      answer: isJP
        ? "文化チェック機能は、メッセージ内の文化的に不適切な表現や誤解を招く可能性のある内容を検出し、より適切な代替案を提案します。"
        : "Tính năng kiểm tra văn hóa phát hiện các biểu đạt không phù hợp về mặt văn hóa hoặc có thể gây hiểu lầm trong tin nhắn và đề xuất các lựa chọn thay thế phù hợp hơn.",
    },
    {
      question: isJP ? "どのような人に向いていますか？" : "Ứng dụng phù hợp với ai?",
      answer: isJP
        ? "日本企業と協働するベトナム人エンジニア、ベトナムチームを管理する日本人マネージャー、日越ビジネスに関わる全ての方に最適です。"
        : "Ứng dụng phù hợp với kỹ sư Việt Nam làm việc với doanh nghiệp Nhật, quản lý Nhật làm việc với team Việt, và tất cả những ai tham gia vào giao tiếp Nhật-Việt.",
    },
    {
      question: isJP ? "無料で使用できますか？" : "Có thể sử dụng miễn phí không?",
      answer: isJP
        ? "はい、基本機能は無料でご利用いただけます。プレミアム機能にはサブスクリプションが必要ですが、無料トライアルも提供しています。"
        : "Có, các tính năng cơ bản hoàn toàn miễn phí. Các tính năng cao cấp yêu cầu đăng ký gói, nhưng chúng tôi cũng cung cấp bản dùng thử miễn phí.",
    },
  ];

  const testimonials = [
    {
      name: isJP ? "田中 健太" : "Nguyễn Văn An",
      date: isJP ? "2025年1月" : "Tháng 1, 2025",
      avatar: avatar1,
      text: isJP
        ? "ベトナムチームとのコミュニケーションが劇的に改善しました。AIが文化的なニュアンスまで考慮してくれるので、誤解が減りました。"
        : "Giao tiếp với đối tác Nhật trở nên dễ dàng hơn rất nhiều. AI giúp tôi viết email chuyên nghiệp và phù hợp với văn hóa Nhật Bản.",
    },
    {
      name: isJP ? "佐藤 美咲" : "Trần Thị Bình",
      date: isJP ? "2024年12月" : "Tháng 12, 2024",
      avatar: avatar2,
      text: isJP
        ? "敬語の使い分けに自信がなかったのですが、Smart EXchangeのおかげで適切な表現を選べるようになりました。"
        : "Tính năng kiểm tra văn hóa thực sự hữu ích. Tôi không còn lo lắng về việc vô tình gây hiểu lầm với đồng nghiệp Nhật nữa.",
    },
    {
      name: isJP ? "山田 花子" : "Lê Minh Châu",
      date: isJP ? "2024年11月" : "Tháng 11, 2024",
      avatar: avatar3,
      text: isJP
        ? "毎日のメール作成時間が半分に短縮されました。特に技術用語の翻訳精度が素晴らしいです。"
        : "Thời gian viết báo cáo bằng tiếng Nhật giảm đáng kể. AI đề xuất cách diễn đạt tự nhiên và chuyên nghiệp hơn rất nhiều.",
    },
  ];

  return (
    <div className="landing">
      {/* ================= HEADER ================= */}
      <header className="landing-header">
        <div className="header-logo">
          <MessageCircle className="logo-icon" size={32} />
          <span className="logo-text">Smart EXchange</span>
        </div>

        <nav className="header-nav">
          <a href="#home">{isJP ? "ホーム" : "Trang chủ"}</a>
          <a href="#service">{isJP ? "サービス" : "Dịch vụ"}</a>
          <a href="#about">{isJP ? "会社概要" : "Giới thiệu"}</a>
          <a href="#contact">{isJP ? "お問い合わせ" : "Liên hệ"}</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="header-actions">
          <div className="lang-switch">
            <button
              className={`lang-btn ${!isJP ? "active" : ""}`}
              onClick={() => setLang("vi")}
            >
              VI
            </button>
            <button
              className={`lang-btn ${isJP ? "active" : ""}`}
              onClick={() => setLang("jp")}
            >
              JP
            </button>
          </div>

          <button className="login-btn" onClick={() => navigate("/login")}>
            {isJP ? "ログイン" : "Đăng nhập"}
          </button>
          <button className="get-started-btn" onClick={() => navigate("/register")}>
            {isJP ? "始める" : "Bắt đầu"}
          </button>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-text">
            <h1>
              {isJP
                ? "日越コミュニケーションの\nブレイクスルーを実現"
                : "Đột phá giao tiếp\nNhật - Việt"}
            </h1>
            <p>
              {isJP
                ? "Smart EXchangeは、日越間のビジネス・文化的背景を理解したAIチャットで、プロフェッショナルなコミュニケーションを支援します。文法・文脈・文化を分析し、最適な表現を提案します。"
                : "Smart EXchange là ứng dụng chat AI hỗ trợ giao tiếp Nhật – Việt chuyên nghiệp, phù hợp với bối cảnh kinh doanh và văn hóa. AI phân tích ngữ pháp, ngữ cảnh và văn hóa để đề xuất câu phù hợp nhất."}
            </p>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate("/register")}>
                {isJP ? "無料で始める" : "Bắt đầu miễn phí"}
              </button>
              <button className="btn-link">
                {isJP ? "詳しく見る" : "Tìm hiểu thêm"}
                <span className="underline"></span>
              </button>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <strong>99%</strong>
                <span>{isJP ? "文法正確性" : "Độ chính xác ngữ pháp"}</span>
              </div>
              <div className="stat-item">
                <strong>60%</strong>
                <span>{isJP ? "作業時間削減" : "Giảm thời gian làm việc"}</span>
              </div>
              <div className="stat-item">
                <strong>1,200+</strong>
                <span>{isJP ? "プロユーザー" : "Người dùng chuyên nghiệp"}</span>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="phone-mockup">
              <img src={phoneHeroImg} alt="App preview" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="about-section" id="about">
        <div className="section-header">
          <h2>{isJP ? "会社概要" : "VỀ CHÚNG TÔI"}</h2>
          <div className="section-line"></div>
          <p className="section-subtitle">
            {isJP
              ? "Smart EXchangeは、言語の壁を越えた真のコミュニケーションを実現します"
              : "Smart EXchange giúp bạn vượt qua rào cản ngôn ngữ để giao tiếp hiệu quả"}
          </p>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="features-section" id="service">
        <div className="features-content">
          <div className="features-text">
            <h2>
              {isJP
                ? "AIが文法・文脈・文化を分析し、最適な表現を提案します。"
                : "AI phân tích ngữ pháp, ngữ cảnh và văn hóa để đề xuất cách diễn đạt tốt nhất."}
            </h2>
            <p>
              {isJP
                ? "ビジネスメール、チャット、レポート作成など、あらゆるシーンで自然で適切な日越コミュニケーションを実現。文化チェック機能で誤解を未然に防ぎます。"
                : "Dù là email công việc, chat hay viết báo cáo, Smart EXchange giúp bạn giao tiếp tự nhiên và phù hợp. Tính năng kiểm tra văn hóa giúp tránh hiểu lầm không đáng có."}
            </p>
            <div className="features-buttons">
              <button className="btn-primary" onClick={() => navigate("/register")}>
                {isJP ? "今すぐ試す" : "Dùng thử ngay"}
              </button>
              <button className="btn-secondary">
                {isJP ? "詳しく見る" : "Tìm hiểu thêm"}
              </button>
            </div>
          </div>
          <div className="features-image">
            <div className="image-decoration"></div>
            <div className="phone-mockup-rotated">
              <img src={phoneAboutImg} alt="App features" />
            </div>
            <div className="connect-badge">
              <div className="avatar-stack">
                <img src={avatar1} alt="User 1" />
                <img src={avatar2} alt="User 2" />
                <img src={avatar3} alt="User 3" />
              </div>
              <span>{isJP ? "チームとつながる" : "Kết nối với đồng nghiệp"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS SECTION ================= */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>{isJP ? "お客様の声" : "ĐÁNH GIÁ"}</h2>
          <div className="section-line blue"></div>
          <p className="section-subtitle">
            {isJP
              ? "Smart EXchangeの声：満足したユーザーからのご意見"
              : "Tiếng nói từ Smart EXchange: Lắng nghe từ những người dùng hài lòng"}
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div className="testimonial-card" key={index}>
              <div className="testimonial-avatar">
                <UserAvatar src={testimonial.avatar} name={testimonial.name} size={70} />
              </div>
              <div className="testimonial-content">
                <h4>{testimonial.name}</h4>
                <span className="testimonial-date">{testimonial.date}</span>
                <p>{testimonial.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="testimonial-nav">
          <button className="nav-btn prev">
            <ChevronDown className="rotate-90" />
          </button>
          <button className="nav-btn next">
            <ChevronDown className="rotate-270" />
          </button>
        </div>
      </section>

      {/* ================= CTA SECTION ================= */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-image">
            <div className="dots-decoration top-right"></div>
            <div className="dots-decoration bottom-left"></div>
            <div className="circle-decoration top"></div>
            <div className="circle-decoration bottom"></div>
            <div className="phone-mockup">
              <img src={phoneHeroImg} alt="App preview" />
            </div>
          </div>
          <div className="cta-text">
            <h2>
              {isJP
                ? "言語の壁を超えて、真のコミュニケーションを始めましょう。"
                : "Hãy vượt qua rào cản ngôn ngữ và bắt đầu giao tiếp thực sự."}
            </h2>
            <p>
              {isJP
                ? "Smart EXchangeは、単なる翻訳ツールではありません。ビジネス文脈と文化的背景を理解し、あなたの言葉を相手に正確に伝えるパートナーです。今すぐ無料で始めましょう。"
                : "Smart EXchange không chỉ là công cụ dịch thuật. Đây là người đồng hành giúp bạn truyền đạt chính xác ý tưởng của mình, với sự hiểu biết về bối cảnh kinh doanh và văn hóa."}
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate("/register")}>
                {isJP ? "無料で始める" : "Bắt đầu miễn phí"}
              </button>
              <button className="btn-secondary">
                {isJP ? "詳しく見る" : "Tìm hiểu thêm"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="faq-section" id="faq">
        <div className="section-header">
          <h2>FAQ</h2>
          <div className="section-line"></div>
          <p className="section-subtitle">
            {isJP
              ? "Smart EXchangeを理解する：よくある質問"
              : "Hiểu về Smart EXchange: Các câu hỏi thường gặp"}
          </p>
        </div>

        <div className="faq-list">
          {faqData.map((faq, index) => (
            <div
              className={`faq-item ${openFaq === index ? "open" : ""}`}
              key={index}
            >
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{faq.question}</span>
                {openFaq === index ? (
                  <ChevronUp size={24} />
                ) : (
                  <ChevronDown size={24} />
                )}
              </button>
              {openFaq === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ================= DOWNLOAD SECTION ================= */}
      <section className="download-section">
        <div className="download-content">
          <div className="download-text">
            <h2>
              {isJP
                ? "今すぐ始めて、コミュニケーションを変革しましょう"
                : "Bắt đầu ngay và thay đổi cách giao tiếp của bạn"}
            </h2>
            <p>
              {isJP
                ? "Smart EXchange：日越プロフェッショナルコミュニケーションの新しいスタンダード"
                : "Smart EXchange: Tiêu chuẩn mới cho giao tiếp chuyên nghiệp Nhật-Việt"}
            </p>
            <div className="download-buttons">
              <button className="btn-primary large" onClick={() => navigate("/register")}>
                {isJP ? "無料で登録する" : "Đăng ký miễn phí"}
              </button>
              <button className="btn-secondary large" onClick={() => navigate("/login")}>
                {isJP ? "ログイン" : "Đăng nhập"}
              </button>
            </div>
          </div>
          <div className="download-image">
            <div className="circle-bg"></div>
            <div className="dots-pattern"></div>
            <div className="phone-mockup large">
              <img src={phoneBottomImg} alt="Download app" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer" id="contact">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <MessageCircle className="logo-icon" size={28} />
              <span className="logo-text">Smart EXchange</span>
            </div>
            <p>
              {isJP
                ? "Smart EXchange - 言語の壁を越えて、真のコミュニケーションを実現するAIパートナー"
                : "Smart EXchange - Đối tác AI giúp bạn vượt qua rào cản ngôn ngữ, giao tiếp thực sự hiệu quả"}
            </p>
          </div>

          <div className="footer-links">
            <h4>{isJP ? "ページ" : "Trang"}</h4>
            <a href="#home">{isJP ? "ホーム" : "Trang chủ"}</a>
            <a href="#service">{isJP ? "サービス" : "Dịch vụ"}</a>
            <a href="#about">{isJP ? "会社概要" : "Giới thiệu"}</a>
            <a href="#contact">{isJP ? "お問い合わせ" : "Liên hệ"}</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="footer-newsletter">
            <h4>{isJP ? "ニュースレター" : "Bản tin"}</h4>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder={isJP ? "メールアドレス..." : "Địa chỉ email..."}
              />
              <button className="send-btn">
                <ArrowRight size={18} />
              </button>
            </div>
            <button className="subscribe-btn">
              {isJP ? "送信" : "Gửi"}
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            © 2025 Smart EXchange. {isJP ? "全著作権所有。" : "Đã đăng ký bản quyền."}
          </p>
        </div>
      </footer>
    </div>
  );
}
