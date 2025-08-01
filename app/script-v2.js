// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

class SundayServiceCounter {
    constructor() {
        this.koreanCount = 0;
        this.foreignerCount = 0;
        this.koreanHistory = [];
        this.foreignerHistory = [];
        this.totalKoreanClicks = 0;
        this.totalForeignerClicks = 0;
        this.koreanClicksToday = 0;
        this.foreignerClicksToday = 0;
        this.lastClickDate = null;
        this.attendanceHistory = [];
        
        this.initializeElements();
        this.loadFromLocalStorage();
        this.updateDisplay();
        this.setupEventListeners();
        this.updateCurrentDate();
    }
    
    initializeElements() {
        // Korean elements
        this.koreanCounterElement = document.getElementById('menCounter');
        this.koreanClickerBtn = document.getElementById('menClickerBtn');
        this.koreanResetBtn = document.getElementById('menResetBtn');
        this.koreanUndoBtn = document.getElementById('menUndoBtn');
        
        // Foreigner elements
        this.foreignerCounterElement = document.getElementById('womenCounter');
        this.foreignerClickerBtn = document.getElementById('womenClickerBtn');
        this.foreignerResetBtn = document.getElementById('womenResetBtn');
        this.foreignerUndoBtn = document.getElementById('womenUndoBtn');
        
        // Combined stats elements
        this.totalKoreanElement = document.getElementById('totalMen');
        this.totalForeignerElement = document.getElementById('totalWomen');
        this.combinedTotalElement = document.getElementById('combinedTotal');
        this.todayTotalElement = document.getElementById('todayTotal');
        
        // Global controls
        this.globalResetBtn = document.getElementById('globalResetBtn');
        
        // Export controls
        this.exportBtn = document.getElementById('exportBtn');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.viewBtn = document.getElementById('viewBtn');
        this.shareBtn = document.getElementById('shareBtn');
        
        // Date display
        this.currentDateElement = document.getElementById('currentDate');
    }
    
    updateCurrentDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const dateString = now.toLocaleDateString('en-US', options);
        if (this.currentDateElement) {
            this.currentDateElement.textContent = dateString;
        }
    }
    
    setupEventListeners() {
        // Korean counter events
        this.koreanClickerBtn.addEventListener('click', () => this.incrementKorean());
        this.koreanResetBtn.addEventListener('click', () => this.resetKorean());
        this.koreanUndoBtn.addEventListener('click', () => this.undoKorean());
        
        // Foreigner counter events
        this.foreignerClickerBtn.addEventListener('click', () => this.incrementForeigner());
        this.foreignerResetBtn.addEventListener('click', () => this.resetForeigner());
        this.foreignerUndoBtn.addEventListener('click', () => this.undoForeigner());
        
        // Global reset
        this.globalResetBtn.addEventListener('click', () => this.resetSunday());
        
        // Export events
        this.exportBtn.addEventListener('click', () => this.exportStats());
        this.downloadBtn.addEventListener('click', () => this.downloadData());
        this.viewBtn.addEventListener('click', () => this.viewHistory());
        this.shareBtn.addEventListener('click', () => this.shareStats());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyK' || e.code === 'Digit1') {
                e.preventDefault();
                this.incrementKorean();
            } else if (e.code === 'KeyF' || e.code === 'Digit2') {
                e.preventDefault();
                this.incrementForeigner();
            }
        });
        
        // Touch events for mobile
        this.setupTouchEvents();
    }
    
    setupTouchEvents() {
        // Add touch feedback for mobile
        const buttons = document.querySelectorAll('.clicker-button, .control-btn');
        buttons.forEach(button => {
            button.addEventListener('touchstart', () => {
                button.style.transform = 'scale(0.95)';
            });
            
            button.addEventListener('touchend', () => {
                button.style.transform = '';
            });
        });
    }
    
    incrementKorean() {
        this.koreanHistory.push(this.koreanCount);
        if (this.koreanHistory.length > 50) {
            this.koreanHistory.shift();
        }
        
        this.koreanCount++;
        this.totalKoreanClicks++;
        this.updateTodayStats('korean');
        this.recordAttendance('Korean');
        
        this.updateDisplay();
        this.saveToLocalStorage();
        this.animateCounter(this.koreanCounterElement);
        this.addHapticFeedback();
    }
    
    incrementForeigner() {
        this.foreignerHistory.push(this.foreignerCount);
        if (this.foreignerHistory.length > 50) {
            this.foreignerHistory.shift();
        }
        
        this.foreignerCount++;
        this.totalForeignerClicks++;
        this.updateTodayStats('foreigner');
        this.recordAttendance('Foreigner');
        
        this.updateDisplay();
        this.saveToLocalStorage();
        this.animateCounter(this.foreignerCounterElement);
        this.addHapticFeedback();
    }
    
    recordAttendance(type) {
        const now = new Date();
        const record = {
            type: type,
            timestamp: now.toISOString(),
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            koreanCount: this.koreanCount,
            foreignerCount: this.foreignerCount,
            total: this.koreanCount + this.foreignerCount
        };
        this.attendanceHistory.push(record);
        
        // Keep only last 1000 records
        if (this.attendanceHistory.length > 1000) {
            this.attendanceHistory = this.attendanceHistory.slice(-1000);
        }
    }
    
    resetKorean() {
        if (confirm('Are you sure you want to reset the Korean counter to 0?')) {
            this.koreanCount = 0;
            this.koreanHistory = [];
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }
    
    resetForeigner() {
        if (confirm('Are you sure you want to reset the Foreigner counter to 0?')) {
            this.foreignerCount = 0;
            this.foreignerHistory = [];
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }
    
    resetSunday() {
        if (confirm('Are you sure you want to reset this Sunday\'s counters to 0?')) {
            this.koreanCount = 0;
            this.foreignerCount = 0;
            this.koreanHistory = [];
            this.foreignerHistory = [];
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }
    
    undoKorean() {
        if (this.koreanHistory.length > 0) {
            this.koreanCount = this.koreanHistory.pop();
            this.totalKoreanClicks = Math.max(0, this.totalKoreanClicks - 1);
            this.koreanClicksToday = Math.max(0, this.koreanClicksToday - 1);
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }
    
    undoForeigner() {
        if (this.foreignerHistory.length > 0) {
            this.foreignerCount = this.foreignerHistory.pop();
            this.totalForeignerClicks = Math.max(0, this.totalForeignerClicks - 1);
            this.foreignerClicksToday = Math.max(0, this.foreignerClicksToday - 1);
            this.updateDisplay();
            this.saveToLocalStorage();
        }
    }
    
    updateTodayStats(type) {
        const today = new Date().toDateString();
        if (this.lastClickDate !== today) {
            this.koreanClicksToday = 0;
            this.foreignerClicksToday = 0;
            this.lastClickDate = today;
        }
        
        if (type === 'korean') {
            this.koreanClicksToday++;
        } else {
            this.foreignerClicksToday++;
        }
    }
    
    updateDisplay() {
        // Update individual counters
        this.koreanCounterElement.textContent = this.koreanCount.toString().padStart(6, '0');
        this.foreignerCounterElement.textContent = this.foreignerCount.toString().padStart(6, '0');
        
        // Update combined stats
        this.totalKoreanElement.textContent = this.totalKoreanClicks;
        this.totalForeignerElement.textContent = this.totalForeignerClicks;
        this.combinedTotalElement.textContent = this.totalKoreanClicks + this.totalForeignerClicks;
        this.todayTotalElement.textContent = this.koreanClicksToday + this.foreignerClicksToday;
        
        // Enable/disable undo buttons
        this.koreanUndoBtn.disabled = this.koreanHistory.length === 0;
        this.koreanUndoBtn.style.opacity = this.koreanHistory.length === 0 ? '0.5' : '1';
        
        this.foreignerUndoBtn.disabled = this.foreignerHistory.length === 0;
        this.foreignerUndoBtn.style.opacity = this.foreignerHistory.length === 0 ? '0.5' : '1';
    }
    
    animateCounter(element) {
        element.classList.add('counter-pulse');
        setTimeout(() => {
            element.classList.remove('counter-pulse');
        }, 300);
    }
    
    addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    exportStats() {
        const now = new Date();
        const stats = {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            koreanCount: this.koreanCount,
            foreignerCount: this.foreignerCount,
            totalCount: this.koreanCount + this.foreignerCount,
            totalKoreanClicks: this.totalKoreanClicks,
            totalForeignerClicks: this.totalForeignerClicks,
            koreanClicksToday: this.koreanClicksToday,
            foreignerClicksToday: this.foreignerClicksToday
        };
        
        const statsText = `Antioch International Ministry - Sunday Service Statistics
Date: ${stats.date}
Time: ${stats.time}

Current Counts:
- Korean: ${stats.koreanCount}
- Foreigner: ${stats.foreignerCount}
- Total: ${stats.totalCount}

Today's Statistics:
- Korean Today: ${stats.koreanClicksToday}
- Foreigner Today: ${stats.foreignerClicksToday}
- Total Today: ${stats.koreanClicksToday + stats.foreignerClicksToday}

All Time Totals:
- Total Korean: ${stats.totalKoreanClicks}
- Total Foreigner: ${stats.totalForeignerClicks}
- Grand Total: ${stats.totalKoreanClicks + stats.totalForeignerClicks}`;
        
        this.downloadFile(statsText, `antioch-stats-${now.toISOString().split('T')[0]}.txt`);
    }
    
    downloadData() {
        const data = {
            currentStats: {
                koreanCount: this.koreanCount,
                foreignerCount: this.foreignerCount,
                totalCount: this.koreanCount + this.foreignerCount
            },
            totals: {
                totalKoreanClicks: this.totalKoreanClicks,
                totalForeignerClicks: this.totalForeignerClicks,
                grandTotal: this.totalKoreanClicks + this.totalForeignerClicks
            },
            today: {
                koreanClicksToday: this.koreanClicksToday,
                foreignerClicksToday: this.foreignerClicksToday,
                totalToday: this.koreanClicksToday + this.foreignerClicksToday
            },
            attendanceHistory: this.attendanceHistory,
            exportDate: new Date().toISOString()
        };
        
        const jsonData = JSON.stringify(data, null, 2);
        const now = new Date();
        this.downloadFile(jsonData, `antioch-data-${now.toISOString().split('T')[0]}.json`);
    }
    
    shareStats() {
        const now = new Date();
        const stats = {
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString(),
            koreanCount: this.koreanCount,
            foreignerCount: this.foreignerCount,
            totalCount: this.koreanCount + this.foreignerCount,
            totalKoreanClicks: this.totalKoreanClicks,
            totalForeignerClicks: this.totalForeignerClicks,
            koreanClicksToday: this.koreanClicksToday,
            foreignerClicksToday: this.foreignerClicksToday
        };
        
        // Create shareable text
        const shareText = `Antioch International Ministry - Sunday Service Statistics

📅 Date: ${stats.date}
⏰ Time: ${stats.time}

📊 Current Counts:
• Korean: ${stats.koreanCount}
• Foreigner: ${stats.foreignerCount}
• Total: ${stats.totalCount}

📈 Today's Statistics:
• Korean Today: ${stats.koreanClicksToday}
• Foreigner Today: ${stats.foreignerClicksToday}
• Total Today: ${stats.koreanClicksToday + stats.foreignerClicksToday}

🏆 All Time Totals:
• Total Korean: ${stats.totalKoreanClicks}
• Total Foreigner: ${stats.totalForeignerClicks}
• Grand Total: ${stats.totalKoreanClicks + stats.totalForeignerClicks}`;
        
        // Try to use native sharing API first
        if (navigator.share) {
            navigator.share({
                title: 'Antioch International Ministry - Sunday Service Statistics',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }
    
    fallbackShare(shareText) {
        // Create a modal with sharing options
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            padding: 2rem;
            border-radius: 15px;
            max-width: 500px;
            width: 90%;
            text-align: center;
        `;
        
        modalContent.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: #2d3748;">Share Statistics</h3>
            <div style="margin-bottom: 1.5rem;">
                <button id="copyBtn" style="background: #3182ce; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; margin: 0.5rem; cursor: pointer;">
                    📋 Copy to Clipboard
                </button>
                <button id="emailBtn" style="background: #38a169; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; margin: 0.5rem; cursor: pointer;">
                    📧 Send via Email
                </button>
                <button id="whatsappBtn" style="background: #25d366; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; margin: 0.5rem; cursor: pointer;">
                    💬 Share via WhatsApp
                </button>
            </div>
            <button id="closeBtn" style="background: #e53e3e; color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">
                Close
            </button>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('copyBtn').addEventListener('click', () => {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('Statistics copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        });
        
        document.getElementById('emailBtn').addEventListener('click', () => {
            const subject = encodeURIComponent('Antioch International Ministry - Sunday Service Statistics');
            const body = encodeURIComponent(shareText);
            window.open(`mailto:?subject=${subject}&body=${body}`);
        });
        
        document.getElementById('whatsappBtn').addEventListener('click', () => {
            const text = encodeURIComponent(shareText);
            window.open(`https://wa.me/?text=${text}`);
        });
        
        document.getElementById('closeBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
    
    viewHistory() {
        if (this.attendanceHistory.length === 0) {
            alert('No attendance history available yet.');
            return;
        }
        
        const recentHistory = this.attendanceHistory.slice(-20); // Last 20 records
        let historyText = 'Recent Attendance History:\n\n';
        
        recentHistory.forEach((record, index) => {
            historyText += `${index + 1}. ${record.type} - ${record.date} ${record.time}\n`;
            historyText += `   Korean: ${record.koreanCount}, Foreigner: ${record.foreignerCount}, Total: ${record.total}\n\n`;
        });
        
        // Create a modal or use alert for now
        const historyWindow = window.open('', '_blank', 'width=600,height=400');
        historyWindow.document.write(`
            <html>
                <head>
                    <title>Attendance History</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
                    </style>
                </head>
                <body>
                    <h2>Antioch International Ministry - Attendance History</h2>
                    <pre>${historyText}</pre>
                </body>
            </html>
        `);
    }
    
    downloadFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    saveToLocalStorage() {
        const data = {
            koreanCount: this.koreanCount,
            foreignerCount: this.foreignerCount,
            koreanHistory: this.koreanHistory,
            foreignerHistory: this.foreignerHistory,
            totalKoreanClicks: this.totalKoreanClicks,
            totalForeignerClicks: this.totalForeignerClicks,
            koreanClicksToday: this.koreanClicksToday,
            foreignerClicksToday: this.foreignerClicksToday,
            lastClickDate: this.lastClickDate,
            attendanceHistory: this.attendanceHistory
        };
        localStorage.setItem('antiochSundayService', JSON.stringify(data));
    }
    
    loadFromLocalStorage() {
        const saved = localStorage.getItem('antiochSundayService');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.koreanCount = data.koreanCount || 0;
                this.foreignerCount = data.foreignerCount || 0;
                this.koreanHistory = data.koreanHistory || [];
                this.foreignerHistory = data.foreignerHistory || [];
                this.totalKoreanClicks = data.totalKoreanClicks || 0;
                this.totalForeignerClicks = data.totalForeignerClicks || 0;
                this.koreanClicksToday = data.koreanClicksToday || 0;
                this.foreignerClicksToday = data.foreignerClicksToday || 0;
                this.lastClickDate = data.lastClickDate;
                this.attendanceHistory = data.attendanceHistory || [];
                
                // Reset today's clicks if it's a new day
                const today = new Date().toDateString();
                if (this.lastClickDate !== today) {
                    this.koreanClicksToday = 0;
                    this.foreignerClicksToday = 0;
                    this.lastClickDate = today;
                }
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
}

// Initialize the counter when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SundayServiceCounter();
    
    // Add backup event listener for statistics button
    const statsBtn = document.getElementById('statsBtn');
    if (statsBtn) {
        statsBtn.addEventListener('click', () => {
            console.log('Stats button clicked via event listener');
            openStatistics();
        });
    }
});

// Navigation function
function openStatistics() {
    console.log('openStatistics function called');
    window.location.href = 'statistics.html';
} 