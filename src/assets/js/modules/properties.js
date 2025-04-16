/**
 * Módulo de gerenciamento de imóveis
 */

import { API_BASE_URL } from '../config/auth.js';
import { showAlert, formatPrice, formatPropertyType, updatePaginationInfo } from './ui.js';
import { uploadPropertyImages } from './image-uploader.js';
import { initVideoManager, saveVideos, loadExistingVideos } from './video-manager.js';

// Função de debounce para evitar múltiplas requisições
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Inicializar filtros e eventos
export function initializeFilters() {
  if (!window.location.pathname.includes('imoveis.html')) return;
  
  // Configurar eventos de filtro
  const searchInput = document.getElementById('search');
  const filterType = document.getElementById('filter_type');
  const filterStatus = document.getElementById('filter_status');
  const filterButton = document.querySelector('button[type="submit"]');
  
  // Aplicar debounce na busca
  const debouncedSearch = debounce(() => {
    window.currentPage = 1; // Resetar paginação ao buscar
    loadProperties();
  }, 500);
  
  // Evento de busca em tempo real
  if (searchInput) {
    searchInput.addEventListener('input', debouncedSearch);
  }
  
  // Eventos de filtro
  if (filterType) {
    filterType.addEventListener('change', () => {
      window.currentPage = 1;
      loadProperties();
    });
  }
  
  if (filterStatus) {
    filterStatus.addEventListener('change', () => {
      window.currentPage = 1;
      loadProperties();
    });
  }
  
  // Evento do botão de filtrar
  if (filterButton) {
    filterButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.currentPage = 1;
      loadProperties();
    });
  }
  
  // Configurar paginação
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (window.currentPage > 1) {
        window.currentPage--;
        loadProperties();
      }
    });
  }
  
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (window.currentPage < window.totalPages) {
        window.currentPage++;
        loadProperties();
      }
    });
  }
  
  // Carregar imóveis inicialmente
  loadProperties();
}

