
export function showNotification(message, type = 'info', duration = 5000) {
    
    if (window._isShowingNotification) {
        console.log('Prevented recursive notification:', message);
        return;
    }

    try {
        window._isShowingNotification = true;

        let notificationContainer = document.getElementById('notification-container');

        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
        }

        const notification = document.createElement('div');
        notification.style.margin = '10px';
        notification.style.padding = '15px 20px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.display = 'flex';
        notification.style.alignItems = 'center';
        notification.style.justifyContent = 'space-between';
        notification.style.fontSize = '14px';
        notification.style.transition = 'transform 0.3s, opacity 0.3s';
        notification.style.animation = 'slideIn 0.3s forwards';

        if (type === 'success') {
            notification.style.backgroundColor = '#d4edda';
            notification.style.color = '#155724';
            notification.style.borderLeft = '5px solid #28a745';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#f8d7da';
            notification.style.color = '#721c24';
            notification.style.borderLeft = '5px solid #dc3545';
        } else {
            notification.style.backgroundColor = '#e7f5ff';
            notification.style.color = '#1864ab';
            notification.style.borderLeft = '5px solid #4dabf7';
        }

        const icon = getIconForType(type);
        notification.innerHTML = `
            <span>${icon} ${message}</span>
            <button style="background: none; border: none; margin-left: 15px; cursor: pointer; font-size: 16px; opacity: 0.7;">×</button>
        `;

        notification.querySelector('button').addEventListener('click', function() {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(30px)';

            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        });

        setTimeout(() => {
            if (notification.parentNode === notificationContainer) {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(30px)';

                setTimeout(() => {
                    if (notification.parentNode === notificationContainer) {
                        notificationContainer.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);

        if (!document.querySelector('style#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.innerHTML = `
                @keyframes slideIn {
                    from { transform: translateX(30px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        notificationContainer.appendChild(notification);
    } finally {
        
        window._isShowingNotification = false;
    }
}

function showToast(message, type = 'success') {
    
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }

    console.log(`Toast notification: ${message} (${type})`);

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background-color: ${type === 'success' ? '#4caf50' : '#f44336'};
        color: white;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            toast.remove();
        }, 500);
    }, 3000);
}

export function showSuccessMessage(message) {
    showNotification(message, 'success');
}

export function showErrorMessage(message) {
    showNotification(message, 'error');
}

export function getIconForType(type) {
    switch (type) {
        case 'success': return '✓';
        case 'error': return '✗';
        case 'info': return 'ℹ';
        default: return '';
    }
}

export function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div class="loading-overlay"></div>
        <div class="loading-content">
            <div class="spinner"></div>
            <div class="loading-text">Loading...</div>
        </div>
    `;
    document.body.appendChild(loadingIndicator);
    return loadingIndicator;
}

export function hideLoadingIndicator(loadingIndicator) {
    if (loadingIndicator && loadingIndicator.parentNode) {
        loadingIndicator.parentNode.removeChild(loadingIndicator);
    }
}
