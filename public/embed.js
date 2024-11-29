// Retirement Tax Calculator Embed Script
(function() {
  // Create unique container ID
  const containerId = 'rtb-calculator-' + Math.random().toString(36).substring(7);
  
  // Get current script tag
  const script = document.currentScript;
  
  // Detect if mobile
  const isMobile = window.innerWidth < 768;
  
  // Create container with scoped styles
  const container = document.createElement('div');
  container.id = containerId;
  container.style.cssText = `
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  
  // Insert container before script
  script.parentNode.insertBefore(container, script);

  // Create and configure iframe
  const iframe = document.createElement('iframe');
  
  if (isMobile) {
    iframe.style.cssText = `
      width: 100%;
      border: none;
      height: 930px;
      display: block;
      overflow-y: hidden;
    `;
  } else {
    iframe.style.cssText = `
      width: 100%;
      border: none;
      height: 800px;
      overflow: hidden;
    `;
  }
  
  iframe.allow = 'clipboard-write';
  iframe.title = 'Retirement Tax Calculator';
  
  // Handle iframe resizing and scroll position
  window.addEventListener('message', (event) => {
    const calculatorDomain = window.location.hostname;
    if (!event.origin.includes(calculatorDomain)) return;
    
    if (event.data.type === 'rtb-calculator-height') {
      iframe.style.height = `${event.data.height}px`;
    }
    
    // Handle showing results on mobile
    if (event.data.type === 'rtb-show-results' && isMobile) {
      window.scrollTo({ top: container.offsetTop, behavior: 'smooth' });
    }
  });

  // Set iframe source to root path with mobile parameter
  const baseUrl = new URL(script.src).origin;
  iframe.src = `${baseUrl}${isMobile ? '?mobile=true' : ''}`;
  
  // Add iframe to container
  container.appendChild(iframe);
})();