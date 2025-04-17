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
        
        if (!response.ok) {
            // Se a API retornar erro 404, usar configurações padrão
            if (response.status === 404) {
                fillSettingsForm(DEFAULT_SETTINGS);
                return;
            }
            throw new Error('Erro ao carregar configurações');
        }
        
        const settings = await response.json();
        fillSettingsForm(settings);
    } catch (error) {
        console.error('Erro:', error);
        // Se houver erro ao carregar, usar configurações padrão
        fillSettingsForm(DEFAULT_SETTINGS);
        showAlert('Usando configurações padrão', 'warning');
    }
}

// Função para preencher o formulário com as configurações
function fillSettingsForm(settings) {
    try {
        // Informações de Contato
        const fields = [
            'primary_email',
            'commercial_email',
            'primary_phone',
            'commercial_phone',
            'whatsapp',
            'business_hours',
            'street',
            'number',
            'complement',
            'neighborhood',
            'city',
            'postal_code',
            'maps_link',
            'about_text'
        ];

        fields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            if (element) {
                element.value = settings[field] || DEFAULT_SETTINGS[field] || '';
            }
        });
    } catch (error) {
        console.error('Erro ao preencher formulário:', error);
        showAlert('Erro ao preencher formulário', 'error');
    }
}

// Função para salvar as configurações
async function saveSettings(formData) {
    try {
        const settings = Object.fromEntries(formData);
        
        const response = await fetch(`${API_BASE_URL}/admin/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
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
    const contactForm = document.querySelector('#settingsForm');
    if (!contactForm) return;
    
    // Carregar configurações iniciais
    loadSettings();
    
    // Manipular envio do formulário
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
    if (resetButton) {
        resetButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
                fillSettingsForm(DEFAULT_SETTINGS);
            }
        });
    }
}

export { loadSettings, saveSettings }; 