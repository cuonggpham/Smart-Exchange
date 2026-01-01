import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import "./landing.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const langCtx = useLanguage();
  if (!langCtx) return null; // 🛡️ FIX TRẮNG TRANG

  const { lang, setLang } = langCtx;
  const isJP = lang === "jp";

  return (
    <div className="landing">
      {/* ================= HEADER (1)(2)(3) ================= */}
      <header className="landing-header">
        <div className="logo">Smart EXchange</div>

        <div className="header-actions">
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

          <button className="login-btn" onClick={() => navigate("/login")}>
            {isJP ? "ログイン" : "Đăng nhập"}
          </button>
        </div>
      </header>

      {/* ================= HERO (4)(5)(6) ================= */}
      <section className="hero">
        <div>
          <h1>
            {isJP
              ? "自然で正確な日越コミュニケーションの\nブレイクスルーを実現。"
              : "Tạo đột phá trong giao tiếp Nhật – Việt\nmột cách tự nhiên và chính xác."}
          </h1>

          <p>
            {isJP
              ? "Smart EXchangeは、日越間のビジネス・文化的背景を理解したAIチャットで、プロフェッショナルなコミュニケーションを支援します。"
              : "Smart EXchange là ứng dụng chat AI hỗ trợ giao tiếp Nhật – Việt chuyên nghiệp, phù hợp với bối cảnh kinh doanh và văn hóa."}
          </p>

          <button
            className="register-btn"
            onClick={() => navigate("/register")}
          >
            {isJP ? "今すぐ登録（無料）" : "Đăng ký ngay (Miễn phí)"}
          </button>
        </div>
      </section>

      {/* ================= STEPS (7) ================= */}
      <section className="steps">
        <h2>
          {isJP ? "Smart EXchangeの利用手順" : "Cách sử dụng Smart EXchange"}
        </h2>

        <p className="steps-subtitle">
          {isJP
            ? "たった3つのシンプルなステップで、あらゆる会話をマスターできます。"
            : "Chỉ với 3 bước đơn giản, bạn có thể làm chủ mọi cuộc hội thoại."}
        </p>

        <div className="step-list">
          <div className="step-card red">
            <div className="step-icon">✍️</div>
            <div className="step-title">
              {isJP ? "メッセージ入力" : "Nhập nội dung"}
            </div>
            <div className="step-desc">
              {isJP
                ? "ベトナム語または日本語でメッセージを入力します。"
                : "Nhập nội dung bằng tiếng Việt hoặc tiếng Nhật."}
            </div>
          </div>

          <div className="step-card blue">
            <div className="step-icon">🤖</div>
            <div className="step-title">
              {isJP ? "AI分析・提案" : "AI phân tích & đề xuất"}
            </div>
            <div className="step-desc">
              {isJP
                ? "AIが文法・文脈・文化を分析し、最適な表現を提案します。"
                : "AI phân tích ngữ pháp, ngữ cảnh và văn hóa để đề xuất câu phù hợp."}
            </div>
          </div>

          <div className="step-card green">
            <div className="step-icon">📤</div>
            <div className="step-title">
              {isJP ? "選択＆送信" : "Chọn và gửi"}
            </div>
            <div className="step-desc">
              {isJP
                ? "最適な表現を選択して、相手に送信します。"
                : "Chọn câu phù hợp nhất và gửi cho đối tác."}
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUES (8) ================= */}
      <section className="values">
        <h2>
          {isJP
            ? "Smart EXchangeがもたらす卓越した価値"
            : "Giá trị nổi bật của Smart EXchange"}
        </h2>

        <div className="value-list">
          <div>
            <div className="value-icon red">📝</div>
            <strong>{isJP ? "文章品質の向上" : "Cải thiện chất lượng câu văn"}</strong>
            <p>
              {isJP
                ? "文法・表現の精度を向上させ、自然な文章を実現します。"
                : "Nâng cao độ chính xác và sự tự nhiên của câu văn."}
            </p>
          </div>

          <div>
            <div className="value-icon blue">⏱️</div>
            <strong>
              {isJP
                ? "コミュニケーション速度の最適化"
                : "Tối ưu tốc độ giao tiếp"}
            </strong>
            <p>
              {isJP
                ? "確認や修正の時間を大幅に削減します。"
                : "Giảm đáng kể thời gian kiểm tra và chỉnh sửa."}
            </p>
          </div>

          <div>
            <div className="value-icon green">🛡️</div>
            <strong>
              {isJP
                ? "文化的リスクの最小化"
                : "Giảm thiểu rủi ro văn hóa"}
            </strong>
            <p>
              {isJP
                ? "文化差による誤解を防ぎます。"
                : "Hạn chế hiểu lầm do khác biệt văn hóa."}
            </p>
          </div>
        </div>
      </section>

      {/* ================= STATS (9) ================= */}
      <section className="stats">
        <div><strong>150K+</strong>{isJP ? "表現チェック/月" : "Lượt kiểm tra/tháng"}</div>
        <div><strong>99%</strong>{isJP ? "文法正確性" : "Độ chính xác ngữ pháp"}</div>
        <div><strong>60%</strong>{isJP ? "作業時間削減" : "Giảm thời gian làm việc"}</div>
        <div><strong>1,200+</strong>{isJP ? "プロユーザー" : "Người dùng chuyên nghiệp"}</div>
      </section>

      {/* ================= USERS (10) ================= */}
      <section className="users">
        <h2>{isJP ? "想定ユーザー" : "Đối tượng người dùng"}</h2>

        <ul>
          <li>
            <div className="user-icon blue">💻</div>
            {isJP
              ? "日本企業と協働するベトナム人エンジニア"
              : "Kỹ sư Việt Nam làm việc với doanh nghiệp Nhật"}
          </li>
          <li>
            <div className="user-icon red">👔</div>
            {isJP
              ? "ベトナムチームと協働する日本人マネージャー／リーダー"
              : "Quản lý / leader Nhật làm việc với team Việt"}
          </li>
          <li>
            <div className="user-icon yellow">🎓</div>
            {isJP
              ? "教育者、エンジニアなど"
              : "Giáo viên, kỹ sư và các đối tượng khác"}
          </li>
        </ul>
      </section>

      {/* ================= FOOTER CTA (11) ================= */}
      <section className="footer-cta">
        <h2>
          {isJP
            ? "今すぐ制限のないコミュニケーションを始めましょう。"
            : "Hãy bắt đầu giao tiếp không giới hạn ngay bây giờ."}
        </h2>

        <button onClick={() => navigate("/register")}>
          {isJP ? "無料トライアルを開始" : "Bắt đầu dùng thử miễn phí"}
        </button>
      </section>

      {/* ================= FOOTER (12) ================= */}
      <footer className="footer">
        © 2025 Smart EXchange ·{" "}
        {isJP
          ? "利用規約・プライバシーポリシー"
          : "Điều khoản sử dụng · Chính sách bảo mật"}
      </footer>
    </div>
  );
}
