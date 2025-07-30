class PasswordGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.generatePassword();
    }

    initializeElements() {
        this.passwordOutput = document.getElementById('passwordOutput');
        this.copyBtn = document.getElementById('copyBtn');
        this.lengthSlider = document.getElementById('lengthSlider');
        this.lengthValue = document.getElementById('lengthValue');
        this.generateBtn = document.getElementById('generateBtn');
        this.strengthBar = document.getElementById('strengthBar');
        this.strengthText = document.getElementById('strengthText');

        // Checkboxes
        this.uppercaseCheck = document.getElementById('uppercase');
        this.lowercaseCheck = document.getElementById('lowercase');
        this.numbersCheck = document.getElementById('numbers');
        this.symbolsCheck = document.getElementById('symbols');
        this.excludeSimilarCheck = document.getElementById('excludeSimilar');
        this.excludeAmbiguousCheck = document.getElementById('excludeAmbiguous');

        // Preset buttons
        this.presetWeak = document.getElementById('presetWeak');
        this.presetMedium = document.getElementById('presetMedium');
        this.presetStrong = document.getElementById('presetStrong');
    }

    attachEventListeners() {
        // Generate button
        this.generateBtn.addEventListener('click', () => this.generatePassword());

        // Copy button
        this.copyBtn.addEventListener('click', () => this.copyPassword());

        // Length slider
        this.lengthSlider.addEventListener('input', (e) => {
            this.lengthValue.textContent = e.target.value;
            this.generatePassword();
        });

        // Checkboxes
        [this.uppercaseCheck, this.lowercaseCheck, this.numbersCheck, 
         this.symbolsCheck, this.excludeSimilarCheck, this.excludeAmbiguousCheck]
            .forEach(checkbox => {
                checkbox.addEventListener('change', () => this.generatePassword());
            });

        // Preset buttons
        this.presetWeak.addEventListener('click', () => this.applyPreset('weak'));
        this.presetMedium.addEventListener('click', () => this.applyPreset('medium'));
        this.presetStrong.addEventListener('click', () => this.applyPreset('strong'));

        // Generate on Enter key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.generatePassword();
            }
        });
    }

    getCharacterSets() {
        let charset = '';
        const sets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };

        // Similar characters to exclude
        const similarChars = '0Ol1I';
        
        // Ambiguous characters to exclude
        const ambiguousChars = '{}[]()\/\\\'"`~,;.<>';

        if (this.uppercaseCheck.checked) charset += sets.uppercase;
        if (this.lowercaseCheck.checked) charset += sets.lowercase;
        if (this.numbersCheck.checked) charset += sets.numbers;
        if (this.symbolsCheck.checked) charset += sets.symbols;

        // Remove similar characters if requested
        if (this.excludeSimilarCheck.checked) {
            charset = charset.split('').filter(char => !similarChars.includes(char)).join('');
        }

        // Remove ambiguous characters if requested
        if (this.excludeAmbiguousCheck.checked) {
            charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('');
        }

        return charset;
    }

    generatePassword() {
        const length = parseInt(this.lengthSlider.value);
        const charset = this.getCharacterSets();

        if (charset.length === 0) {
            this.passwordOutput.value = 'Wybierz przynajmniej jeden typ znaków!';
            this.updateStrengthMeter(0);
            return;
        }

        let password = '';
        
        // Ensure password contains at least one character from each selected type
        const requiredChars = [];
        if (this.uppercaseCheck.checked) requiredChars.push(this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        if (this.lowercaseCheck.checked) requiredChars.push(this.getRandomChar('abcdefghijklmnopqrstuvwxyz'));
        if (this.numbersCheck.checked) requiredChars.push(this.getRandomChar('0123456789'));
        if (this.symbolsCheck.checked) requiredChars.push(this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?'));

        // Add required characters first
        requiredChars.forEach(char => {
            if (charset.includes(char)) {
                password += char;
            }
        });

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += this.getRandomChar(charset);
        }

        // Shuffle the password
        password = this.shuffleString(password);

        this.passwordOutput.value = password;
        this.updateStrengthMeter(this.calculateStrength(password));
        this.animatePasswordGeneration();
    }

    getRandomChar(charset) {
        const randomArray = new Uint32Array(1);
        crypto.getRandomValues(randomArray);
        return charset.charAt(randomArray[0] % charset.length);
    }

    shuffleString(str) {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    calculateStrength(password) {
        let score = 0;
        let feedback = '';

        // Length scoring
        if (password.length >= 8) score += 25;
        if (password.length >= 12) score += 25;
        if (password.length >= 16) score += 25;

        // Character variety scoring
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/[0-9]/.test(password)) score += 5;
        if (/[^A-Za-z0-9]/.test(password)) score += 10;

        // Additional complexity
        if (password.length >= 20) score += 5;

        // Determine strength level
        if (score < 30) {
            feedback = 'Bardzo słabe';
        } else if (score < 50) {
            feedback = 'Słabe';
        } else if (score < 70) {
            feedback = 'Średnie';
        } else if (score < 90) {
            feedback = 'Silne';
        } else {
            feedback = 'Bardzo silne';
        }

        this.strengthText.textContent = `Siła hasła: ${feedback}`;
        return Math.min(score, 100);
    }

    updateStrengthMeter(strength) {
        const bar = this.strengthBar;
        
        // Update the CSS custom property for width
        document.documentElement.style.setProperty('--strength-width', `${strength}%`);
        
        // Update strength text color based on strength
        if (strength < 30) {
            this.strengthText.style.color = '#ff4444';
        } else if (strength < 50) {
            this.strengthText.style.color = '#ffaa00';
        } else if (strength < 70) {
            this.strengthText.style.color = '#88ff88';
        } else {
            this.strengthText.style.color = '#00ff88';
        }
    }

    animatePasswordGeneration() {
        this.passwordOutput.style.transform = 'scale(1.05)';
        this.passwordOutput.style.borderColor = '#88ff00';
        
        setTimeout(() => {
            this.passwordOutput.style.transform = 'scale(1)';
            this.passwordOutput.style.borderColor = '#00ff88';
        }, 200);
    }

    async copyPassword() {
        const password = this.passwordOutput.value;
        
        if (!password || password.includes('Wybierz')) {
            this.showNotification('Brak hasła do skopiowania!', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            this.showNotification('Hasło skopiowane do schowka!', 'success');
            
            // Visual feedback
            this.copyBtn.style.background = 'linear-gradient(135deg, #88ff00, #00ff88)';
            this.copyBtn.textContent = '✓';
            
            setTimeout(() => {
                this.copyBtn.style.background = 'linear-gradient(135deg, #00ff88, #00ccff)';
                this.copyBtn.textContent = '📋';
            }, 1000);
            
        } catch (err) {
            this.showNotification('Błąd podczas kopiowania hasła!', 'error');
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: #000;
            font-weight: 600;
            font-family: 'Source Code Pro', monospace;
            z-index: 1000;
            transform: translateX(400px);
            transition: all 0.3s ease;
            ${type === 'success' ? 'background: linear-gradient(135deg, #88ff00, #00ff88);' : ''}
            ${type === 'error' ? 'background: linear-gradient(135deg, #ff4444, #ff8888);' : ''}
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    applyPreset(type) {
        switch (type) {
            case 'weak':
                this.lengthSlider.value = 8;
                this.uppercaseCheck.checked = true;
                this.lowercaseCheck.checked = true;
                this.numbersCheck.checked = false;
                this.symbolsCheck.checked = false;
                this.excludeSimilarCheck.checked = false;
                this.excludeAmbiguousCheck.checked = false;
                break;
                
            case 'medium':
                this.lengthSlider.value = 12;
                this.uppercaseCheck.checked = true;
                this.lowercaseCheck.checked = true;
                this.numbersCheck.checked = true;
                this.symbolsCheck.checked = false;
                this.excludeSimilarCheck.checked = false;
                this.excludeAmbiguousCheck.checked = false;
                break;
                
            case 'strong':
                this.lengthSlider.value = 20;
                this.uppercaseCheck.checked = true;
                this.lowercaseCheck.checked = true;
                this.numbersCheck.checked = true;
                this.symbolsCheck.checked = true;
                this.excludeSimilarCheck.checked = true;
                this.excludeAmbiguousCheck.checked = true;
                break;
        }
        
        this.lengthValue.textContent = this.lengthSlider.value;
        this.generatePassword();
        
        // Visual feedback for preset button
        const presetBtn = document.getElementById(`preset${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (presetBtn) {
            presetBtn.style.background = 'rgba(0, 255, 136, 0.3)';
            presetBtn.style.borderColor = '#88ff00';
            
            setTimeout(() => {
                presetBtn.style.background = 'rgba(0, 255, 136, 0.1)';
                presetBtn.style.borderColor = '#00ff88';
            }, 500);
        }
    }
}

// Custom CSS for strength meter animation
const style = document.createElement('style');
style.textContent = `
    :root {
        --strength-width: 0%;
    }
`;
document.head.appendChild(style);

// Initialize the password generator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});

// Add some easter eggs and interactive elements
document.addEventListener('keydown', (e) => {
    // Konami code easter egg
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
    
    if (!window.konamiProgress) window.konamiProgress = 0;
    
    if (e.code === konamiCode[window.konamiProgress]) {
        window.konamiProgress++;
        if (window.konamiProgress === konamiCode.length) {
            // Easter egg activated!
            document.body.style.animation = 'rainbow 2s infinite';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 5000);
            window.konamiProgress = 0;
        }
    } else {
        window.konamiProgress = 0;
    }
});

// Add rainbow animation CSS
const rainbowStyle = document.createElement('style');
rainbowStyle.textContent = `
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
`;
document.head.appendChild(rainbowStyle);
