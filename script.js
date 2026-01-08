class AgeCalculator {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('ageHistory')) || [];
        this.zodiacSigns = [
            { name: "Aries", start: [3, 21], end: [4, 19], emoji: "♈" },
            { name: "Taurus", start: [4, 20], end: [5, 20], emoji: "♉" },
            { name: "Gemini", start: [5, 21], end: [6, 20], emoji: "♊" },
            { name: "Cancer", start: [6, 21], end: [7, 22], emoji: "♋" },
            { name: "Leo", start: [7, 23], end: [8, 22], emoji: "♌" },
            { name: "Virgo", start: [8, 23], end: [9, 22], emoji: "♍" },
            { name: "Libra", start: [9, 23], end: [10, 22], emoji: "♎" },
            { name: "Scorpio", start: [10, 23], end: [11, 21], emoji: "♏" },
            { name: "Sagittarius", start: [11, 22], end: [12, 21], emoji: "♐" },
            { name: "Capricorn", start: [12, 22], end: [1, 19], emoji: "♑" },
            { name: "Aquarius", start: [1, 20], end: [2, 18], emoji: "♒" },
            { name: "Pisces", start: [2, 19], end: [3, 20], emoji: "♓" }
        ];
        
        this.chineseZodiacs = [
            "Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", 
            "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"
        ];
        
        this.chineseElements = ["Wood", "Fire", "Earth", "Metal", "Water"];
        
        this.init();
    }

    init() {
        this.setMaxDates();
        this.loadHistory();
        this.setupEventListeners();
    }

    setMaxDates() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('birthDate').setAttribute('max', today);
        document.getElementById('compareDate').setAttribute('max', today);
    }

    setupEventListeners() {
        document.getElementById('birthDate').addEventListener('change', () => {
            if (document.getElementById('birthDate').value) {
                this.calculateAge();
            }
        });

        document.getElementById('compareDate').addEventListener('change', () => {
            if (document.getElementById('birthDate').value) {
                this.calculateAge();
            }
        });

        const inputs = document.querySelectorAll('input[type="date"]');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.calculateAge();
                }
            });
        });
    }

    calculateAge() {
        const birthDateInput = document.getElementById('birthDate').value;
        const compareDateInput = document.getElementById('compareDate').value;

        if (!birthDateInput) {
            alert('Please enter your birth date.');
            return;
        }

        // Parse dates correctly
        const birthDate = new Date(birthDateInput + 'T00:00:00');
        let compareDate;
        
        if (compareDateInput) {
            compareDate = new Date(compareDateInput + 'T00:00:00');
        } else {
            // Use current date without time component
            const now = new Date();
            compareDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }

        // Validate dates
        if (isNaN(birthDate.getTime())) {
            alert('Invalid birth date. Please check the format.');
            return;
        }

        if (isNaN(compareDate.getTime())) {
            alert('Invalid comparison date. Please check the format.');
            return;
        }

        if (birthDate > compareDate) {
            alert('Birth date cannot be in the future compared to the selected date!');
            return;
        }

        const ageDetails = this.calculateExactAge(birthDate, compareDate);
        this.displayResults(ageDetails, birthDate, compareDate);
        this.updateTimeline(ageDetails.years);
        this.saveToHistory(ageDetails, birthDate, compareDate);
    }

    calculateExactAge(birthDate, compareDate) {
        // Clone dates to avoid modifying originals
        const bd = new Date(birthDate);
        const cd = new Date(compareDate);
        
        let years = cd.getFullYear() - bd.getFullYear();
        let months = cd.getMonth() - bd.getMonth();
        let days = cd.getDate() - bd.getDate();

        // If the day of month hasn't been reached yet this month, subtract one month
        if (days < 0) {
            months--;
            // Get the last day of the previous month
            const lastDayOfMonth = new Date(cd.getFullYear(), cd.getMonth(), 0).getDate();
            days += lastDayOfMonth;
        }

        // If months are negative, subtract one year and add 12 months
        if (months < 0) {
            years--;
            months += 12;
        }

        // Calculate total time differences
        const timeDiff = cd.getTime() - bd.getTime();
        const totalDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const totalWeeks = Math.floor(totalDays / 7);
        const totalMonths = years * 12 + months;
        
        // Calculate total hours, minutes, seconds for fun facts
        const totalHours = Math.floor(timeDiff / (1000 * 60 * 60));
        const totalMinutes = Math.floor(timeDiff / (1000 * 60));
        const totalSeconds = Math.floor(timeDiff / 1000);

        return {
            years,
            months,
            days,
            totalDays,
            totalWeeks,
            totalMonths,
            totalHours,
            totalMinutes,
            totalSeconds
        };
    }

    displayResults(ageDetails, birthDate, compareDate) {
        const ageValue = document.getElementById('ageValue');
        const ageUnit = document.getElementById('ageUnit');

        // Update main age display
        ageValue.textContent = ageDetails.years;
        ageUnit.textContent = `Years ${ageDetails.months} Months ${ageDetails.days} Days`;

        // Update breakdown
        document.getElementById('yearsValue').textContent = ageDetails.years;
        document.getElementById('monthsValue').textContent = ageDetails.totalMonths;
        document.getElementById('daysValue').textContent = ageDetails.totalDays.toLocaleString();
        document.getElementById('weeksValue').textContent = ageDetails.totalWeeks.toLocaleString();

        // Calculate additional information
        this.calculateNextBirthday(birthDate, compareDate);
        this.calculateZodiac(birthDate);
        this.calculateChineseZodiac(birthDate);
        this.calculateBirthDay(birthDate);

        // Show results sections
        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('timelineSection').style.display = 'block';
    }

    calculateNextBirthday(birthDate, compareDate) {
        const currentYear = compareDate.getFullYear();
        let nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
        
        // If birthday already passed this year, use next year
        if (nextBirthday < compareDate) {
            nextBirthday.setFullYear(currentYear + 1);
        }

        const daysUntilBirthday = Math.ceil((nextBirthday - compareDate) / (1000 * 60 * 60 * 24));
        
        document.getElementById('nextBirthday').textContent = nextBirthday.toLocaleDateString();
        
        if (daysUntilBirthday === 0) {
            document.getElementById('birthdayCountdown').textContent = "🎉 Happy Birthday! 🎉";
        } else if (daysUntilBirthday === 1) {
            document.getElementById('birthdayCountdown').textContent = "Tomorrow! Get ready to celebrate!";
        } else {
            document.getElementById('birthdayCountdown').textContent = `${daysUntilBirthday} days to go!`;
        }
    }

    calculateZodiac(birthDate) {
        const month = birthDate.getMonth() + 1;
        const day = birthDate.getDate();

        for (const sign of this.zodiacSigns) {
            const [startMonth, startDay] = sign.start;
            const [endMonth, endDay] = sign.end;

            // Handle Capricorn (crosses year boundary)
            if (startMonth > endMonth) {
                if ((month === startMonth && day >= startDay) || 
                    (month === endMonth && day <= endDay) ||
                    (month > startMonth || month < endMonth)) {
                    this.displayZodiacInfo(sign);
                    return;
                }
            } else {
                // Normal signs
                if ((month === startMonth && day >= startDay) || 
                    (month === endMonth && day <= endDay) ||
                    (month > startMonth && month < endMonth)) {
                    this.displayZodiacInfo(sign);
                    return;
                }
            }
        }
    }

    displayZodiacInfo(sign) {
        const zodiacElement = document.getElementById('zodiacSign');
        zodiacElement.textContent = `${sign.emoji} ${sign.name}`;
        zodiacElement.className = `zodiac-${sign.name.toLowerCase()}`;
        
        const startDate = new Date(2000, sign.start[0]-1, sign.start[1]);
        const endDate = new Date(2000, sign.end[0]-1, sign.end[1]);
        
        document.getElementById('zodiacDates').textContent = 
            `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    calculateChineseZodiac(birthDate) {
        const year = birthDate.getFullYear();
        const zodiacIndex = (year - 4) % 12;
        const elementIndex = Math.floor((year - 4) % 10 / 2);
        
        document.getElementById('chineseZodiac').textContent = 
            `${this.getChineseZodiacEmoji(this.chineseZodiacs[zodiacIndex])} ${this.chineseZodiacs[zodiacIndex]}`;
        document.getElementById('zodiacElement').textContent = 
            `${this.chineseElements[elementIndex]} Element • Born in ${year}`;
    }

    getChineseZodiacEmoji(zodiac) {
        const emojiMap = {
            'Rat': '🐀', 'Ox': '🐂', 'Tiger': '🐅', 'Rabbit': '🐇',
            'Dragon': '🐉', 'Snake': '🐍', 'Horse': '🐎', 'Goat': '🐐',
            'Monkey': '🐒', 'Rooster': '🐓', 'Dog': '🐕', 'Pig': '🐖'
        };
        return emojiMap[zodiac] || '🐰';
    }

    calculateBirthDay(birthDate) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[birthDate.getDay()];
        
        // Calculate day of year
        const startOfYear = new Date(birthDate.getFullYear(), 0, 0);
        const diff = birthDate - startOfYear;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        document.getElementById('birthDay').textContent = dayOfWeek;
        document.getElementById('dayOfYear').textContent = `${dayOfYear}${this.getNumberSuffix(dayOfYear)} day of ${birthDate.getFullYear()}`;
    }

    updateTimeline(age) {
        const timelineFill = document.getElementById('timelineFill');
        const milestones = document.querySelectorAll('.milestone');
        
        // Calculate fill percentage (assuming 100 years as max)
        const fillPercentage = Math.min((age / 100) * 100, 100);
        timelineFill.style.width = `${fillPercentage}%`;
        
        // Update milestone states
        milestones.forEach(milestone => {
            const milestoneAge = parseInt(milestone.getAttribute('data-age'));
            if (age >= milestoneAge) {
                milestone.classList.add('past');
            } else {
                milestone.classList.remove('past');
            }
        });
    }

    saveToHistory(ageDetails, birthDate, compareDate) {
        const timestamp = new Date().toLocaleString();
        const isCurrentDate = !document.getElementById('compareDate').value;

        const historyItem = {
            age: ageDetails.years,
            birthDate: birthDate.toLocaleDateString(),
            compareDate: isCurrentDate ? 'Today' : compareDate.toLocaleDateString(),
            details: ageDetails,
            timestamp: timestamp
        };

        this.history.unshift(historyItem);
        
        // Keep only last 10 entries
        if (this.history.length > 10) {
            this.history = this.history.slice(0, 10);
        }

        this.saveToLocalStorage();
        this.loadHistory();
    }

    loadHistory() {
        const historyContainer = document.getElementById('ageHistory');
        
        if (this.history.length === 0) {
            historyContainer.innerHTML = '<div class="no-history">No calculations yet</div>';
            return;
        }

        historyContainer.innerHTML = this.history.map((item, index) => `
            <div class="history-item">
                <div class="history-details">
                    <div class="history-age">${item.age} years old</div>
                    <div class="history-info">Born: ${item.birthDate} • Compared to: ${item.compareDate}</div>
                </div>
                <div class="history-actions">
                    <button class="history-btn copy" onclick="copyHistoryItem(${index})" title="Copy Details">📋</button>
                    <button class="history-btn delete" onclick="deleteHistoryItem(${index})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');
    }

    saveToLocalStorage() {
        localStorage.setItem('ageHistory', JSON.stringify(this.history));
    }

    // Utility functions
    getNumberSuffix(number) {
        if (number > 3 && number < 21) return 'th';
        switch (number % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    resetForm() {
        document.getElementById('birthDate').value = '';
        document.getElementById('compareDate').value = '';
        
        document.getElementById('ageValue').textContent = '--';
        document.getElementById('ageUnit').textContent = 'Enter your birth date';
        
        document.getElementById('yearsValue').textContent = '--';
        document.getElementById('monthsValue').textContent = '--';
        document.getElementById('daysValue').textContent = '--';
        document.getElementById('weeksValue').textContent = '--';
        
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('timelineSection').style.display = 'none';
        document.getElementById('timelineFill').style.width = '0%';
        
        // Reset milestone states
        document.querySelectorAll('.milestone').forEach(milestone => {
            milestone.classList.remove('past');
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            this.history = [];
            this.saveToLocalStorage();
            this.loadHistory();
        }
    }

    // Quick action functions
    setToday() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        document.getElementById('compareDate').value = todayString;
        if (document.getElementById('birthDate').value) {
            this.calculateAge();
        }
    }

    setYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];
        document.getElementById('compareDate').value = yesterdayString;
        if (document.getElementById('birthDate').value) {
            this.calculateAge();
        }
    }

    setTomorrow() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        document.getElementById('compareDate').value = tomorrowString;
        if (document.getElementById('birthDate').value) {
            this.calculateAge();
        }
    }

    clearCompareDate() {
        document.getElementById('compareDate').value = '';
        if (document.getElementById('birthDate').value) {
            this.calculateAge();
        }
    }
}

