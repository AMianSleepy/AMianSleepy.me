const THEME_STORAGE_KEY = "theme";
function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
    catch {
        // ignore
    }
}
function getStoredTheme() {
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY);
        return raw === "light" || raw === "dark" ? raw : null;
    }
    catch {
        return null;
    }
}
function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
export function initThemeToggle() {
    const btn = document.querySelector("[data-theme-toggle]");
    if (!(btn instanceof HTMLButtonElement))
        return;
    const initial = getStoredTheme() ?? getSystemTheme();
    setTheme(initial);
    btn.setAttribute("aria-pressed", initial === "light" ? "true" : "false");
    btn.addEventListener("click", () => {
        const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
        const next = current === "light" ? "dark" : "light";
        setTheme(next);
        btn.setAttribute("aria-pressed", next === "light" ? "true" : "false");
    });
}
export function initNavToggle() {
    const header = document.querySelector(".site-header");
    const btn = document.querySelector("[data-nav-toggle]");
    const nav = document.getElementById("primary-nav");
    if (!(header instanceof HTMLElement))
        return;
    if (!(btn instanceof HTMLButtonElement))
        return;
    if (!(nav instanceof HTMLElement))
        return;
    const close = () => {
        header.dataset.navOpen = "false";
        btn.setAttribute("aria-expanded", "false");
    };
    const open = () => {
        header.dataset.navOpen = "true";
        btn.setAttribute("aria-expanded", "true");
    };
    header.dataset.navOpen = "false";
    btn.addEventListener("click", () => {
        const isOpen = header.dataset.navOpen === "true";
        if (isOpen)
            close();
        else
            open();
    });
    nav.addEventListener("click", (ev) => {
        const target = ev.target;
        if (target instanceof HTMLAnchorElement && target.getAttribute("href")?.startsWith("#"))
            close();
    });
    document.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape")
            close();
    });
    document.addEventListener("click", (ev) => {
        const target = ev.target;
        if (!(target instanceof Node))
            return;
        if (!header.contains(target))
            close();
    });
}
export function initYear() {
    const el = document.querySelector("[data-year]");
    if (el)
        el.textContent = String(new Date().getFullYear());
}
async function tryPostContact(payload) {
    const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
    }
}
function buildMailto(payload) {
    const subject = encodeURIComponent(`来自个人主页的联系：${payload.name}`);
    const body = encodeURIComponent(`称呼：${payload.name}\n邮箱：${payload.email}\n\n${payload.message}`);
    return `mailto:hello@amiansleepy.me?subject=${subject}&body=${body}`;
}
export function initContactForm() {
    const form = document.querySelector("[data-contact-form]");
    const hint = document.querySelector("[data-form-hint]");
    if (!(form instanceof HTMLFormElement))
        return;
    if (!(hint instanceof HTMLElement))
        return;
    form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const fd = new FormData(form);
        const payload = {
            name: String(fd.get("name") ?? "").trim(),
            email: String(fd.get("email") ?? "").trim(),
            message: String(fd.get("message") ?? "").trim()
        };
        if (!payload.name || !payload.email || !payload.message) {
            hint.textContent = "请完整填写后再发送。";
            return;
        }
        hint.textContent = "正在发送…";
        try {
            await tryPostContact(payload);
            hint.textContent = "已提交成功（后端已接收）。";
            form.reset();
        }
        catch {
            hint.textContent = "未检测到后端服务，已为你打开邮件客户端继续发送。";
            window.location.href = buildMailto(payload);
        }
    });
}
export function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    });
    document.querySelectorAll(".reveal").forEach((el) => {
        observer.observe(el);
    });
}
initThemeToggle();
initNavToggle();
initYear();
initContactForm();
initScrollReveal();
//# sourceMappingURL=main.js.map