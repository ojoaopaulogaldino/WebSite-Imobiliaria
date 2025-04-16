/**
 * Arquivo JavaScript para o painel administrativo
 */

// URL base da API
const API_BASE_URL = '/api';

// Verificar se o usuário está autenticado
function checkAuth() {
  const user = getLoggedUser();
  
  // Se não tiver usuário e não estiver na página de login, redirecionar para login
  if (!user && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
    return false;
  }
  
  return true;
}

// Obter usuário logado do localStorage
function getLoggedUser() {
  const userData = localStorage.getItem('admin_user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch (error) {
    console.error('Erro ao ler dados do usuário:', error);
    return null;
  }
}

// Salvar usuário no localStorage
function saveUser(user) {
  localStorage.setItem('admin_user', JSON.stringify(user));
}

// Fazer logout
function logout() {
  localStorage.removeItem('admin_user');
  window.location.href = 'login.html';
}

// Lidar com o login do usuário
function handleLogin(event) {
  event.preventDefault();
  
  const form = event.target;
  const username = form.querySelector('#username').value;
  const password = form.querySelector('#password').value;
  
  if (!username || !password) {
    showAlert('Preencha o nome de usuário e senha', 'error');
    return;
  }
  
  // Desabilitar o botão de login
  const loginButton = form.querySelector('button[type="submit"]');
  if (loginButton) {
    loginButton.disabled = true;
    loginButton.textContent = 'Entrando...';
  }
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }
      return response.json();
    })
    .then(data => {
      // Salvar usuário e redirecionar
      saveUser(data.user);
      window.location.href = 'index.html';
    })
    .catch(error => {
      console.error('Erro ao fazer login:', error);
      showAlert('Nome de usuário ou senha incorretos', 'error');
      
      // Reabilitar o botão
      if (loginButton) {
        loginButton.disabled = false;
        loginButton.textContent = 'Entrar';
      }
    });
}

// Mostrar mensagem de alerta
function showAlert(message, type = 'success', duration = 3000) {
  const alertContainer = document.getElementById('alertContainer');
  
  if (!alertContainer) {
    // Criar container de alerta se não existir
    const newAlertContainer = document.createElement('div');
    newAlertContainer.id = 'alertContainer';
    newAlertContainer.className = 'fixed top-4 right-4 z-50 transition-all duration-300';
    document.body.appendChild(newAlertContainer);
    
    // Usar o container recém-criado
    showAlert(message, type, duration);
    return;
  }
  
  // Criar elemento de alerta
  const alert = document.createElement('div');
  alert.className = `mb-4 p-4 rounded-lg shadow-md transform transition-all duration-300 ease-in-out translate-x-full`;
  
  // Definir cores com base no tipo
  if (type === 'error') {
    alert.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
  } else if (type === 'warning') {
    alert.classList.add('bg-yellow-100', 'border', 'border-yellow-400', 'text-yellow-700');
  } else {
    alert.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
  }
  
  // Conteúdo do alerta
  alert.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button class="ml-4 text-xl font-bold">&times;</button>
    </div>
  `;
  
  // Adicionar ao container
  alertContainer.appendChild(alert);
  
  // Animar entrada
  setTimeout(() => {
    alert.classList.remove('translate-x-full');
  }, 10);
  
  // Configurar botão de fechar
  const closeButton = alert.querySelector('button');
  closeButton.addEventListener('click', () => {
    alert.classList.add('translate-x-full');
    setTimeout(() => {
      alertContainer.removeChild(alert);
    }, 300);
  });
  
  // Auto-fechar após o tempo definido
  setTimeout(() => {
    if (alert.parentNode === alertContainer) {
      alert.classList.add('translate-x-full');
      setTimeout(() => {
        if (alert.parentNode === alertContainer) {
          alertContainer.removeChild(alert);
        }
      }, 300);
    }
  }, duration);
}

// Carregar lista de imóveis
function loadProperties() {
  if (!window.location.pathname.includes('imoveis.html')) return;
  
  const tableBody = document.querySelector('.property-list');
  
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
  
  // Exibir mensagem de carregamento
  tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Carregando imóveis...</td></tr>';
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/admin/properties?${queryParams}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar imóveis');
      }
      return response.json();
    })
    .then(data => {
      const properties = data.properties || data; // Compatibilidade com diferentes formatos de resposta
      const totalItems = data.total || properties.length;
      const totalPages = data.totalPages || Math.ceil(totalItems / itemsPerPage);
      
      // Atualizar variáveis de paginação na janela global
      window.totalItems = totalItems;
      window.totalPages = totalPages;
      
      if (properties.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Nenhum imóvel encontrado</td></tr>';
        
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
            <a href="javascript:void(0)" onclick="deleteProperty(${property.id})" class="text-red-600 hover:text-red-800">Remover</a>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar imóveis:', error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red-600">Erro ao carregar imóveis: ${error.message}</td></tr>`;
      
      // Atualizar informações de paginação
      updatePaginationInfo(0, 0, 0);
    });
}

