/**
 * Módulo de gerenciamento de configurações
 */

import { API_BASE_URL } from './auth.js';
import { showAlert } from './ui.js';

// Valores padrão para as configurações
const DEFAULT_SETTINGS = {
  primary_email: 'contato@versare.com.br',
  commercial_email: 'comercial@versare.com.br',
  primary_phone: '(11) 3456-7890',
  commercial_phone: '(11) 3456-7891',
  whatsapp: '(11) 98765-4321',
  business_hours: 'Segunda a Sexta: 9h às 18h | Sábado: 9h às 13h',
  street: 'Av. Paulista',
  number: '1000',
  complement: 'Conj. 1010',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  postal_code: '01310-000',
  maps_link: 'https://goo.gl/maps/examplelink',
  about_text: 'Versare Imóveis: Transformando sonhos em realidade desde 2005. Trabalhamos com excelência e dedicação para encontrar o imóvel perfeito para você.'
};

// Função para carregar as configurações do site
async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`);
        if (!response.ok) throw new Error('Erro ao carregar configurações');
        
        const settings = await response.json();
        fillSettingsForm(settings);
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao carregar configurações', 'error');
    }
}

// Função para preencher o formulário com as configurações
function fillSettingsForm(settings) {
    // Informações de Contato
    document.querySelector('[name="primary_email"]').value = settings.primary_email || '';
    document.querySelector('[name="commercial_email"]').value = settings.commercial_email || '';
    document.querySelector('[name="primary_phone"]').value = settings.primary_phone || '';
    document.querySelector('[name="commercial_phone"]').value = settings.commercial_phone || '';
    document.querySelector('[name="whatsapp"]').value = settings.whatsapp || '';
    document.querySelector('[name="business_hours"]').value = settings.business_hours || '';
    
    // Endereço
    document.querySelector('[name="street"]').value = settings.street || '';
    document.querySelector('[name="number"]').value = settings.number || '';
    document.querySelector('[name="complement"]').value = settings.complement || '';
    document.querySelector('[name="neighborhood"]').value = settings.neighborhood || '';
    document.querySelector('[name="city"]').value = settings.city || '';
    document.querySelector('[name="postal_code"]').value = settings.postal_code || '';
    document.querySelector('[name="maps_link"]').value = settings.maps_link || '';
    
    // Texto Sobre
    document.querySelector('[name="about_text"]').value = settings.about_text || '';
    
    // Redes Sociais
    document.querySelector('[name="instagram"]').value = settings.instagram || '';
    document.querySelector('[name="facebook"]').value = settings.facebook || '';
    document.querySelector('[name="linkedin"]').value = settings.linkedin || '';
    document.querySelector('[name="youtube"]').value = settings.youtube || '';
    
    // SEO
    document.querySelector('[name="site_title"]').value = settings.site_title || '';
    document.querySelector('[name="site_description"]').value = settings.site_description || '';
    document.querySelector('[name="keywords"]').value = settings.keywords || '';
    document.querySelector('[name="analytics_id"]').value = settings.analytics_id || '';
}

// Função para salvar as configurações
async function saveSettings(formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Object.fromEntries(formData))
        });

        if (!response.ok) throw new Error('Erro ao salvar configurações');
        
        const result = await response.json();
        showAlert('Configurações salvas com sucesso!', 'success');
        return result;
    } catch (error) {
        console.error('Erro:', error);
        showAlert('Erro ao salvar configurações', 'error');
        throw error;
    }
}

// Função para inicializar o formulário de configurações
export function initializeSettingsForm() {
    if (!window.location.pathname.includes('configuracoes.html')) return;
    
    // Carregar configurações iniciais
    loadSettings();
    
    // Manipular envio do formulário de contato
    const contactForm = document.querySelector('form');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        try {
            await saveSettings(formData);
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
        }
    });
    
    // Manipular restauração de padrões
    const resetButton = contactForm.querySelector('button[type="reset"]');
    resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            loadSettings();
        }
    });
}

export { loadSettings, saveSettings }; 