// Carregar lista de imóveis
export function loadProperties() {
  if (!window.location.pathname.includes('imoveis.html')) return;
  
  const tableBody = document.querySelector('.property-list');
  const filterButton = document.querySelector('button[type="submit"]');
  
  if (!tableBody) return;
  
  // Obter dados de filtro
  const search = document.getElementById('search')?.value || '';
  const filterType = document.getElementById('filter_type')?.value || '';
  const filterStatus = document.getElementById('filter_status')?.value || '';
  
  // Obter dados de paginação
  const currentPage = window.currentPage || 1;
  const itemsPerPage = window.itemsPerPage || 10;
  
  // Construir query string
  let queryParams = `page=${currentPage}&limit=${itemsPerPage}`;
  if (search) queryParams += `&search=${encodeURIComponent(search)}`;
  if (filterType) queryParams += `&type=${encodeURIComponent(filterType)}`;
  if (filterStatus) queryParams += `&status=${encodeURIComponent(filterStatus)}`;
  
  // Atualizar UI para estado de carregamento
  tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Carregando imóveis...</td></tr>';
  if (filterButton) {
    filterButton.disabled = true;
    filterButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Filtrando...
    `;
  }
  
  // Desabilitar inputs durante a busca
  const inputs = document.querySelectorAll('#search, #filter_type, #filter_status');
  inputs.forEach(input => input.disabled = true);
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/admin/properties?${queryParams}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis');
      }
      return response.json();
    })
    .then(data => {
      const properties = data.properties || data;
      const totalItems = data.total || properties.length;
      const totalPages = data.totalPages || Math.ceil(totalItems / itemsPerPage);
      
      // Atualizar variáveis de paginação
      window.totalItems = totalItems;
      window.totalPages = totalPages;
      
      // Atualizar botões de paginação
      const prevButton = document.getElementById('prev-page');
      const nextButton = document.getElementById('next-page');
      
      if (prevButton) {
        prevButton.disabled = currentPage <= 1;
      }
      
      if (nextButton) {
        nextButton.disabled = currentPage >= totalPages;
      }
      
      if (properties.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="text-center py-8">
              <div class="flex flex-col items-center justify-center text-gray-500">
                <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-lg font-medium">Nenhum imóvel encontrado</p>
                <p class="text-sm">Tente ajustar os filtros de busca</p>
              </div>
            </td>
          </tr>
        `;
        
        // Atualizar informações de paginação
        updatePaginationInfo(0, 0, 0);
        
        return;
      }
      
      // Calcular intervalo de exibição
      const start = (currentPage - 1) * itemsPerPage + 1;
      const end = Math.min(start + properties.length - 1, totalItems);
      
      // Atualizar informações de paginação
      updatePaginationInfo(start, end, totalItems);
      
      // Limpar a tabela
      tableBody.innerHTML = '';
      
      // Adicionar cada propriedade à tabela
      properties.forEach(property => {
        const row = document.createElement('tr');
        
        // Formatar status para exibição
        let statusClass = '';
        let statusText = property.status;
        
        switch (property.status) {
          case 'ativo':
            statusClass = 'bg-green-100 text-green-800';
            statusText = 'Ativo';
            break;
          case 'inativo':
            statusClass = 'bg-gray-100 text-gray-800';
            statusText = 'Inativo';
            break;
          case 'vendido':
            statusClass = 'bg-yellow-100 text-yellow-800';
            statusText = 'Vendido/Alugado';
            break;
        }
        
        // Formatar preço para exibição
        let formattedPrice = '';
        if (property.type === 'aluguel') {
          formattedPrice = `R$ ${formatPrice(property.price)}/mês`;
        } else if (property.type === 'lancamento') {
          formattedPrice = `A partir de R$ ${formatPrice(property.price)}`;
        } else {
          formattedPrice = `R$ ${formatPrice(property.price)}`;
        }
        
        row.innerHTML = `
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${property.code}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${property.title}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${formatPropertyType(property.type)}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${property.neighborhood} - ${property.city}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${formattedPrice}</td>
          <td class="px-4 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">${statusText}</span>
          </td>
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
            <a href="editar-imovel.html?id=${property.id}" class="text-[#1E5DBC] hover:text-indigo-800 mr-3">Editar</a>
            <a href="javascript:void(0)" class="text-red-600 hover:text-red-800 delete-property" data-id="${property.id}">Remover</a>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Adicionar eventos para botões de exclusão
      document.querySelectorAll('.delete-property').forEach(button => {
        button.addEventListener('click', function() {
          const propertyId = this.getAttribute('data-id');
          deleteProperty(propertyId);
        });
      });
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis:', error);
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-8">
            <div class="flex flex-col items-center justify-center text-red-500">
              <svg class="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-lg font-medium">Erro ao carregar imóveis</p>
              <p class="text-sm">${error.message}</p>
            </div>
          </td>
        </tr>
      `;
      
      // Atualizar informações de paginação
      updatePaginationInfo(0, 0, 0);
    })
    .finally(() => {
      // Restaurar UI após carregamento
      if (filterButton) {
        filterButton.disabled = false;
        filterButton.innerHTML = 'Filtrar';
      }
      
      // Reabilitar inputs
      inputs.forEach(input => input.disabled = false);
    });
}

// Função para excluir um imóvel
function deleteProperty(propertyId) {
  if (!confirm('Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.')) {
    return;
  }
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao excluir imóvel');
      }
      return response.json();
    })
    .then(data => {
      showAlert('Imóvel excluído com sucesso', 'success');
      
      // Recarregar a lista de imóveis
      loadProperties();
    })
    .catch(error => {
      console.error('Erro ao excluir imóvel:', error);
      showAlert('Erro ao excluir imóvel: ' + error.message, 'error');
    });
}

