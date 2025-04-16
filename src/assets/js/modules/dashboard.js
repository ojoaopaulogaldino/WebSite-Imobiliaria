/**
 * Módulo para o dashboard administrativo
 */

import { API_BASE_URL } from './auth.js';

// Carregar dados do dashboard
function loadDashboardData() {
  if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/admin/')) return;
  
  // Carregar contagem de imóveis
  fetch(`${API_BASE_URL}/admin/properties`)
    .then(response => response.json())
    .then(properties => {
      const totalProperties = properties.length;
      const activeProperties = properties.filter(p => p.status === 'ativo').length;
      const soldProperties = properties.filter(p => p.status === 'vendido').length;
      
      // Atualizar contadores
      const totalElement = document.getElementById('total-properties');
      const activeElement = document.getElementById('active-properties');
      const soldElement = document.getElementById('sold-properties');
      
      if (totalElement) totalElement.textContent = totalProperties;
      if (activeElement) activeElement.textContent = activeProperties;
      if (soldElement) soldElement.textContent = soldProperties;
    })
    .catch(error => {
      console.error('Erro ao carregar dados de imóveis:', error);
    });
  
  // Carregar contagem de contatos
  fetch(`${API_BASE_URL}/admin/contacts`)
    .then(response => response.json())
    .then(contacts => {
      const totalContacts = contacts.length;
      const newContacts = contacts.filter(c => c.status === 'novo').length;
      
      // Atualizar contadores
      const totalElement = document.getElementById('total-contacts');
      const newElement = document.getElementById('new-contacts');
      
      if (totalElement) totalElement.textContent = totalContacts;
      if (newElement) newElement.textContent = newContacts;
    })
    .catch(error => {
      console.error('Erro ao carregar dados de contatos:', error);
    });
}

// Exportar funções
export { loadDashboardData }; 