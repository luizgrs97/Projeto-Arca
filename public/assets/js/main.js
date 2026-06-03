document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.password-toggle').forEach((button) => {
        const control = button.closest('.input-control-password');
        const passwordInput = control?.querySelector('input[type="password"], input[type="text"]');
        const icon = button.querySelector('.material-symbols-outlined');

        if (!passwordInput) {
            return;
        }

        const setToggleState = (isVisible) => {
            passwordInput.type = isVisible ? 'text' : 'password';
            button.setAttribute('aria-pressed', String(isVisible));
            button.setAttribute('aria-label', isVisible ? 'Ocultar senha' : 'Mostrar senha');
            button.title = isVisible ? 'Ocultar senha' : 'Mostrar senha';

            if (icon) {
                icon.textContent = isVisible ? 'visibility_off' : 'visibility';
            }

            button.childNodes.forEach((node) => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    node.textContent = isVisible ? ' Ocultar senha' : ' Mostrar senha';
                }
            });
        };

        setToggleState(passwordInput.type === 'text');

        button.addEventListener('click', () => {
            setToggleState(passwordInput.type === 'password');
            passwordInput.focus();
        });
    });
});
