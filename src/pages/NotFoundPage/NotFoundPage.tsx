import { Link } from "react-router-dom";
import "./NotFoundPage.scss";

function NotFoundPage() {
    return (
        <section className="not-found-card card text-center">
            <h1>404</h1>
            <p>ページが見つかりませんでした。</p>
            <Link to="/" className="button secondary">
                ランキングに戻る
            </Link>
        </section>
    );
}

export default NotFoundPage;