// Global functions
let ageCalculator;

function calculateAge() {
    if (ageCalculator) {
        ageCalculator.calculateAge();
    }
}

function resetForm() {
    if (ageCalculator) {
        ageCalculator.resetForm();
    }
}

function setToday() {
    if (ageCalculator) {
        ageCalculator.setToday();
    }
}

function setYesterday() {
    if (ageCalculator) {
        ageCalculator.setYesterday();
    }
}

function setTomorrow() {
    if (ageCalculator) {
        ageCalculator.setTomorrow();
    }
}

function clearCompareDate() {
    if (ageCalculator) {
        ageCalculator.clearCompareDate();
    }
}

function copyHistoryItem(index) {
    if (ageCalculator && ageCalculator.history[index]) {
        const item = ageCalculator.history[index];
        const text = `Age: ${item.age} years | Born: ${item.birthDate} | Compared to: ${item.compareDate}`;
        
        navigator.clipboard.writeText(text).then(() => {
            // Show success message
            const historyItems = document.querySelectorAll('.history-item');
            if (historyItems[index]) {
                const copyBtn = historyItems[index].querySelector('.history-btn.copy');
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        }).catch(() => {
            alert('Age details copied to clipboard!');
        });
    }
}

function deleteHistoryItem(index) {
    if (ageCalculator) {
        ageCalculator.history.splice(index, 1);
        ageCalculator.saveToLocalStorage();
        ageCalculator.loadHistory();
    }
}

function clearHistory() {
    if (ageCalculator) {
        ageCalculator.clearHistory();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    ageCalculator = new AgeCalculator();
});

// Add error handling for the entire application
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    alert('An error occurred in the application. Please check the console for details.');
});