// Função para atualizar informações de paginação
function updatePaginationInfo(start, end, total) {
  const rangeStart = document.getElementById('range-start');
  const rangeEnd = document.getElementById('range-end');
  const totalItemsElement = document.getElementById('total-items');
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (rangeStart) rangeStart.textContent = start;
  if (rangeEnd) rangeEnd.textContent = end;
  if (totalItemsElement) totalItemsElement.textContent = total;
  
  // Atualizar estado dos botões de paginação
  if (prevPageBtn) prevPageBtn.disabled = window.currentPage <= 1;
  if (nextPageBtn) nextPageBtn.disabled = window.currentPage >= window.totalPages;
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

// Função para formatar preço
function formatPrice(price) {
  return parseFloat(price).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Carregar lista de contatos
function loadContacts() {
  if (!window.location.pathname.includes('contatos.html')) return;
  
  const tableBody = document.querySelector('.contacts-list tbody');
  
  if (!tableBody) return;
  
  // Exibir mensagem de carregamento
  tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Carregando contatos...</td></tr>';
  
  // Fazer requisição para a API
  fetch(`${API_BASE_URL}/admin/contacts`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar contatos');
      }
      return response.json();
    })
    .then(contacts => {
      if (contacts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Nenhum contato recebido</td></tr>';
        return;
      }
      
      // Limpar a tabela
      tableBody.innerHTML = '';
      
      // Adicionar contatos à tabela
      contacts.forEach(contact => {
        const row = document.createElement('tr');
        
        // Formatar data
        const date = new Date(contact.created_at);
        const formattedDate = date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
        
        // Status com cores
        let statusClass = 'bg-blue-100 text-blue-800';
        let statusText = 'Novo';
        
        if (contact.status === 'respondido') {
          statusClass = 'bg-green-100 text-green-800';
          statusText = 'Respondido';
        } else if (contact.status === 'em_andamento') {
          statusClass = 'bg-yellow-100 text-yellow-800';
          statusText = 'Em Andamento';
        } else if (contact.status === 'arquivado') {
          statusClass = 'bg-gray-100 text-gray-800';
          statusText = 'Arquivado';
        }
        
        // Criar a linha da tabela
        row.innerHTML = `
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${contact.name}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${contact.email}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${contact.phone}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${contact.property_title || 'Contato Geral'}</td>
          <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-700">${formattedDate}</td>
          <td class="px-4 py-4 whitespace-nowrap">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
              ${statusText}
            </span>
          </td>
          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
            <a href="ver-contato.html?id=${contact.id}" class="text-[#1E5DBC] hover:text-indigo-800 mr-3">Ver Detalhes</a>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      console.error('Erro ao carregar contatos:', error);
      tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-red-600">Erro ao carregar contatos</td></tr>';
    });
}

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
      document.getElementById('total-properties').textContent = totalProperties;
      document.getElementById('active-properties').textContent = activeProperties;
      document.getElementById('sold-properties').textContent = soldProperties;
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
      document.getElementById('total-contacts').textContent = totalContacts;
      document.getElementById('new-contacts').textContent = newContacts;
    })
    .catch(error => {
      console.error('Erro ao carregar dados de contatos:', error);
    });
}

// Enviar formulário de novo imóvel
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
      showAlert(isEditing ? 'Imóvel atualizado com sucesso' : 'Imóvel adicionado com sucesso', 'success');
      
      // Redirecionar para a lista de imóveis após um breve delay
      setTimeout(() => {
        window.location.href = 'imoveis.html';
      }, 1500);
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

// Função auxiliar para formatar o tipo de imóvel
function formatPropertyType(type) {
  const types = {
    'venda': 'Venda',
    'aluguel': 'Aluguel',
    'lancamento': 'Lançamento'
  };
  
  return types[type] || type;
}

// Inicializar o painel administrativo
document.addEventListener('DOMContentLoaded', function() {
  // Verificar se o usuário está logado (exceto na página de login)
  if (!window.location.pathname.includes('login.html')) {
    const isAuthenticated = checkAuth();
    if (!isAuthenticated) return;
    
    // Adicionar handler para logout
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
      logoutButton.addEventListener('click', function(event) {
        event.preventDefault();
        logout();
      });
    }
    
    // Preencher nome do usuário logado
    const user = getLoggedUser();
    const userNameElement = document.getElementById('user-name');
    if (userNameElement && user) {
      userNameElement.textContent = user.name;
    }
  }
  
  // Configurar formulário de login
  const loginForm = document.querySelector('form[action="index.html"]');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Carregar dados para o dashboard
  loadDashboardData();
  
  // Carregar lista de imóveis
  loadProperties();
  
  // Carregar lista de contatos
  loadContacts();
  
  // Configurar formulário de imóvel - edição
  const propertyForm = document.querySelector('form[action="imoveis.html"]');
  if (propertyForm) {
    propertyForm.addEventListener('submit', handlePropertyForm);
    
    // Se for a página de edição, carregar dados do imóvel
    if (window.location.pathname.includes('editar-imovel.html')) {
      loadPropertyForEditing();
    }
  }
  
  // Configurar formulário de novo imóvel
  const newPropertyForm = document.getElementById('propertyForm');
  if (newPropertyForm && window.location.pathname.includes('novo-imovel.html')) {
    console.log("Formulário de novo imóvel encontrado no carregamento do admin.js");
    newPropertyForm.addEventListener('submit', handlePropertyForm);
  }
}); 