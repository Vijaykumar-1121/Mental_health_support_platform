// IMPROVED MOOD TRACKER IMPLEMENTATION
// This file contains refactored and optimized versions of the mood tracking functions

// --- CONSTANTS AND CONFIGURATION ---
const MOOD_CONFIG = {
    API_ENDPOINT: '/api/mood',
    HISTORY_ENDPOINT: '/api/mood/history',
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    NOTIFICATION_DURATION: 3000
};

const MOOD_MAPPINGS = {
    'Happy': { value: 5, emoji: '😊', color: '#10B981' },
    'Good': { value: 4, emoji: '🙂', color: '#059669' },
    'Okay': { value: 3, emoji: '😐', color: '#F59E0B' },
    'Worried': { value: 2, emoji: '😟', color: '#EF4444' },
    'Sad': { value: 1, emoji: '😢', color: '#DC2626' }
};

// --- UTILITY FUNCTIONS ---
class ApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'x-auth-token': token })
        };

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        const response = await fetch(`${this.baseUrl}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.msg || `HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
    }

    async retryRequest(endpoint, options = {}, attempts = MOOD_CONFIG.RETRY_ATTEMPTS) {
        for (let i = 0; i < attempts; i++) {
            try {
                return await this.request(endpoint, options);
            } catch (error) {
                if (i === attempts - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, MOOD_CONFIG.RETRY_DELAY * (i + 1)));
            }
        }
    }
}

class MoodCache {
    constructor() {
        this.cache = new Map();
    }

    set(key, data, ttl = MOOD_CONFIG.CACHE_DURATION) {
        const expiry = Date.now() + ttl;
        this.cache.set(key, { data, expiry });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    clear() {
        this.cache.clear();
    }
}

// --- IMPROVED MOOD TRACKER CLASS ---
class MoodTracker {
    constructor(apiUrl) {
        this.apiClient = new ApiClient(apiUrl);
        this.cache = new MoodCache();
        this.isLoading = false;
        this.chartInstance = null;
    }

    // Improved mood logging with better error handling and validation
    async logMood(mood, value) {
        // Input validation
        if (!this.validateMoodInput(mood, value)) {
            throw new Error('Invalid mood data provided');
        }

        // Prevent duplicate submissions
        if (this.isLoading) {
            throw new Error('Please wait for the previous mood entry to complete');
        }

        this.isLoading = true;
        this.showLoadingState(true);

        try {
            const moodData = {
                mood: mood.trim(),
                value: parseInt(value),
                timestamp: new Date().toISOString(),
                // Add client-side metadata for better tracking
                clientInfo: {
                    userAgent: navigator.userAgent,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                }
            };

            const result = await this.apiClient.retryRequest(
                MOOD_CONFIG.API_ENDPOINT,
                {
                    method: 'POST',
                    body: JSON.stringify(moodData)
                }
            );

            // Update UI optimistically
            this.updateMoodUI(mood, value);
            
            // Clear cache to force refresh
            this.cache.clear();
            
            // Refresh mood history
            await this.fetchMoodHistory();
            
            this.showSuccessNotification(`Mood logged successfully: ${mood} ${MOOD_MAPPINGS[mood]?.emoji || ''}`);
            
            return result;

        } catch (error) {
            this.handleMoodLogError(error, mood, value);
            throw error;
        } finally {
            this.isLoading = false;
            this.showLoadingState(false);
        }
    }

    // Enhanced mood history fetching with caching
    async fetchMoodHistory(forceRefresh = false) {
        const cacheKey = 'mood_history';
        
        if (!forceRefresh) {
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                this.createMoodChart(cachedData.labels, cachedData.dataPoints);
                return cachedData;
            }
        }

        try {
            const history = await this.apiClient.retryRequest(MOOD_CONFIG.HISTORY_ENDPOINT);
            const chartData = this.processHistoryData(history);
            
            // Cache the processed data
            this.cache.set(cacheKey, chartData);
            
            this.createMoodChart(chartData.labels, chartData.dataPoints);
            return chartData;

        } catch (error) {
            console.error('Failed to fetch mood history:', error);
            this.showErrorNotification('Unable to load mood history. Please try again later.');
            
            // Show empty chart on error
            this.createMoodChart([], []);
            throw error;
        }
    }

