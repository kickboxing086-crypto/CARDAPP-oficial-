/**
 * Helper function to extract a store ID/slug from the current hostname.
 * 
 * Works for both:
 * - Vercel deployments (e.g., lanchonete-deus-e-bom.vercel.app or lanchonete-deus-e-bom.yourcustomdomain.com)
 * - Custom wildcard domains (e.g., *.cardapp.com.br)
 * 
 * Ignores:
 * - Localhost
 * - AI Studio preview URLs (*.run.app)
 * - Standard subdomains like www, api, admin, etc.
 */
export function getStoreIdFromHostname(hostname: string): string | null {
  if (!hostname) return null;
  const host = hostname.toLowerCase().trim();
  
  // Ignore local development hosts
  if (host === 'localhost' || host === '127.0.0.1' || host.includes('0.0.0.0')) {
    return null;
  }
  
  // Ignore AI Studio and other development preview domains
  const systemDomains = [
    'run.app',
    'aistudio.google',
    'webcontainer',
    'stackblitz',
    'vercel.app', // Root Vercel domain
  ];
  
  if (systemDomains.some(domain => host.endsWith(domain))) {
    const parts = host.split('.');
    
    // If it's JUST the main domain (e.g., cardappio-foodblue.vercel.app)
    if (host === 'cardappio-foodblue.vercel.app') return null;
    if (host === 'foodblue.vercel.app') return null;
    if (host === 'cardappio-psi.vercel.app') return null;
    if (host === 'cardapp-officiall.vercel.app') return null;
    
    // Standard system subdomains
    const excluded = ['www', 'api', 'admin', 'app', 'dev', 'preview', 'cardapp-officiall'];
    
    // For Vercel/Run.app, if it has exactly 3 parts (sub.vercel.app), 
    // we only treat it as a store if 'sub' is not a system name.
    if (parts.length === 3) {
      const sub = parts[0];
      if (excluded.includes(sub)) return null;
      
      // Additional check: if 'sub' is the project name itself
      if (sub === 'cardappio-foodblue' || sub === 'foodblue' || sub === 'hortifrutiexpres' || sub === 'cardappio-psi' || sub === 'cardapp-officiall') return null;
      
      return sub;
    }
    
    // For AI Studio (sub.region.run.app), parts.length is 4
    if (parts.length >= 4 && host.includes('run.app')) {
      return null;
    }
    
    return null;
  }
  
  // Custom domains
  const parts = host.split('.');
  if (parts.length >= 3) {
    const sub = parts[0];
    if (!['www', 'api', 'admin', 'app'].includes(sub)) {
      return sub;
    }
  }
  
  return null;
}
