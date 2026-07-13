import { Link } from "react-router-dom";
import { Logo } from "../Logo";
import { useAppStore } from "../../store/useAppStore";
import { translate } from "../../data/translations";

export function Footer() {
  const language = useAppStore((state) => state.language);
  const t = (key: string) => translate(language, key);
  const product = [
    [t("detectDisease"), "/detect"],
    [t("supportedCropTypes"), "/dataset"],
    [t("analytics"), "/analytics"],
  ];
  const resources = [
    [t("aiModelDetails"), "/analytics"],
    [t("research"), "/research"],
    [t("dashboardTitle"), "/dashboard"],
  ];

  return (
    <footer className="border-t border-border/70 bg-card/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
            {t("footerDescription")}
          </p>
          <p className="mt-6 text-xs text-muted">{t("copyrightLine")}</p>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">{t("footerProduct")}</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted">
            {product.map(([label, path]) => (
              <Link className="hover:text-primary" to={path} key={path}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">{t("footerResources")}</h3>
          <div className="mt-4 grid gap-2 text-sm text-muted">
            {resources.map(([label, path]) => (
              <Link className="hover:text-primary" to={path} key={path}>{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold">{t("footerContact")}</h3>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <Link className="hover:text-primary" to="/contact">{t("getInTouch")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