    // Improved data processing with better date handling
    processHistoryData(history) {
        const labels = [];
        const dataPoints = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Better date formatting
            const label = date.toLocaleDateString('en-US', { 
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            labels.push(label);

            // Find mood entry for this date
            const entry = history.find(h => {
                const entryDate = new Date(h.date);
                entryDate.setHours(0, 0, 0, 0);
                return entryDate.getTime() === date.getTime();
            });

            dataPoints.push(entry ? entry.value : null);
        }

        return { labels, dataPoints, rawHistory: history };
    }

    // Enhanced chart creation with better styling
    createMoodChart(labels, dataPoints) {
        const ctx = document.getElementById('moodChart');
        if (!ctx) return;

        // Destroy existing chart
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Level',
                    data: dataPoints,
                    borderColor: '#F97316', // Orange-500
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#F97316',
                    pointBorderColor: '#FFFFFF',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    spanGaps: true // Connect points even with null values
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: '#F97316',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                if (value === null) return 'No mood logged';
                                
                                const moodName = Object.keys(MOOD_MAPPINGS).find(
                                    key => MOOD_MAPPINGS[key].value === value
                                );
                                return `${moodName || 'Unknown'} (${value}/5)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        min: 1,
                        ticks: {
                            stepSize: 1,
                            callback: function(value) {
                                const moodName = Object.keys(MOOD_MAPPINGS).find(
                                    key => MOOD_MAPPINGS[key].value === value
                                );
                                return moodName ? `${moodName} (${value})` : value;
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        };

        this.chartInstance = new Chart(ctx, config);
    }

    // Input validation
    validateMoodInput(mood, value) {
        if (!mood || typeof mood !== 'string') {
            return false;
        }

        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 5) {
            return false;
        }

        if (!MOOD_MAPPINGS[mood]) {
            return false;
        }

        return true;
    }

    // UI state management
    showLoadingState(isLoading) {
        const moodButtons = document.querySelectorAll('#mood-tracker button');
        moodButtons.forEach(button => {
            button.disabled = isLoading;
            if (isLoading) {
                button.style.opacity = '0.6';
                button.style.cursor = 'not-allowed';
            } else {
                button.style.opacity = '1';
                button.style.cursor = 'pointer';
            }
        });
    }

    updateMoodUI(mood, value) {
        // Add visual feedback for the selected mood
        const moodButtons = document.querySelectorAll('#mood-tracker button');
        moodButtons.forEach(button => {
            button.classList.remove('selected-mood');
        });

        const selectedButton = document.querySelector(`#mood-tracker button[data-mood="${mood}"]`);
        if (selectedButton) {
            selectedButton.classList.add('selected-mood');
            setTimeout(() => {
                selectedButton.classList.remove('selected-mood');
            }, 2000);
        }
    }

    // Error handling
    handleMoodLogError(error, mood, value) {
        console.error('Mood logging failed:', error);
        
        let errorMessage = 'Failed to log mood. ';
        
        if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage += 'Please check your internet connection.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage += 'Please log in again.';
        } else if (error.message.includes('429')) {
            errorMessage += 'Too many requests. Please wait a moment.';
        } else {
            errorMessage += 'Please try again later.';
        }

        this.showErrorNotification(errorMessage);
    }

    // Notification helpers
    showSuccessNotification(message) {
        this.showNotification(message, 'success');
    }

    showErrorNotification(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'error') {
        // Assuming the existing notification system
        if (typeof showNotification === 'function') {
            showNotification(message, type, MOOD_CONFIG.NOTIFICATION_DURATION);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Cleanup method
    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = null;
        }
        this.cache.clear();
    }
}

// --- USAGE EXAMPLE ---
// Initialize the improved mood tracker
const moodTracker = new MoodTracker('http://localhost:5000');

// Replace the existing functions with improved versions
async function logMood(mood, value) {
    try {
        await moodTracker.logMood(mood, value);
    } catch (error) {
        // Error is already handled in the MoodTracker class
        console.error('Mood logging error:', error);
    }
}

async function fetchMoodHistory() {
    try {
        await moodTracker.fetchMoodHistory();
    } catch (error) {
        // Error is already handled in the MoodTracker class
        console.error('Mood history fetch error:', error);
    }
}

function createMoodChart(labels, dataPoints) {
    moodTracker.createMoodChart(labels, dataPoints);
}

// --- ADDITIONAL IMPROVEMENTS ---

// Add CSS for better mood button styling
const moodTrackerStyles = `
<style>
#mood-tracker button {
    transition: all 0.3s ease;
    position: relative;
}

#mood-tracker button:hover {
    transform: scale(1.2);
    filter: brightness(1.1);
}

#mood-tracker button:disabled {
    transform: none !important;
    filter: grayscale(1);
}

#mood-tracker button.selected-mood {
    animation: moodPulse 0.6s ease-in-out;
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
}

@keyframes moodPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
}

.mood-loading {
    position: relative;
}

.mood-loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #F97316;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = moodTrackerStyles.replace(/<\/?style>/g, '');
    document.head.appendChild(styleElement);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MoodTracker, MOOD_CONFIG, MOOD_MAPPINGS };
}