// Enviar formulário de imóvel (novo ou edição)
function handlePropertyForm(event) {
  event.preventDefault();
  
  const form = event.target;
  const isEditing = form.getAttribute('data-editing') === 'true';
  const propertyId = form.getAttribute('data-property-id');
  
  // Obter dados do formulário
  const formData = {
    code: form.querySelector('#code')?.value,
    title: form.querySelector('#title')?.value,
    type: form.querySelector('#type')?.value,
    property_type: form.querySelector('#property_type')?.value,
    price: form.querySelector('#price')?.value,
    status: form.querySelector('#status')?.value,
    neighborhood: form.querySelector('#neighborhood')?.value,
    city: form.querySelector('#city')?.value,
    address: form.querySelector('#address')?.value,
    postal_code: form.querySelector('#postal_code')?.value,
    area: form.querySelector('#area')?.value,
    bedrooms: form.querySelector('#bedrooms')?.value,
    bathrooms: form.querySelector('#bathrooms')?.value,
    parking_spaces: form.querySelector('#parking_spaces')?.value,
    suites: form.querySelector('#suites')?.value,
    furnished: form.querySelector('#furnished')?.value,
    description: form.querySelector('#description')?.value,
    featured: form.querySelector('#featured')?.checked ? 1 : 0
  };
  
  // Obter comodidades selecionadas
  const amenities = [];
  form.querySelectorAll('input[type="checkbox"][name^="amenity_"]:checked').forEach(checkbox => {
    amenities.push(checkbox.value);
  });
  
  formData.amenities = amenities;
  
  // Validar campos obrigatórios
  if (!formData.title || !formData.type || !formData.property_type || !formData.price || 
      !formData.status || !formData.neighborhood || !formData.city) {
    showAlert('Preencha todos os campos obrigatórios', 'error');
    return;
  }
  
  // Desabilitar o botão de envio
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = isEditing ? 'Atualizando...' : 'Salvando...';
  }
  
  // Definir método e URL baseado se é edição ou criação
  const method = isEditing ? 'PUT' : 'POST';
  const url = isEditing 
    ? `${API_BASE_URL}/admin/properties/${propertyId}` 
    : `${API_BASE_URL}/admin/properties`;
  
  // Enviar para a API
  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(isEditing ? 'Erro ao atualizar imóvel' : 'Erro ao adicionar imóvel');
      }
      return response.json();
    })
    .then(data => {
      // Após salvar com sucesso, enviar as imagens
      const propertyId = isEditing ? propertyId : data.id;
      
      // Verificar se há imagens para enviar
      const imageInput = document.getElementById('property-images');
      let hasImages = imageInput && imageInput.files.length > 0;
      
      // Verificar se há vídeos para enviar
      let hasVideos = false;
      if (window.pendingVideos && Array.isArray(window.pendingVideos)) {
        hasVideos = window.pendingVideos.length > 0;
        console.log(`Verificando vídeos pendentes: ${window.pendingVideos.length}`);
      }
      
      // Se tiver imagens e vídeos, enviar ambos
      if (hasImages && hasVideos) {
        // Mostrar mensagem de que está enviando imagens
        showAlert('Enviando imagens e vídeos...', 'info');
        
        // Chamar função para upload de imagens e depois de vídeos
        return uploadPropertyImages(propertyId)
          .then(() => saveVideos(propertyId))
          .then(() => {
            showAlert(isEditing ? 'Imóvel, imagens e vídeos atualizados com sucesso' : 'Imóvel, imagens e vídeos adicionados com sucesso', 'success');
            // Redirecionar após sucesso
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          })
          .catch(error => {
            console.error('Erro ao enviar mídias:', error);
            showAlert('Imóvel salvo, mas houve um erro ao enviar as mídias', 'warning');
            // Ainda redireciona mesmo com erro nas mídias
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          });
      } 
      // Se tiver apenas imagens
      else if (hasImages) {
        // Mostrar mensagem de que está enviando imagens
        showAlert('Enviando imagens...', 'info');
        
        // Chamar função para upload de imagens
        return uploadPropertyImages(propertyId)
          .then(() => {
            showAlert(isEditing ? 'Imóvel e imagens atualizados com sucesso' : 'Imóvel e imagens adicionados com sucesso', 'success');
            // Redirecionar após sucesso
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          })
          .catch(error => {
            console.error('Erro ao enviar imagens:', error);
            showAlert('Imóvel salvo, mas houve um erro ao enviar as imagens', 'warning');
            // Ainda redireciona mesmo com erro nas imagens
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          });
      }
      // Se tiver apenas vídeos
      else if (hasVideos) {
        // Mostrar mensagem de que está enviando vídeos
        showAlert('Enviando vídeos...', 'info');
        
        // Chamar função para upload de vídeos
        return saveVideos(propertyId)
          .then(() => {
            showAlert(isEditing ? 'Imóvel e vídeos atualizados com sucesso' : 'Imóvel e vídeos adicionados com sucesso', 'success');
            // Redirecionar após sucesso
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          })
          .catch(error => {
            console.error('Erro ao enviar vídeos:', error);
            showAlert('Imóvel salvo, mas houve um erro ao enviar os vídeos', 'warning');
            // Ainda redireciona mesmo com erro nos vídeos
            setTimeout(() => {
              window.location.href = 'imoveis.html';
            }, 1500);
          });
      } else {
        // Se não há mídias para enviar
        showAlert(isEditing ? 'Imóvel atualizado com sucesso' : 'Imóvel adicionado com sucesso', 'success');
        
        // Redirecionar para a lista de imóveis após um breve delay
        setTimeout(() => {
          window.location.href = 'imoveis.html';
        }, 1500);
      }
    })
    .catch(error => {
      console.error('Erro ao salvar imóvel:', error);
      showAlert(error.message, 'error');
      
      // Reabilitar o botão
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = isEditing ? 'Atualizar Imóvel' : 'Adicionar Imóvel';
      }
    });
}

