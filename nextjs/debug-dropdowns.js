// Debug script to check if genres and instruments are loaded
// Run this in the browser console when on the database page

console.log("Debugging dropdowns...");
console.log("Checking genres state:", window.__DEBUG_GENRES__ = Array.from(document.querySelectorAll('select[placeholder*="genre"] option')).map(el => ({ text: el.textContent, value: el.value })));
console.log("Checking instruments state:", window.__DEBUG_INSTRUMENTS__ = Array.from(document.querySelectorAll('select[placeholder*="instrument"] option')).map(el => ({ text: el.textContent, value: el.value })));

// Let's check the actual state variables by adding a debug element
const debugEl = document.createElement('div');
debugEl.id = 'dropdown-debug';
debugEl.style.position = 'fixed';
debugEl.style.bottom = '0';
debugEl.style.right = '0';
debugEl.style.background = 'rgba(0,0,0,0.8)';
debugEl.style.color = 'white';
debugEl.style.padding = '10px';
debugEl.style.zIndex = '9999';
debugEl.style.maxHeight = '300px';
debugEl.style.overflow = 'auto';
debugEl.style.maxWidth = '500px';
debugEl.style.fontSize = '12px';
debugEl.style.fontFamily = 'monospace';

// Add button to toggle debug info
const toggleButton = document.createElement('button');
toggleButton.textContent = 'Toggle Debug Info';
toggleButton.style.background = '#083e4d';
toggleButton.style.color = 'white';
toggleButton.style.border = 'none';
toggleButton.style.padding = '5px 10px';
toggleButton.style.cursor = 'pointer';
toggleButton.style.marginBottom = '10px';

// Add content container
const contentDiv = document.createElement('div');
contentDiv.style.display = 'none';

// Add event listener to toggle
toggleButton.addEventListener('click', () => {
    contentDiv.style.display = contentDiv.style.display === 'none' ? 'block' : 'none';
});

debugEl.appendChild(toggleButton);
debugEl.appendChild(contentDiv);

// Function to update debug content
function updateDebugContent() {
    // Get references from React dev tools
    const state = window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.get(1)?._debugOwner?.memoizedState;
    
    let content = '<h3>React State Debug</h3>';
    
    if (state) {
        // Try to find genres and instruments in React state
        let currentState = state;
        while (currentState) {
            const stateName = currentState.memoizedState && Array.isArray(currentState.memoizedState) 
                ? `Array(${currentState.memoizedState.length})` 
                : typeof currentState.memoizedState;
            
            content += `<div>State: ${stateName}</div>`;
            currentState = currentState.next;
        }
    } else {
        content += '<div>React DevTools hook not available</div>';
    }
    
    // Add HTML select info
    content += '<h3>DOM Elements</h3>';
    content += '<div>Genre select options: ' + document.querySelectorAll('select[placeholder*="genre"] option').length + '</div>';
    content += '<div>Instrument select options: ' + document.querySelectorAll('select[placeholder*="instrument"] option').length + '</div>';
    
    contentDiv.innerHTML = content;
}

// Initial update
updateDebugContent();

// Update every second
setInterval(updateDebugContent, 1000);

document.body.appendChild(debugEl);

// Test direct DOM manipulation to add options
console.log("Attempting to add options directly to dropdowns...");
try {
    const genreSelects = document.querySelectorAll('select[placeholder*="genre"]');
    const instrumentSelects = document.querySelectorAll('select[placeholder*="instrument"]');
    
    console.log(`Found ${genreSelects.length} genre selects and ${instrumentSelects.length} instrument selects`);
    
    if (genreSelects.length > 0) {
        const sampleGenres = ['Rock', 'Jazz', 'Classical', 'Pop', 'Metal'];
        sampleGenres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.toLowerCase();
            option.textContent = genre;
            genreSelects[0].appendChild(option);
        });
    }
    
    if (instrumentSelects.length > 0) {
        const sampleInstruments = ['Piano', 'Guitar', 'Violin', 'Drums', 'Flute'];
        sampleInstruments.forEach(instrument => {
            const option = document.createElement('option');
            option.value = instrument.toLowerCase();
            option.textContent = instrument;
            instrumentSelects[0].appendChild(option);
        });
    }
} catch (e) {
    console.error("Error manipulating DOM:", e);
}
