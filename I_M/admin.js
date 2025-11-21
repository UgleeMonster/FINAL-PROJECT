document.addEventListener("DOMContentLoaded", function() {

    // === Clock & WiFi ===
    function updateDateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        const dateString = now.toLocaleDateString();
        const dtElem = document.getElementById('datetime');
        if(dtElem) dtElem.textContent = dateString + ' ' + timeString;
    }

    function updateWifiStatus() {
        const wifi = document.getElementById('wifi');
        if (!wifi) return;
        if (navigator.onLine) {
            wifi.innerHTML = '<i class="fas fa-wifi"></i>';
            wifi.style.color = '#4ade80';
        } else {
            wifi.innerHTML = '<i class="fas fa-wifi-slash"></i>';
            wifi.style.color = '#f87171';
        }
    }

    setInterval(updateDateTime, 1000);
    updateDateTime();
    updateWifiStatus();
    window.addEventListener('online', updateWifiStatus);
    window.addEventListener('offline', updateWifiStatus);

    // === Income Tooltip ===
    function formatCurrency(num) {
        return '₱' + Number(num).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
    }

    function attachTooltip(cardSelector, data, type) {
        const card = document.querySelector(cardSelector);
        if(!card) return;
        const tooltip = card.querySelector('.tooltip');
        if(!tooltip) return;

        card.addEventListener('mouseenter', () => {
            let html = '';
            if(type === 'year') {
                const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
                let i = 0;
                for(let key in data){
                    html += `<div>${months[i]}: ${formatCurrency(data[key])}</div>`;
                    i++;
                }
            } else if(type === 'month') {
                let tempSum = 0, dayStart = 1;
                let keys = Object.keys(data);
                keys.forEach((key, index) => {
                    tempSum += Number(data[key] || 0); // Fix NaN
                    let dayEnd = Math.min(dayStart + 6, keys.length);
                    if((index+1)%7===0 || index===keys.length-1){
                        html += `<div>Days ${dayStart}-${dayEnd}: ${formatCurrency(tempSum)}</div>`;
                        tempSum = 0;
                        dayStart = dayEnd + 1;
                    }
                });
            } else if(type === 'week') {
                for(let key in data){
                    let day = new Date(key).toLocaleDateString();
                    html += `<div>${day}: ${formatCurrency(data[key])}</div>`;
                }
            } else if(type === 'day') {
                for(let key in data){
                    if(!data[key]) continue;
                    // key format = "YYYY-MM-DD HH:MM:SS"
                    let dateTime = key.split(' ');
                    let date = dateTime[0] || '';
                    let time = dateTime[1] || '';
                    html += `<div><strong>${date}</strong> ${time}: ${formatCurrency(data[key])}</div>`;
                }
            }

            tooltip.innerHTML = html;
            tooltip.style.display = 'block';
            tooltip.style.opacity = '1';
        });

        card.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.offsetX + 'px';
            tooltip.style.top = -tooltip.offsetHeight - 10 + 'px';
        });

        card.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            tooltip.style.opacity = '0';
        });
    }

    attachTooltip('.income-card.today', window.incomeData.daily, 'day');
    attachTooltip('.income-card.week', window.incomeData.weekly, 'week');
    attachTooltip('.income-card.month', window.incomeData.monthly, 'month'); // Fixed
    attachTooltip('.income-card.year', window.incomeData.yearly, 'year');
});