// Carregar detalhes de um imóvel para edição
function loadPropertyForEditing() {
  if (!window.location.pathname.includes('editar-imovel.html')) return;
  
  // Obter o ID do imóvel da URL
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get('id');
  
  if (!propertyId) {
    window.location.href = 'imoveis.html';
    return;
  }
  
  const form = document.querySelector('form');
  
  if (!form) return;
  
  // Marcar o formulário como edição
  form.setAttribute('data-editing', 'true');
  form.setAttribute('data-property-id', propertyId);
  
  // Inicializar o gerenciador de vídeos
  initVideoManager();
  
  // Carregar vídeos existentes
  loadExistingVideos(propertyId);
  
  // Carregar dados do imóvel
  fetch(`${API_BASE_URL}/properties/${propertyId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Imóvel não encontrado');
      }
      return response.json();
    })
    .then(property => {
      // Preencher os campos do formulário
      form.querySelector('#code').value = property.code;
      form.querySelector('#code').disabled = true; // Código não editável
      form.querySelector('#title').value = property.title;
      form.querySelector('#type').value = property.type;
      form.querySelector('#property_type').value = property.property_type;
      form.querySelector('#price').value = property.price;
      form.querySelector('#status').value = property.status;
      form.querySelector('#neighborhood').value = property.neighborhood;
      form.querySelector('#city').value = property.city;
      form.querySelector('#address').value = property.address || '';
      form.querySelector('#postal_code').value = property.postal_code || '';
      form.querySelector('#area').value = property.area || '';
      form.querySelector('#bedrooms').value = property.bedrooms || '';
      form.querySelector('#bathrooms').value = property.bathrooms || '';
      form.querySelector('#parking_spaces').value = property.parking_spaces || '';
      form.querySelector('#suites').value = property.suites || '';
      form.querySelector('#furnished').value = property.furnished || 'não';
      form.querySelector('#description').value = property.description || '';
      form.querySelector('#featured').checked = property.featured === 1;
      
      // Marcar as comodidades
      if (property.amenities && property.amenities.length > 0) {
        property.amenities.forEach(amenity => {
          const checkbox = form.querySelector(`input[type="checkbox"][value="${amenity}"]`);
          if (checkbox) {
            checkbox.checked = true;
          }
        });
      }
      
      // Atualizar título da página
      document.querySelector('h1').textContent = 'Editar Imóvel';
      document.querySelector('button[type="submit"]').textContent = 'Atualizar Imóvel';
    })
    .catch(error => {
      console.error('Erro ao carregar imóvel para edição:', error);
      showAlert('Erro ao carregar imóvel para edição', 'error');
      
      // Redirecionar para a lista após um breve delay
      setTimeout(() => {
        window.location.href = 'imoveis.html';
      }, 1500);
    });
}

// Função para inicializar o formulário de novo imóvel
export function initNewPropertyForm() {
  if (!window.location.pathname.includes('novo-imovel.html')) return;
  
  console.log('Inicializando formulário de novo imóvel');
  
  // Inicializar o gerenciador de vídeos com todos os parâmetros necessários
  initVideoManager('video-preview', 'video-url', 'video-title', 'add-video-btn');
  console.log('Gerenciador de vídeos inicializado');
  
  // Verificar se a variável global de vídeos está acessível
  setTimeout(() => {
    console.log('Status dos vídeos pendentes:', window.pendingVideos);
  }, 1000);
  
  // Registrar evento de envio do formulário
  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', handlePropertyForm);
  }
}

// Exportar funções
export {
  // loadProperties,
  deleteProperty,
  handlePropertyForm,
  loadPropertyForEditing
}; 