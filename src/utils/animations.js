// Framer Motion variants aligned with B7 Motion System:
// Base curve: cubic-bezier(0.22, 1, 0.36, 1), Spacing-400 (32px) rise, 650ms reveal, once: true

export const BASE_EASE = [0.22, 1, 0.36, 1];

export const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: BASE_EASE, delay: Math.min(i * 0.08, 0.32) },
    }),
};

export const fadeIn = {
    hidden: { opacity: 0 },
    visible: (i = 0) => ({
        opacity: 1,
        transition: { duration: 0.5, ease: BASE_EASE, delay: Math.min(i * 0.08, 0.32) },
    }),
};

export const scaleIn = {
    hidden: { opacity: 0, y: 24 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: BASE_EASE, delay: Math.min(i * 0.08, 0.32) },
    }),
};

export const slideLeft = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: BASE_EASE },
    },
};

export const slideRight = {
    hidden: { opacity: 0, y: 32 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: BASE_EASE },
    },
};

export const staggerContainer = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

export const viewportOnce = { once: true, amount: 0.18 };
