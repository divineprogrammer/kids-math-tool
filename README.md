# Kids Math Practice App

A colorful, child-friendly math practice web application built with vanilla HTML, CSS, and JavaScript.

## Quick Start

Simply open `index.html` in your web browser:
- **Safari** (iPad or Mac)
- **Chrome** (Desktop)
- **Firefox** (Desktop/Mobile)
- **Edge** (Desktop)

No installation, no backend, no server needed - everything runs in your browser!

## How It Works

### 1. **Parent Setup Screen**
Configure a practice session:
- Choose **Operations**: Addition, Subtraction, Multiplication, or any mix
- Set **Digit Range**: 1-3 digit numbers
- Set **Term Range**: 2-5 numbers per expression
- Number of Questions (default: 10)
- Time Limit in minutes (default: 2)

Example valid expressions:
- `12 + 8 = ?`
- `15 - 7 = ?`
- `6 × 4 = ?`
- `20 - 5 + 3 = ?` (mixed operations, evaluated left-to-right)

### 2. **Child Practice Screen**
- Large expression displayed prominently
- On-screen number pad with buttons 0-9
- Clear, Backspace, and Submit buttons
- Timer counts down in the corner
- Child taps buttons to enter their answer

### 3. **Results Screen**
- Summary stats: Correct, Wrong, Unanswered
- Score and percentage
- Celebration animation for good scores (70%+)
- Detailed review of every question with:
  - The expression
  - Correct answer
  - Child's answer
  - Status (Correct/Wrong/Unanswered)
- Buttons to practice again or go back to setup

## Features

✅ **Fully Responsive** - Works great on iPad and desktop  
✅ **Child-Friendly UI** - Bright colors, large buttons, playful design  
✅ **iPad Optimized** - Large touch targets, gesture-friendly  
✅ **No Keyboard Required** - All input via on-screen buttons  
✅ **Smart Math Generation** - Prevents negative running totals  
✅ **Left-to-Right Evaluation** - No BODMAS/PEMDAS, simple rules  
✅ **Celebration Animation** - Confetti party for great scores!  
✅ **No Backend** - Everything runs 100% in the browser  
✅ **No Analytics** - Privacy-focused, no tracking  

## Math Rules

All expressions are evaluated **strictly left-to-right**:
- `12 - 8 + 7 = (12 - 8) + 7 = 4 + 7 = 11` ✓
- No brackets or BODMAS/PEMDAS
- No negative running totals allowed
- Example: `5 - 8` won't be generated because it would go negative
- Example: `5 - 5 + 3 = 3` is valid (zero is allowed as intermediate)

## Customization

Edit the default setup values in `script.js` or `index.html` if you want different defaults:
- Default questions: 10
- Default time limit: 2 minutes
- Default digit range: 1-2
- Default term range: 2-3

## Browser Compatibility

- ✅ iPad Safari (recommended!)
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari on Mac
- ✅ Edge

## File Structure

```
kids-math-tool/
├── index.html          # Main HTML structure
├── style.css           # Styling and animations
├── script.js           # All JavaScript logic
└── README.md           # This file
```

## Tips for Parents

1. **First Time**: Try 5-10 questions with 1-2 digit numbers to start
2. **Increase Difficulty**: Gradually increase digit range and term count
3. **Time**: Adjust time limit based on child's pace
4. **Encouragement**: Review answers together to identify learning areas
5. **Practice**: Regular short sessions are better than long ones

## Accessibility

- High contrast colors for visibility
- Large buttons suitable for touch
- Clear labels and instructions
- Simple, intuitive interface

## Technical Details

- **Framework**: None - pure vanilla JavaScript
- **Build Tools**: None required
- **Dependencies**: Zero external libraries
- **Size**: Minimal - loads instantly
- **Performance**: Smooth animations, instant math calculation

Enjoy practicing math! 🌟
