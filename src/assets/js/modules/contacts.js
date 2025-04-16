/**
 * Módulo para gerenciamento de contatos
 */

import { API_BASE_URL } from './auth.js';
import { showAlert } from './ui.js';

// Carregar contatos
function loadContacts(page = 1) {
  if (!window.location.pathname.includes('contatos.html')) return;
  
  const tableBody = document.getElementById('contacts-table-body');
  if (!tableBody) return;
  
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) loadingIndicator.style.display = 'block';
  
  tableBody.innerHTML = '';
  
  fetch(`${API_BASE_URL}/admin/contacts?page=${page}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao carregar contatos');
      }
      return response.json();
    })
    .then(contacts => {
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      
      if (contacts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum contato encontrado</td></tr>';
        return;
      }
      
      contacts.forEach(contact => {
        const statusClass = contact.status === 'novo' 
          ? 'bg-warning text-dark' 
          : contact.status === 'respondido' 
            ? 'bg-success text-white' 
            : 'bg-secondary text-white';
        
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${contact.id}</td>
          <td>${contact.name}</td>
          <td>${contact.email}</td>
          <td>${contact.phone || 'N/A'}</td>
          <td><span class="badge ${statusClass}">${contact.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info view-contact" data-id="${contact.id}">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-contact" data-id="${contact.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Configurar eventos
      setupContactEvents();
    })
    .catch(error => {
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      showAlert('Erro ao carregar contatos: ' + error.message, 'danger');
      console.error('Erro ao carregar contatos:', error);
    });
}

// Configurar eventos para os botões de contato
function setupContactEvents() {
  // Ver detalhes do contato
  document.querySelectorAll('.view-contact').forEach(button => {
    button.addEventListener('click', () => {
      const contactId = button.getAttribute('data-id');
      viewContact(contactId);
    });
  });
  
  // Excluir contato
  document.querySelectorAll('.delete-contact').forEach(button => {
    button.addEventListener('click', () => {
      const contactId = button.getAttribute('data-id');
      if (confirm('Tem certeza que deseja excluir este contato?')) {
        deleteContact(contactId);
      }
    });
  });
}

// Ver detalhes do contato
function viewContact(contactId) {
  fetch(`${API_BASE_URL}/admin/contacts/${contactId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes do contato');
      }
      return response.json();
    })
    .then(contact => {
      // Criar modal para exibir detalhes
      const modal = document.createElement('div');
      modal.classList.add('modal', 'fade');
      modal.id = 'contactModal';
      modal.setAttribute('tabindex', '-1');
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Detalhes do Contato</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><strong>Nome:</strong> ${contact.name}</p>
              <p><strong>Email:</strong> ${contact.email}</p>
              <p><strong>Telefone:</strong> ${contact.phone || 'N/A'}</p>
              <p><strong>Status:</strong> ${contact.status}</p>
              <p><strong>Mensagem:</strong></p>
              <div class="card p-3 bg-light">
                ${contact.message}
              </div>
              <p class="mt-3"><strong>Data:</strong> ${new Date(contact.createdAt).toLocaleString()}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary mark-as-responded" data-id="${contact.id}">
                Marcar como Respondido
              </button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const modalInstance = new bootstrap.Modal(modal);
      modalInstance.show();
      
      // Configurar evento para marcar como respondido
      modal.querySelector('.mark-as-responded').addEventListener('click', () => {
        markContactAsResponded(contact.id, modalInstance);
      });
      
      // Remover modal do DOM quando for fechado
      modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
      });
    })
    .catch(error => {
      showAlert('Erro ao carregar detalhes do contato: ' + error.message, 'danger');
      console.error('Erro ao carregar detalhes do contato:', error);
    });
}

// Marcar contato como respondido
function markContactAsResponded(contactId, modalInstance) {
  fetch(`${API_BASE_URL}/admin/contacts/${contactId}/respond`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao atualizar status do contato');
      }
      return response.json();
    })
    .then(() => {
      showAlert('Contato marcado como respondido', 'success');
      modalInstance.hide();
      loadContacts();
    })
    .catch(error => {
      showAlert('Erro ao atualizar status do contato: ' + error.message, 'danger');
      console.error('Erro ao atualizar status do contato:', error);
    });
}

// Excluir contato
function deleteContact(contactId) {
  fetch(`${API_BASE_URL}/admin/contacts/${contactId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Falha ao excluir contato');
      }
      return response.json();
    })
    .then(() => {
      showAlert('Contato excluído com sucesso', 'success');
      loadContacts();
    })
    .catch(error => {
      showAlert('Erro ao excluir contato: ' + error.message, 'danger');
      console.error('Erro ao excluir contato:', error);
    });
}

// Exportar funções
export { loadContacts }; 