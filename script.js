(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const header = document.querySelector('header');
    const menu = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const setMenu = open => {
        header.classList.toggle('nav-open', open);
        menu.classList.toggle('active', open);
        menu.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
    document.addEventListener('click', event => { if (!header.contains(event.target)) setMenu(false); });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
            setMenu(false); menu.focus();
        }
    });
    matchMedia('(min-width: 1201px)').addEventListener('change', () => setMenu(false));
    // Native fragment links preserve browser history and keyboard navigation.
    const topButton = document.createElement('button');
    topButton.type = 'button';
    topButton.textContent = '↑';
    topButton.className = 'go-top-btn';
    topButton.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(topButton);
    let queued = false;
    const updateTop = () => {
        const visible = scrollY > 500;
        topButton.classList.toggle('show', visible);
        topButton.tabIndex = visible ? 0 : -1;
        queued = false;
    };
    addEventListener('scroll', () => {
        if (!queued) { queued = true; requestAnimationFrame(updateTop); }
    }, { passive: true });
    updateTop();
    topButton.addEventListener('click', () => {
        scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' });
    });
    // Preserve the exact scene/runtime; start after paint, near the viewport.
    const viewer = document.querySelector('spline-viewer');
    let started = false;
    const loadViewer = () => {
        if (started) return;
        started = true;
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.9.93/build/spline-viewer.js';
        script.addEventListener('load', async () => {
            await customElements.whenDefined('spline-viewer');
            // Keep this presentation override scoped to our pinned viewer.
            // The scene, camera, materials and animation remain untouched.
            const root = viewer.shadowRoot;
            if (root && !root.querySelector('[data-portfolio-presentation]')) {
                const style = document.createElement('style');
                style.dataset.portfolioPresentation = '';
                style.textContent = '#logo { display: none !important; }';
                root.appendChild(style);
            }
        });
        script.addEventListener('error', () => viewer.setAttribute('data-load-error', ''));
        document.head.appendChild(script);
    };
    const schedule = () => requestAnimationFrame(() => requestAnimationFrame(() => {
        if ('requestIdleCallback' in window) requestIdleCallback(loadViewer, { timeout: 1200 });
        else setTimeout(loadViewer, 200);
    }));
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); schedule(); }
        }, { rootMargin: '200px' });
        observer.observe(viewer);
    } else schedule();
})();
