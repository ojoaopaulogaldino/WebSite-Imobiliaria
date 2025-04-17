/**
 * Módulo para o dashboard administrativo
 */

import { API_BASE_URL } from './auth.js';

// Formatar data e hora
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

// Formatar valor em reais
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

// Carregar dados do dashboard
function loadDashboardData() {
  if (!window.location.pathname.includes('index.html') && !window.location.pathname.endsWith('/admin/')) return;
  
  // Carregar dados de estatísticas do dashboard
  fetch('/api/admin/dashboard-stats')
    .then(response => response.json())
    .then(stats => {
      console.log('Estatísticas carregadas:', stats);
      
      // Atualizar contadores de imóveis
      const totalPropertiesElement = document.getElementById('total-properties');
      if (totalPropertiesElement) totalPropertiesElement.textContent = stats.totalProperties || 0;
      
      // Atualizar contadores de mensagens
      const totalContactsElement = document.getElementById('total-contacts');
      if (totalContactsElement) {
        // Soma de mensagens de contato e WhatsApp
        const totalMessages = (stats.totalContacts || 0) + (stats.totalWhatsappMessages || 0);
        totalContactsElement.textContent = totalMessages;
      }
      
      // Atualizar contagem de mensagens não lidas
      const newContactsElement = document.getElementById('new-contacts');
      if (newContactsElement) {
        // Soma de contatos novos + mensagens de WhatsApp não visualizadas
        const newMessages = (stats.newContacts || 0) + (stats.newWhatsappMessages || 0);
        newContactsElement.textContent = newMessages;
      }
      
      // Popular imóveis recentes (assumimos que seja carregado de outro endpoint)
      // Aqui carregamos separadamente ou usamos os dados que já temos
      
      // Popular mensagens recentes
      const recentMessagesContainer = document.querySelector('.space-y-4');
      if (recentMessagesContainer && stats.recentWhatsappMessages && stats.recentContacts) {
        // Combinar mensagens de WhatsApp e contatos
        const allMessages = [
          ...(stats.recentWhatsappMessages || []).map(msg => ({
            ...msg,
            type: 'whatsapp',
            email: '-',
            name: msg.name,
            message: msg.message,
            date: msg.created_at,
            status: msg.viewed ? 'lido' : 'não lido'
          })),
          ...(stats.recentContacts || []).map(contact => ({
            ...contact,
            type: 'contact',
            name: contact.name,
            email: contact.email,
            message: contact.message,
            date: contact.created_at,
            status: contact.status === 'novo' ? 'não lido' : 'em andamento'
          }))
        ];
        
        // Ordenar por data, mais recentes primeiro
        allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Limitar a 5 mensagens
        const recentMessages = allMessages.slice(0, 5);
        
        // Limpar conteúdo atual
        recentMessagesContainer.innerHTML = '';
        
        // Adicionar mensagens
        recentMessages.forEach(message => {
          const messageElement = document.createElement('div');
          messageElement.className = 'p-4 border border-[#E0DEF7] rounded-lg';
          
          const statusClass = message.status === 'não lido' || message.status === 'novo' 
            ? 'bg-red-100 text-red-800' 
            : 'bg-green-100 text-green-800';
            
          const typeIcon = message.type === 'whatsapp' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-500 inline-block mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' 
            : '<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-500 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>';
            
          messageElement.innerHTML = `
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-semibold text-gray-800">${message.name} ${typeIcon}</h4>
                <p class="text-xs text-gray-500">${message.email} • ${formatDateTime(message.date)}</p>
              </div>
              <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusClass}">
                ${message.status === 'não lido' || message.status === 'novo' ? 'Não lida' : 'Em andamento'}
              </span>
            </div>
            <p class="mt-2 text-sm text-gray-700">${message.message.substring(0, 100)}${message.message.length > 100 ? '...' : ''}</p>
            <div class="mt-3 flex justify-end">
              <a href="${message.type === 'whatsapp' ? 'ver-whatsapp.html?id=' + message.id : 'ver-contato.html?id=' + message.id}" 
                 class="text-sm text-[#1E5DBC] font-medium hover:underline">
                Ver mensagem completa
              </a>
            </div>
          `;
          
          recentMessagesContainer.appendChild(messageElement);
        });
        
        // Se não houver mensagens
        if (recentMessages.length === 0) {
          recentMessagesContainer.innerHTML = '<p class="text-center text-gray-500 py-4">Nenhuma mensagem recente encontrada.</p>';
        }
      }
    })
    .catch(error => {
      console.error('Erro ao carregar estatísticas do dashboard:', error);
      
      // Em caso de erro, definir valores padrão
      const totalElement = document.getElementById('total-properties');
      const activeElement = document.getElementById('active-properties');
      const soldElement = document.getElementById('sold-properties');
      const totalContactsElement = document.getElementById('total-contacts');
      const newContactsElement = document.getElementById('new-contacts');
      
      if (totalElement) totalElement.textContent = '0';
      if (activeElement) activeElement.textContent = '0';
      if (soldElement) soldElement.textContent = '0';
      if (totalContactsElement) totalContactsElement.textContent = '0';
      if (newContactsElement) newContactsElement.textContent = '0';
      
      // Mostrar mensagem de erro nas mensagens recentes
      const recentMessagesContainer = document.querySelector('.space-y-4');
      if (recentMessagesContainer) {
        recentMessagesContainer.innerHTML = '<p class="text-center text-red-500 py-4">Erro ao carregar mensagens. Tente novamente mais tarde.</p>';
      }
    });
}

// Exportar funções
export { loadDashboardData }; 